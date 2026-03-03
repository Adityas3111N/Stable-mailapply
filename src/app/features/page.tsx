import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
    title: "Features – MailApply",
    description:
        "Discover how MailApply helps you generate personalized emails, send them securely, and track your job outreach like a CRM.",
};

const features = [
    {
        category: "Profile & Setup",
        items: [
            {
                title: "One-Time Profile Setup",
                desc: "Enter your skills, role, experience, and resume once. Every email draws from your profile automatically.",
                icon: "👤",
            },
            {
                title: "Resume Upload & Storage",
                desc: "Upload your PDF resume securely to the cloud. It gets attached to every email you send.",
                icon: "📄",
            },
            {
                title: "Skills Tag System",
                desc: "Add and manage your skills with an intuitive tag interface. AI uses these to personalize each email.",
                icon: "🏷️",
            },
        ],
    },
    {
        category: "Email Generation",
        items: [
            {
                title: "AI-Powered Email Writing",
                desc: "Our AI engine uses GPT-4o to craft concise, professional, and personalized emails that stand out.",
                icon: "✨",
            },
            {
                title: "Editable Before Sending",
                desc: "Review and tweak every generated email. You always have full control over what gets sent.",
                icon: "✏️",
            },
            {
                title: "Smart Subject Lines",
                desc: "Automatically generates compelling subject lines that increase open rates.",
                icon: "💡",
            },
        ],
    },
    {
        category: "Sending & Security",
        items: [
            {
                title: "Gmail OAuth2 Integration",
                desc: "Send emails directly from your Google account. We never store your password — only secure OAuth2 tokens.",
                icon: "🔐",
            },
            {
                title: "Auto Resume Attachment",
                desc: "Your resume is automatically attached from Cloudinary storage with every outreach email.",
                icon: "📎",
            },
            {
                title: "Rate-Limited Sending",
                desc: "Built-in send limits to keep your outreach professional and prevent spam flags.",
                icon: "🛡️",
            },
        ],
    },
    {
        category: "Tracking & Dashboard",
        items: [
            {
                title: "Outreach CRM Dashboard",
                desc: "View all your outreach activity: sent, pending, replied, and interview stage — at a glance.",
                icon: "📊",
            },
            {
                title: "Status Management",
                desc: "Update email status manually as you receive responses. Track your pipeline like a recruiter.",
                icon: "📋",
            },
            {
                title: "Search & Filter",
                desc: "Filter outreach by status, company, or date. Quickly find any email you've ever sent.",
                icon: "🔍",
            },
        ],
    },
];

export default function FeaturesPage() {
    return (
        <>
            <Navbar />

            {/* Hero */}
            <section className="pt-28 pb-16 bg-hero-gradient">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
                    <span className="text-sm font-semibold text-primary-600 uppercase tracking-wider">
                        Features
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-bold font-heading text-slate-900 mt-3 mb-6">
                        Built for <span className="text-gradient">Smart</span> Job Seekers
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Everything you need to automate your email outreach and land more interviews — without sacrificing personalization.
                    </p>
                </div>
            </section>

            {/* Feature Sections */}
            {features.map((section, sIdx) => (
                <section
                    key={section.category}
                    className={`py-20 ${sIdx % 2 === 0 ? "bg-white" : "bg-slate-50"}`}
                >
                    <div className="max-w-6xl mx-auto px-4 sm:px-6">
                        <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 mb-12 text-center">
                            {section.category}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {section.items.map((item) => (
                                <div
                                    key={item.title}
                                    className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-soft hover:-translate-y-1 transition-all duration-300"
                                >
                                    <div className="text-3xl mb-4">{item.icon}</div>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            ))}

            {/* CTA */}
            <section className="py-20 bg-primary-600">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold font-heading text-white mb-6">
                        Ready to Try MailApply?
                    </h2>
                    <p className="text-primary-100 mb-8">
                        Start generating personalized emails and tracking your outreach today.
                    </p>
                    <Link href="/signup">
                        <Button variant="cta" size="lg">
                            Get Started Free →
                        </Button>
                    </Link>
                </div>
            </section>

            <Footer />
        </>
    );
}
