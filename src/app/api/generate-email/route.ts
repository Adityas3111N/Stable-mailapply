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
    const skillsList = profile.skills.slice(0, 3).join(", ");
    const expText = profile.experience && profile.experience !== "0"
        ? `${profile.experience} year${profile.experience === "1" ? "" : "s"} of experience`
        : "a fresher eager to prove myself";

    // Build a job-specific hook if job description is available
    const jobHook = company.jobDescription
        ? `I came across the ${company.jobTitle} role at ${company.companyName} and the focus on ${company.jobDescription.split(" ").slice(0, 8).join(" ")}... immediately caught my attention.`
        : `I came across the ${company.jobTitle} role at ${company.companyName} and couldn\u2019t help but reach out directly.`;

    const subject = `${profile.name} \u2014 ${skillsList || profile.role} \u2014 ${company.jobTitle} at ${company.companyName}`;

    const body = [
        `Hi ${greeting(recruiter)},`,
        "",
        jobHook,
        "",
        `I bring ${expText} in ${skillsList || profile.role || "my field"}.${profile.bio ? " " + profile.bio : ""}`,
        "",
        `I\u2019d love a quick 15-minute chat to show you how I can contribute. I\u2019ve attached my resume for reference.`,
        "",
        "Looking forward to connecting,",
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

    const jobDescSnippet = company.jobDescription
        ? company.jobDescription.slice(0, 800)
        : "";

    const prompt = `You are an expert cold email writer helping job seekers stand out. Write a concise, personalized cold outreach email for a job application.

APPLICANT
- Name: ${profile.name}
- Target Role: ${profile.role}
- Experience: ${profile.experience || "entry level / fresher"}
- Top Skills: ${profile.skills.join(", ") || "(not specified)"}
- About: ${profile.bio || "(no bio provided)"}

TARGET
- Company: ${company.companyName}
- Position applied for: ${company.jobTitle}
- Recruiter: ${recruiterGreeting}
${jobDescSnippet ? `- Job Description Snippet:\n${jobDescSnippet}` : ""}

RULES (follow strictly):
1. Email body must be under 180 words.
2. NEVER start with "I hope this finds you well" or "I am writing to express my interest" — use a punchy, specific opener instead.
3. The body MUST reference at least one specific thing from the job description or company (if provided). Do not be generic.
4. Subject line must be specific and compelling — include the applicant's name and one differentiating fact (a skill, a specific stack, a project type). NEVER use generic subjects like "Job Application" or "Regarding the position".
5. Address the recruiter by first name: "${recruiterGreeting}".
6. End with a clear, confident call to action.
7. Do NOT add the subject line inside the email body.
8. Tone: confident, human, direct — NOT robotic or overly formal.
9. If the applicant's skills include React, Node.js, MongoDB, or Express, treat this as a full-stack MERN developer — emphasise end-to-end product ownership: "I can take a feature from database schema to polished React UI independently." Tailor this naturally to the role.

Return ONLY valid JSON in this exact format:
{"subject": "...", "body": "..."}`;

    const completion = await openai.chat.completions.create({
        model: process.env.AI_MODEL ?? "openai/gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: "You write highly personalized, effective cold outreach emails. Return only valid JSON with keys \"subject\" and \"body\".",
            },
            { role: "user", content: prompt },
        ],
        temperature: 0.75,
        max_tokens: 600,
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

        const useAI = Boolean(process.env.OPENROUTER_API_KEY);
        let openaiClient: import("openai").default | null = null;
        if (useAI) {
            const OpenAI = (await import("openai")).default;
            openaiClient = new OpenAI({
                apiKey: process.env.OPENROUTER_API_KEY,
                baseURL: "https://openrouter.ai/api/v1",
                defaultHeaders: {
                    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001",
                    "X-Title": "MailApply",
                },
            });
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
