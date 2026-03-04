import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import Job, { IJob } from "@/models/Job";
import Email from "@/models/Email";

// Core MERN skills get 2x weight in matching
const MERN_CORE_SKILLS = ["mongodb", "express", "react", "node", "node.js", "nodejs"];
const MERN_BONUS_SKILLS = ["javascript", "typescript", "rest", "api", "next.js", "nextjs", "mongoose", "redux", "jwt"];

// Score a job against a user's skills (0–100)
function scoreJob(job: IJob, skills: string[]): number {
    if (!skills.length) return 0;
    const descLower = (job.title + " " + job.description).toLowerCase();

    let score = 0;
    let maxScore = 0;

    for (const skill of skills) {
        const s = skill.toLowerCase();
        const isCoreSkill = MERN_CORE_SKILLS.includes(s);
        const weight = isCoreSkill ? 2 : 1;
        maxScore += weight;
        if (descLower.includes(s)) score += weight;
    }

    let pct = maxScore > 0 ? (score / maxScore) * 80 : 0;

    // +10 if title has a MERN core keyword
    if (MERN_CORE_SKILLS.some((k) => job.title.toLowerCase().includes(k))) pct += 10;
    // +5 for bonus MERN skills in description
    if (MERN_BONUS_SKILLS.some((k) => descLower.includes(k))) pct += 5;
    // +5 for remote jobs
    if (job.remote) pct += 5;

    return Math.min(Math.round(pct), 100);
}

// GET /api/jobs — returns ALL matched jobs ranked by match score, filtered by user preferences
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (!user.role?.trim() && !user.skills?.length) {
            return NextResponse.json({
                jobs: [],
                message: "Please set your role and skills in your profile to see matched jobs.",
            });
        }

        const prefs = user.jobPreferences ?? { workMode: "any", preferredCountries: [], jobType: "any" };

        // Find companies already emailed by this user
        const sentEmails = await Email.find({ userId: user._id }).select("companyName").lean();
        const alreadyAppliedTo = new Set(
            sentEmails.map((e) => (e as { companyName?: string }).companyName?.toLowerCase() ?? "")
        );

        // Fetch all recently cached jobs
        const dbQuery: Record<string, unknown> = {
            fetchedAt: { $gte: new Date(Date.now() - 48 * 60 * 60 * 1000) },
        };

        // Hard filter: workMode
        if (prefs.workMode === "remote") {
            dbQuery.remote = true;
        } else if (prefs.workMode === "onsite") {
            dbQuery.remote = false;
        }

        const allJobs = await Job.find(dbQuery).limit(500).lean();

        // Country filter: if user has preferred countries set, exclude in-office jobs from other countries
        const preferredCountries = (prefs.preferredCountries ?? []).map((c: string) => c.toUpperCase());

        const filtered = allJobs.filter((j) => {
            // Skip already-applied companies
            if (alreadyAppliedTo.has(j.company.toLowerCase())) return false;

            // Country filter: if user set preferences AND job has a country
            if (preferredCountries.length > 0 && j.country) {
                const jobCountry = j.country.toUpperCase();
                const countryAllowed = preferredCountries.includes(jobCountry);
                // Remote jobs are always allowed regardless of country
                if (!countryAllowed && !j.remote) return false;
            }

            return true;
        });

        // Score and rank — return ALL matching jobs (no limit)
        const scored = filtered
            .map((j) => ({
                ...j,
                matchScore: scoreJob(j as IJob, user.skills ?? []),
                matchedSkills: (user.skills ?? []).filter((s: string) =>
                    (j.title + " " + j.description).toLowerCase().includes(s.toLowerCase())
                ),
            }))
            .sort((a, b) => b.matchScore - a.matchScore);

        return NextResponse.json({ jobs: scored, total: scored.length });
    } catch (error) {
        console.error("Jobs fetch error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
