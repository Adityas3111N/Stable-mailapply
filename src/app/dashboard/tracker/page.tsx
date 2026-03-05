"use client";

import { useState, useEffect } from "react";

type Status = "sent" | "replied" | "interview" | "assignment" | "rejected" | "offer";

interface Application {
    _id: string;
    companyName: string;
    jobTitle: string;
    recruiterEmail: string;
    subject: string;
    status: Status;
    createdAt: string;
    replySnippet?: string;
}

const COLUMNS: { key: Status; label: string; color: string; bg: string; dotColor: string }[] = [
    { key: "sent", label: "Applied", color: "text-blue-700", bg: "bg-blue-50", dotColor: "bg-blue-400" },
    { key: "replied", label: "Replied", color: "text-purple-700", bg: "bg-purple-50", dotColor: "bg-purple-400" },
    { key: "interview", label: "Interview", color: "text-green-700", bg: "bg-green-50", dotColor: "bg-green-500" },
    { key: "assignment", label: "Assignment", color: "text-orange-700", bg: "bg-orange-50", dotColor: "bg-orange-400" },
    { key: "rejected", label: "Rejected", color: "text-red-700", bg: "bg-red-50", dotColor: "bg-red-400" },
    { key: "offer", label: "🎉 Offer", color: "text-emerald-700", bg: "bg-emerald-50", dotColor: "bg-emerald-500" },
];

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days}d ago`;
}

function ApplicationCard({
    app,
    onStatusChange,
}: {
    app: Application;
    onStatusChange: (id: string, status: Status) => void;
}) {
    const [open, setOpen] = useState(false);

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm hover:border-slate-300 transition-all group cursor-pointer"
            onClick={() => setOpen(!open)}>
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 truncate">{app.companyName}</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{app.jobTitle}</p>
                </div>
                <span className="shrink-0 text-[10px] text-slate-400 mt-0.5">{timeAgo(app.createdAt)}</span>
            </div>

            {app.replySnippet && (
                <p className="mt-2 text-xs text-slate-600 italic line-clamp-1">💬 "{app.replySnippet}"</p>
            )}

            {open && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">📧 {app.recruiterEmail}</p>
                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">Subject: {app.subject}</p>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                        Move to
                    </label>
                    <div className="flex flex-wrap gap-1">
                        {COLUMNS.filter((c) => c.key !== app.status).map((col) => (
                            <button
                                key={col.key}
                                onClick={(e) => { e.stopPropagation(); onStatusChange(app._id, col.key); setOpen(false); }}
                                className={`px-2 py-1 rounded-lg text-[10px] font-semibold cursor-pointer transition-colors ${col.color} ${col.bg} hover:opacity-80`}
                            >
                                {col.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function TrackerPage() {
    const [apps, setApps] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch("/api/applications")
            .then((r) => r.json())
            .then((data) => {
                setApps(data.applications ?? []);
            })
            .catch(() => setError("Failed to load applications."))
            .finally(() => setLoading(false));
    }, []);

    // Auto-dismiss errors after 5 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(""), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleStatusChange = async (emailId: string, status: Status) => {
        // Optimistic update
        setApps((prev) => prev.map((a) => a._id === emailId ? { ...a, status } : a));

        try {
            const res = await fetch("/api/applications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ emailId, status }),
            });
            if (!res.ok) {
                // Revert on failure
                setApps((prev) => prev.map((a) => a._id === emailId ? { ...a } : a));
                setError("Failed to update status.");
            }
        } catch {
            setError("Failed to update status.");
        }
    };

    const grouped = COLUMNS.reduce((acc, col) => {
        acc[col.key] = apps.filter((a) => a.status === col.key || (col.key === "sent" && !a.status));
        return acc;
    }, {} as Record<Status, Application[]>);

    const stats = {
        total: apps.length,
        replied: apps.filter((a) => ["replied", "interview", "assignment", "offer"].includes(a.status)).length,
        interviews: apps.filter((a) => a.status === "interview").length,
        offers: apps.filter((a) => a.status === "offer").length,
    };

    return (
        <div className="animate-fade-in">
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900">
                    Application Tracker
                </h1>
                <p className="text-slate-500 mt-1">Track where every application stands.</p>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                {[
                    { label: "Total Applied", value: stats.total, color: "text-blue-600" },
                    { label: "Replies Received", value: stats.replied, color: "text-purple-600" },
                    { label: "Interviews", value: stats.interviews, color: "text-green-600" },
                    { label: "Offers 🎉", value: stats.offers, color: "text-emerald-600" },
                ].map((s) => (
                    <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">{s.label}</p>
                    </div>
                ))}
            </div>

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

            {loading && (
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {COLUMNS.map((col) => (
                        <div key={col.key} className="min-w-[240px] flex-1">
                            <div className="h-8 bg-slate-100 rounded-xl mb-3 animate-pulse" />
                            <div className="space-y-3">
                                <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
                                <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && (
                <div className="flex gap-4 overflow-x-auto pb-6">
                    {COLUMNS.map((col) => {
                        const cards = grouped[col.key] ?? [];
                        return (
                            <div key={col.key} className="min-w-[220px] flex-1">
                                {/* Column header */}
                                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl mb-3 ${col.bg}`}>
                                    <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                                    <span className={`text-xs font-bold ${col.color}`}>{col.label}</span>
                                    <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full ${col.bg} ${col.color}`}>
                                        {cards.length}
                                    </span>
                                </div>

                                {/* Cards */}
                                <div className="space-y-3 min-h-[80px]">
                                    {cards.map((app) => (
                                        <ApplicationCard
                                            key={app._id}
                                            app={app}
                                            onStatusChange={handleStatusChange}
                                        />
                                    ))}
                                    {cards.length === 0 && (
                                        <div className={`rounded-xl border-2 border-dashed border-slate-200 p-4 text-center ${col.bg}`}>
                                            <p className="text-xs text-slate-400">None yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {!loading && apps.length === 0 && !error && (
                <div className="text-center py-8">
                    <p className="text-slate-500 text-sm">
                        No applications yet.{" "}
                        <a href="/dashboard/outreach" className="text-primary-600 font-semibold hover:underline">
                            Start your first outreach →
                        </a>
                    </p>
                </div>
            )}
        </div>
    );
}
