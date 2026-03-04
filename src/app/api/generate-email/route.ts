import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";

interface UserProfile {
    name: string;
    role: string;
    experience: string;
    skills: string[];
    bio: string;
}

interface Recruiter {
    email: string;
    name: string;
}

interface GenerateRequest {
    companyName: string;
    recruiters: Recruiter[];
    jobTitle: string;
    jobDescription?: string;
}

interface EmailResult {
    email: string;
    name: string;
    subject: string;
    body: string;
}

// Build a greeting for one recruiter
function greeting(recruiter: Recruiter): string {
    return recruiter.name?.trim() ? recruiter.name.trim() : "there";
}

// Template-based generation for a single recruiter
function buildTemplateEmail(
    profile: UserProfile,
    company: GenerateRequest,
    recruiter: Recruiter
): { subject: string; body: string } {
    const skillsList = profile.skills.slice(0, 5).join(", ");

    const subject = `Application for ${company.jobTitle} at ${company.companyName} \u2014 ${profile.name}`;

    const body = [
        `Hi ${greeting(recruiter)},`,
        "",
        `I hope this message finds you well. I came across the ${company.jobTitle} opportunity at ${company.companyName} and I\u2019m writing to express my strong interest.`,
        "",
        `${profile.experience
            ? `With ${profile.experience} of experience`
            : "As a motivated professional"} specializing in ${skillsList || profile.role || "my field"}, I believe I would be a great fit for this role.${profile.bio ? "\n\n" + profile.bio : ""}`,
        "",
        `I\u2019d love the opportunity to discuss how my skills can contribute to ${company.companyName}\u2019s goals. I\u2019ve attached my resume for your review.`,
        "",
        "Looking forward to hearing from you.",
        "",
        "Best regards,",
        profile.name,
    ].join("\n");

    return { subject, body };
}

// OpenAI generation for a single recruiter
async function buildAIEmail(
    openai: import("openai").default,
    profile: UserProfile,
    company: GenerateRequest,
    recruiter: Recruiter
): Promise<{ subject: string; body: string }> {
    const recruiterGreeting = greeting(recruiter);

    const promptParts = [
        "Generate a professional job application email with the following details:",
        "",
        "Applicant:",
        `- Name: ${profile.name}`,
        `- Role: ${profile.role}`,
        `- Experience: ${profile.experience}`,
        `- Skills: ${profile.skills.join(", ")}`,
        `- Bio: ${profile.bio}`,
        "",
        "Target:",
        `- Company: ${company.companyName}`,
        `- Position: ${company.jobTitle}`,
        `- Recruiter Name: ${recruiterGreeting}`,
        `- Recruiter Email: ${recruiter.email}`,
        company.jobDescription ? `- Job Description: ${company.jobDescription}` : "",
        "",
        "Requirements:",
        "- Write a concise, professional email (under 200 words)",
        `- Address the recruiter as "${recruiterGreeting}" in the greeting`,
        "- Mention relevant skills for the role",
        "- Mention experience level",
        "- End with a call to action",
        "- Professional but warm tone",
        "- Do NOT include subject line in the body",
        "",
        "Return your response in this exact JSON format:",
        '{"subject": "...", "body": "..."}',
    ];

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: "You are a professional email writer for job applications. Return only valid JSON.",
            },
            { role: "user", content: promptParts.join("\n") },
        ],
        temperature: 0.7,
        max_tokens: 500,
    });

    const content = completion.choices[0]?.message?.content?.trim() || "";
    try {
        const parsed = JSON.parse(content);
        return { subject: parsed.subject, body: parsed.body };
    } catch {
        return buildTemplateEmail(profile, company, recruiter);
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body: GenerateRequest = await req.json();
        const { companyName, recruiters, jobTitle } = body;

        if (!companyName || !jobTitle || !recruiters || recruiters.length === 0) {
            return NextResponse.json(
                { error: "Company name, job title and at least one recruiter are required" },
                { status: 400 }
            );
        }

        await dbConnect();
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const profile: UserProfile = {
            name: user.name,
            role: user.role,
            experience: user.experience,
            skills: user.skills,
            bio: user.bio,
        };

        const useAI = Boolean(process.env.OPENAI_API_KEY);
        let openaiClient: import("openai").default | null = null;
        if (useAI) {
            const OpenAI = (await import("openai")).default;
            openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        }

        // Generate a personalized email for each recruiter
        const emails: EmailResult[] = await Promise.all(
            recruiters.map(async (recruiter) => {
                let result: { subject: string; body: string };
                if (openaiClient) {
                    try {
                        result = await buildAIEmail(openaiClient, profile, body, recruiter);
                    } catch {
                        result = buildTemplateEmail(profile, body, recruiter);
                    }
                } else {
                    result = buildTemplateEmail(profile, body, recruiter);
                }
                return {
                    email: recruiter.email,
                    name: recruiter.name,
                    subject: result.subject,
                    body: result.body,
                };
            })
        );

        return NextResponse.json({ emails });
    } catch (error) {
        console.error("Generate email error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
