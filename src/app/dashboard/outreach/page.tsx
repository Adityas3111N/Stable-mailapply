"use client";

import { useState, FormEvent } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Input";

interface Recruiter {
    email: string;
    name: string;
}

interface PersonalizedEmail {
    email: string;
    name: string;
    subject: string;
    body: string;
}

export default function OutreachPage() {
    // Form state
    const [companyName, setCompanyName] = useState("");
    const [recruiters, setRecruiters] = useState<Recruiter[]>([{ email: "", name: "" }]);
    const [jobTitle, setJobTitle] = useState("");
    const [jobLink, setJobLink] = useState("");
    const [notes, setNotes] = useState("");

    // Email state — one entry per recruiter
    const [personalizedEmails, setPersonalizedEmails] = useState<PersonalizedEmail[]>([]);
    const [activeTab, setActiveTab] = useState(0);
    const [outreachId, setOutreachId] = useState("");

    // UI state
    const [step, setStep] = useState<"form" | "preview">("form");
    const [generating, setGenerating] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ── Recruiter list helpers ──────────────────────────────────────────────────
    const updateRecruiter = (index: number, field: keyof Recruiter, value: string) => {
        setRecruiters((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
    };

    const addRecruiter = () => setRecruiters((prev) => [...prev, { email: "", name: "" }]);

    const removeRecruiter = (index: number) => {
        if (recruiters.length === 1) return;
        setRecruiters((prev) => prev.filter((_, i) => i !== index));
    };

    const updateEmail = (index: number, field: "subject" | "body", value: string) => {
        setPersonalizedEmails((prev) =>
            prev.map((e, i) => (i === index ? { ...e, [field]: value } : e))
        );
    };

    // ── Handlers ───────────────────────────────────────────────────────────────
    const handleGenerate = async (e: FormEvent) => {
        e.preventDefault();
        setError("");

        const validRecruiters = recruiters.filter((r) => r.email.trim());
        if (validRecruiters.length === 0) {
            setError("Please add at least one recruiter email.");
            return;
        }

        setGenerating(true);

        try {
            // 1. Save outreach target
            const outreachRes = await fetch("/api/outreach", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    companyName,
                    recruiters: validRecruiters,
                    jobTitle,
                    jobLink,
                    notes,
                }),
            });

            if (!outreachRes.ok) {
                const data = await outreachRes.json();
                setError(data.error || "Failed to save outreach target");
                return;
            }

            const outreachData = await outreachRes.json();
            setOutreachId(outreachData.outreach._id);

            // 2. Generate a personalized email for every recruiter
            const emailRes = await fetch("/api/generate-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    companyName,
                    recruiters: validRecruiters,
                    jobTitle,
                }),
            });

            if (!emailRes.ok) {
                setError("Failed to generate emails. Please try again.");
                return;
            }

            const emailData = await emailRes.json();
            setPersonalizedEmails(emailData.emails);
            setActiveTab(0);
            setStep("preview");
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setGenerating(false);
        }
    };

    const handleSend = async () => {
        setSending(true);
        setError("");

        try {
            const res = await fetch("/api/send-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    emails: personalizedEmails.map((e) => ({
                        to: e.email,
                        subject: e.subject,
                        message: e.body,
                    })),
                    companyName,
                    jobTitle,
                    outreachId,
                }),
            });

            const data = await res.json();

            if (data.allSent) {
                setSuccess("🎉 All emails sent successfully!");
            } else if (data.success) {
                setSuccess("📋 Emails saved! " + data.message);
            } else {
                setSuccess("📋 " + data.message);
            }

            setTimeout(() => {
                setStep("form");
                setCompanyName("");
                setRecruiters([{ email: "", name: "" }]);
                setJobTitle("");
                setJobLink("");
                setNotes("");
                setPersonalizedEmails([]);
                setOutreachId("");
                setSuccess("");
            }, 4000);
        } catch {
            setError("Failed to send emails. Please try again.");
        } finally {
            setSending(false);
        }
    };

    const handleBack = () => {
        setStep("form");
        setError("");
    };

    const activeEmail = personalizedEmails[activeTab];

    return (
        <div className="max-w-2xl animate-fade-in">
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900">
                    {step === "form" ? "New Outreach" : "Email Preview"}
                </h1>
                <p className="text-slate-500 mt-1">
                    {step === "form"
                        ? "Add company details and generate personalized emails."
                        : "Review and edit each recruiter's personalized email before sending."}
                </p>
            </div>

            {error && (
                <div className="mb-6 p-3 rounded-xl bg-danger-100 text-danger-700 text-sm font-medium animate-fade-in">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-6 p-4 rounded-xl bg-success-100 text-success-700 text-sm font-medium animate-fade-in">
                    {success}
                </div>
            )}

            {step === "form" ? (
                /* ═══════ STEP 1: Company Form ═══════ */
                <form onSubmit={handleGenerate} className="space-y-6">
                    {/* Company info */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
                        <h2 className="text-lg font-semibold text-slate-900">Company Details</h2>

                        <Input
                            label="Company Name"
                            placeholder="e.g. Google, Stripe, Razorpay"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            required
                        />
                        <Input
                            label="Job Title"
                            placeholder="e.g. Frontend Developer, Data Analyst"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            required
                        />
                        <Input
                            label="Job Link (optional)"
                            placeholder="https://company.com/careers/job-id"
                            value={jobLink}
                            onChange={(e) => setJobLink(e.target.value)}
                        />
                        <Textarea
                            label="Notes (optional)"
                            placeholder="Any additional context for the email generation…"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                        />
                    </div>

                    {/* Recruiter list */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900">Recruiting Team</h2>
                            <span className="text-xs text-slate-400">
                                {recruiters.length} contact{recruiters.length !== 1 ? "s" : ""}
                            </span>
                        </div>

                        <div className="space-y-3">
                            {recruiters.map((recruiter, index) => (
                                <div
                                    key={index}
                                    className="relative p-4 rounded-xl bg-slate-50 border border-slate-100"
                                >
                                    {recruiters.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeRecruiter(index)}
                                            className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full bg-slate-200 hover:bg-danger-100 hover:text-danger-600 text-slate-500 text-xs font-bold transition-colors"
                                            title="Remove"
                                        >
                                            ✕
                                        </button>
                                    )}
                                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                                        Recruiter {index + 1}
                                    </div>
                                    <div className="space-y-3 pr-6">
                                        <Input
                                            label="Email"
                                            type="email"
                                            placeholder="recruiter@company.com"
                                            value={recruiter.email}
                                            onChange={(e) => updateRecruiter(index, "email", e.target.value)}
                                            required={index === 0}
                                        />
                                        <Input
                                            label="Name (optional — used in greeting)"
                                            placeholder="e.g. Sarah, John Smith"
                                            value={recruiter.name}
                                            onChange={(e) => updateRecruiter(index, "name", e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={addRecruiter}
                            className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-primary-300 hover:text-primary-500 text-sm font-medium transition-colors"
                        >
                            + Add another recruiter
                        </button>
                    </div>

                    <Button type="submit" variant="cta" size="lg" className="w-full" isLoading={generating}>
                        ✨ Generate {recruiters.filter((r) => r.email.trim()).length > 1
                            ? `${recruiters.filter((r) => r.email.trim()).length} Personalized Emails`
                            : "Email"}
                    </Button>
                </form>
            ) : (
                /* ═══════ STEP 2: Per-recruiter email preview ═══════ */
                <div className="space-y-6">
                    {/* Recruiter tabs */}
                    {personalizedEmails.length > 1 && (
                        <div className="flex gap-2 flex-wrap">
                            {personalizedEmails.map((e, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setActiveTab(i)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === i
                                            ? "bg-primary-600 text-white shadow-sm"
                                            : "bg-white border border-slate-200 text-slate-600 hover:border-primary-300"
                                        }`}
                                >
                                    {e.name?.trim() ? e.name : e.email}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Active email card */}
                    {activeEmail && (
                        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                <h2 className="text-lg font-semibold text-slate-900">
                                    {personalizedEmails.length > 1
                                        ? `Email for ${activeEmail.name?.trim() || activeEmail.email}`
                                        : "Generated Email"}
                                </h2>
                                <span className="text-xs font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                                    To: {activeEmail.email}
                                </span>
                            </div>

                            <Input
                                label="Subject Line"
                                value={activeEmail.subject}
                                onChange={(e) => updateEmail(activeTab, "subject", e.target.value)}
                            />

                            <Textarea
                                label="Email Body"
                                value={activeEmail.body}
                                onChange={(e) => updateEmail(activeTab, "body", e.target.value)}
                                rows={12}
                            />

                            <p className="text-xs text-slate-400">
                                ✏️ Each recruiter&apos;s email is personalized. You can edit before sending.
                            </p>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <Button variant="secondary" size="lg" onClick={handleBack}>
                            ← Back
                        </Button>
                        <Button
                            variant="cta"
                            size="lg"
                            className="flex-1"
                            onClick={handleSend}
                            isLoading={sending}
                        >
                            🚀 Send {personalizedEmails.length > 1
                                ? `${personalizedEmails.length} Emails`
                                : "Email"}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
