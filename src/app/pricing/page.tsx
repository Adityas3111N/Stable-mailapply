import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
    title: "Pricing – MailApply",
    description:
        "Simple, transparent pricing. Start free and upgrade as your job search grows.",
};

const plans = [
    {
        name: "Free",
        price: "$0",
        period: "forever",
        desc: "Perfect for getting started with smart outreach.",
        cta: "Get Started Free",
        ctaVariant: "outline" as const,
        highlighted: false,
        features: [
            "5 emails per month",
            "AI email generation",
            "1 resume upload",
            "Basic CRM dashboard",
            "Email tracking",
        ],
        excluded: [
            "Bulk CSV upload",
            "Email scheduling",
            "Priority support",
            "Analytics dashboard",
        ],
    },
    {
        name: "Pro",
        price: "$9",
        period: "/month",
        desc: "For serious job seekers who want maximum results.",
        cta: "Start Pro Trial →",
        ctaVariant: "cta" as const,
        highlighted: true,
        badge: "Most Popular",
        features: [
            "Unlimited emails",
            "AI email generation (GPT-4o)",
            "Unlimited resume uploads",
            "Full CRM dashboard",
            "Email tracking & status",
            "Bulk CSV upload",
            "Email scheduling",
            "Priority support",
            "Analytics dashboard",
        ],
        excluded: [],
    },
];

export default function PricingPage() {
    return (
        <>
            <Navbar />

            {/* Hero */}
            <section className="pt-28 pb-16 bg-hero-gradient">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
                    <span className="text-sm font-semibold text-primary-600 uppercase tracking-wider">
                        Pricing
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-bold font-heading text-slate-900 mt-3 mb-6">
                        Simple, <span className="text-gradient">Transparent</span> Pricing
                    </h1>
                    <p className="text-lg text-slate-600 max-w-xl mx-auto">
                        Start free. Upgrade when you need more power. No surprises.
                    </p>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="py-20 bg-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {plans.map((plan) => (
                            <div
                                key={plan.name}
                                className={`
                  relative p-8 rounded-3xl border-2 transition-all duration-300
                  ${plan.highlighted
                                        ? "border-primary-600 bg-white shadow-glow scale-[1.02]"
                                        : "border-slate-200 bg-white hover:border-slate-300"
                                    }
                `}
                            >
                                {plan.badge && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="px-4 py-1 text-xs font-bold text-white bg-primary-600 rounded-full uppercase tracking-wider">
                                            {plan.badge}
                                        </span>
                                    </div>
                                )}

                                <div className="text-center mb-8">
                                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                                        {plan.name}
                                    </h3>
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-5xl font-bold font-heading text-slate-900">
                                            {plan.price}
                                        </span>
                                        <span className="text-slate-500 text-sm">
                                            {plan.period}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 mt-3">{plan.desc}</p>
                                </div>

                                <Link href="/signup" className="block mb-8">
                                    <Button
                                        variant={plan.ctaVariant}
                                        size="lg"
                                        className="w-full"
                                    >
                                        {plan.cta}
                                    </Button>
                                </Link>

                                <div className="space-y-3">
                                    {plan.features.map((f) => (
                                        <div key={f} className="flex items-start gap-3">
                                            <svg
                                                className="w-5 h-5 text-success-500 mt-0.5 shrink-0"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={2.5}
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-sm text-slate-700">{f}</span>
                                        </div>
                                    ))}
                                    {plan.excluded.map((f) => (
                                        <div key={f} className="flex items-start gap-3 opacity-40">
                                            <svg
                                                className="w-5 h-5 text-slate-400 mt-0.5 shrink-0"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            <span className="text-sm text-slate-500">{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20 bg-slate-50">
                <div className="max-w-3xl mx-auto px-4 sm:px-6">
                    <h2 className="text-3xl font-bold font-heading text-slate-900 text-center mb-12">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-6">
                        {[
                            {
                                q: "Can I use MailApply for free?",
                                a: "Yes! The free plan lets you send up to 5 emails per month with full AI generation and tracking.",
                            },
                            {
                                q: "Is my email password stored?",
                                a: "Never. We use Gmail OAuth2 which means we never see or store your password. Only a secure token is used.",
                            },
                            {
                                q: "Can I cancel anytime?",
                                a: "Absolutely. No contracts, no commitment. Cancel your Pro subscription at any time.",
                            },
                            {
                                q: "What makes this different from a regular email client?",
                                a: "MailApply auto-generates personalized emails using AI, attaches your resume, and tracks everything in a CRM dashboard — saving you hours every week.",
                            },
                        ].map((faq) => (
                            <div
                                key={faq.q}
                                className="p-6 bg-white rounded-2xl border border-slate-100"
                            >
                                <h3 className="text-base font-semibold text-slate-900 mb-2">
                                    {faq.q}
                                </h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
}
