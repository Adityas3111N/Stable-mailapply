"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Job {
    _id: string;
    title: string;
    company: string;
    location: string;
    remote: boolean;
    description: string;
    applyUrl: string;
    matchScore: number;
    matchedSkills: string[];
    role: string;
}

interface AutoApplyPreview {
    subject: string;
    body: string;
    company: string;
    jobTitle: string;
    applyUrl: string;
    jobId: string;
}

interface QuotaInfo {
    used: number;
    limit: number;
    remaining: number;
}

function MatchScoreBar({ score }: { score: number }) {
    const color = score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#94a3b8";
    return (
        <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${score}%`, backgroundColor: color }}
                />
            </div>
            <span className="text-xs font-bold shrink-0" style={{ color }}>{score}% match</span>
        </div>
    );
}

function JobCard({ job, onDraft, onAutoApply }: { job: Job; onDraft: (job: Job) => void; onAutoApply: (job: Job) => void }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-primary-200 transition-all group">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900 leading-snug group-hover:text-primary-700 transition-colors truncate">
                        {job.title}
                    </h3>
                    <p className="text-sm text-slate-600 mt-0.5 font-medium">{job.company}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {job.remote ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                🌐 Remote
                            </span>
                        ) : job.location ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                📍 {job.location}
                            </span>
                        ) : null}
                    </div>
                </div>
                <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 p-2 text-slate-400 hover:text-primary-600 transition-colors"
                    aria-label="View job listing"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                </a>
            </div>

            <MatchScoreBar score={job.matchScore} />

            {job.matchedSkills.length > 0 && (
                <p className="text-xs text-slate-500 mt-2">
                    Matches your{" "}
                    <span className="font-semibold text-slate-700">
                        {job.matchedSkills.slice(0, 3).join(", ")}
                    </span>{" "}
                    skills
                </p>
            )}

            {job.description && (
                <p className="text-xs text-slate-500 mt-3 line-clamp-2 leading-relaxed">
                    {job.description}
                </p>
            )}

            <div className="mt-4 flex gap-2">
                <button
                    onClick={() => onDraft(job)}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 active:scale-95 transition-all cursor-pointer"
                >
                    ✉️ Generate Draft
                </button>
                <button
                    onClick={() => onAutoApply(job)}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-green-600 text-white hover:bg-green-700 active:scale-95 transition-all cursor-pointer"
                >
                    ⚡ Auto Apply
                </button>
                <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                    View
                </a>
            </div>
        </div>
    );
}

export default function JobsPage() {
    const router = useRouter();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // Auto Apply modal state
    const [applyLoading, setApplyLoading] = useState<string | null>(null); // jobId
    const [preview, setPreview] = useState<AutoApplyPreview | null>(null);
    const [quota, setQuota] = useState<QuotaInfo | null>(null);
    const [recruiterEmail, setRecruiterEmail] = useState("");
    const [recruiterName, setRecruiterName] = useState("");
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [confirmSuccess, setConfirmSuccess] = useState("");

    useEffect(() => {
        fetch("/api/jobs")
            .then((r) => r.json())
            .then((data) => {
                if (data.error) {
                    setError(data.error);
                } else {
                    setJobs(data.jobs ?? []);
                    if (data.quota) setQuota(data.quota);
                    if (data.message) setMessage(data.message);
                }
            })
            .catch(() => setError("Failed to load jobs."))
            .finally(() => setLoading(false));
    }, []);

    // Auto-dismiss errors after 5 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(""), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleDraft = (job: Job) => {
        const params = new URLSearchParams({
            company: job.company,
            title: job.title,
            description: job.description.slice(0, 800),
            applyUrl: job.applyUrl,
        });
        router.push(`/dashboard/outreach?${params.toString()}`);
    };

    const handleAutoApply = async (job: Job) => {
        setError("");
        setApplyLoading(job._id);
        try {
            const res = await fetch("/api/auto-apply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ jobId: job._id }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error ?? "Auto Apply failed");
                return;
            }
            setPreview(data.preview);
            setQuota(data.quota);
            setRecruiterEmail("");
            setRecruiterName("");
            setConfirmSuccess("");
        } catch {
            setError("Something went wrong.");
        } finally {
            setApplyLoading(null);
        }
    };

    const handleConfirmSend = async () => {
        if (!preview || !recruiterEmail.trim()) return;
        setConfirmLoading(true);
        try {
            // Send the email
            const sendRes = await fetch("/api/send-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    emails: [{ to: recruiterEmail, subject: preview.subject, message: preview.body }],
                    companyName: preview.company,
                    jobTitle: preview.jobTitle,
                    outreachId: undefined,
                }),
            });
            if (!sendRes.ok) {
                const d = await sendRes.json();
                setError(d.error ?? "Failed to send");
                return;
            }
            // Increment the quota counter
            await fetch("/api/auto-apply", { method: "PATCH" });
            setConfirmSuccess(`✅ Application sent to ${recruiterEmail}!`);
            setPreview(null);
        } catch {
            setError("Failed to send email.");
        } finally {
            setConfirmLoading(false);
        }
    };

    return (
        <>
            <div className="max-w-2xl animate-fade-in">
                <div className="mb-8 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900">
                            Recommended Jobs
                        </h1>
                        <p className="text-slate-500 mt-1">
                            Top matches based on your skills and role. Updated twice daily.
                        </p>
                    </div>
                    <span className="shrink-0 mt-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-100 text-primary-700">
                        Today
                    </span>
                </div>

                {loading && (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
                                <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                                <div className="h-3 bg-slate-100 rounded w-1/2 mb-4" />
                                <div className="h-1.5 bg-slate-100 rounded w-full" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Error Toast */}
                {error && (
                    <div className="fixed top-20 left-1/2 -translate-x-1/2 md:left-auto md:right-8 md:translate-x-0 z-[100] animate-slide-up flex items-center gap-3 bg-white px-4 py-3 rounded-2xl shadow-xl border border-danger-200">
                        <div className="w-8 h-8 rounded-full bg-danger-100 flex items-center justify-center shrink-0">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-danger-600">
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>
                        <p className="text-sm font-semibold text-danger-700">{error}</p>
                        <button onClick={() => setError("")} className="ml-2 pr-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                    </div>
                )}

                {!loading && !error && message && jobs.length === 0 && (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                            </svg>
                        </div>
                        <h3 className="text-slate-700 font-semibold">{message}</h3>
                        <Link href="/dashboard/profile" className="mt-3 inline-block text-sm font-semibold text-primary-600 hover:text-primary-700">
                            Complete your profile →
                        </Link>
                    </div>
                )}

                {!loading && !error && jobs.length === 0 && !message && (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                            </svg>
                        </div>
                        <h3 className="text-slate-700 font-semibold">No jobs available yet</h3>
                        <p className="text-slate-500 text-sm mt-1">
                            The job feed refreshes at 6 AM and 6 PM daily. Check back soon!
                        </p>
                    </div>
                )}

                {!loading && jobs.length > 0 && (
                    <div className="space-y-4">
                        {quota && (
                            <div className="flex items-center justify-between px-1">
                                <span className="text-xs font-semibold text-slate-500">Auto Apply Quota</span>
                                <span className="text-xs font-bold text-slate-700">{quota.used} / {quota.limit} used today</span>
                            </div>
                        )}
                        {confirmSuccess && (
                            <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium">{confirmSuccess}</div>
                        )}
                        {jobs.map((job) => (
                            <JobCard key={job._id} job={job} onDraft={handleDraft} onAutoApply={handleAutoApply} />
                        ))}

                        <div className="text-center pt-4">
                            <p className="text-xs text-slate-400">
                                Showing your top {jobs.length} match{jobs.length !== 1 ? "es" : ""} for today.
                                Refreshes at 6 AM and 6 PM.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Auto Apply Preview Modal */}
            {preview && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setPreview(null)}>
                    <div
                        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 animate-fade-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-900">Review Before Sending</h2>
                            <button onClick={() => setPreview(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                        </div>

                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Recruiter Email *</label>
                            <input
                                type="email"
                                value={recruiterEmail}
                                onChange={(e) => setRecruiterEmail(e.target.value)}
                                placeholder="recruiter@company.com"
                                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Subject</label>
                            <p className="text-sm text-slate-700 px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200">{preview.subject}</p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Email Body</label>
                            <div className="text-sm text-slate-700 px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 whitespace-pre-wrap max-h-48 overflow-y-auto">
                                {preview.body}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setPreview(null)}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmSend}
                                disabled={!recruiterEmail.trim() || confirmLoading}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                            >
                                {confirmLoading ? "Sending..." : "✅ Confirm & Send"}
                            </button>
                        </div>
                        {quota && (
                            <p className="text-center text-xs text-slate-400 mt-3">{quota.remaining - 1} auto-applies remaining after this.</p>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
