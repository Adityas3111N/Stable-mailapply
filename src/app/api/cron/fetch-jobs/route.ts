import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Job from "@/models/Job";

// MERN-optimized keywords — 5 calls/day × 30 days = 150 calls/month
const SEARCH_KEYWORDS = [
    "MERN Stack Developer",         // exact target role
    "React Node.js Developer",      // most common MERN job title variant
    "Full Stack JavaScript Developer", // broader JS full-stack
    "Software Engineer React",      // SE roles that call out React
    "Remote Full Stack Developer",  // remote-friendly roles
];

const KEYWORD_TO_ROLE: Record<string, string> = {
    "MERN Stack Developer": "Software Engineer",
    "React Node.js Developer": "Software Engineer",
    "Full Stack JavaScript Developer": "Software Engineer",
    "Software Engineer React": "Software Engineer",
    "Remote Full Stack Developer": "Software Engineer",
};

async function fetchJobsForKeyword(keyword: string): Promise<
    { title: string; company: string; location: string; remote: boolean; description: string; applyUrl: string }[]
> {
    const apiKey = process.env.JSEARCH_API_KEY;
    if (!apiKey) return [];

    const url = new URL("https://jsearch.p.rapidapi.com/search");
    url.searchParams.set("query", keyword);
    url.searchParams.set("num_pages", "1"); // 1 page per keyword = 5 calls/day total
    url.searchParams.set("date_posted", "week");

    const res = await fetch(url.toString(), {
        headers: {
            "X-RapidAPI-Key": apiKey,
            "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        },
        next: { revalidate: 0 },
    });

    if (!res.ok) {
        console.error(`JSearch failed for "${keyword}":`, res.status, await res.text());
        return [];
    }

    const data = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jobs = (data.data ?? []) as any[];

    return jobs.map((j) => ({
        title: j.job_title ?? "",
        company: j.employer_name ?? "",
        location: j.job_city ? `${j.job_city}, ${j.job_country}` : (j.job_country ?? ""),
        country: (j.job_country ?? "").toUpperCase(), // e.g. "US", "IN", "GB"
        remote: Boolean(j.job_is_remote),
        description: (j.job_description ?? "").slice(0, 2000),
        applyUrl: j.job_apply_link ?? j.job_google_link ?? "",
    })).filter((j) => j.applyUrl && j.title);
}

// POST /api/cron/fetch-jobs
// Protected by a shared secret so only Vercel Cron (or you manually) can trigger it
export async function POST(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    const expectedToken = `Bearer ${process.env.CRON_SECRET}`;
    if (!process.env.CRON_SECRET || authHeader !== expectedToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    let totalInserted = 0;
    let totalSkipped = 0;

    for (const keyword of SEARCH_KEYWORDS) {
        const role = KEYWORD_TO_ROLE[keyword];
        try {
            const jobs = await fetchJobsForKeyword(keyword);
            for (const job of jobs) {
                try {
                    await Job.updateOne(
                        { applyUrl: job.applyUrl },
                        {
                            $set: {
                                ...job,
                                role, // canonical role bucket for user matching
                                source: "jsearch",
                                fetchedAt: new Date(),
                            },
                        },
                        { upsert: true }
                    );
                    totalInserted++;
                } catch {
                    totalSkipped++; // duplicate applyUrl
                }
            }
        } catch (err) {
            console.error(`Error fetching jobs for "${keyword}":`, err);
        }
    }

    return NextResponse.json({
        ok: true,
        inserted: totalInserted,
        skipped: totalSkipped,
        keywordsProcessed: SEARCH_KEYWORDS.length,
    });
}
