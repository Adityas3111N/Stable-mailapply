"use client";

import Link from "next/link";
import { useState } from "react";
import Button from "@/components/ui/Button";

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold font-heading text-slate-900 group-hover:text-primary-600 transition-colors">
                            MailApply
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link
                            href="/features"
                            className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors"
                        >
                            Features
                        </Link>
                        <Link
                            href="/pricing"
                            className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors"
                        >
                            Pricing
                        </Link>
                        <div className="flex items-center gap-3 ml-4">
                            <Link href="/login">
                                <Button variant="ghost" size="sm">
                                    Log in
                                </Button>
                            </Link>
                            <Link href="/signup">
                                <Button variant="primary" size="sm">
                                    Get Started Free
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Mobile Hamburger */}
                    <button
                        className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Toggle menu"
                    >
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        >
                            {mobileOpen ? (
                                <>
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </>
                            ) : (
                                <>
                                    <line x1="4" y1="6" x2="20" y2="6" />
                                    <line x1="4" y1="12" x2="20" y2="12" />
                                    <line x1="4" y1="18" x2="20" y2="18" />
                                </>
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden border-t border-slate-100 bg-white animate-fade-in">
                    <div className="px-4 py-4 flex flex-col gap-3">
                        <Link
                            href="/features"
                            className="text-sm font-medium text-slate-600 hover:text-primary-600 py-2"
                            onClick={() => setMobileOpen(false)}
                        >
                            Features
                        </Link>
                        <Link
                            href="/pricing"
                            className="text-sm font-medium text-slate-600 hover:text-primary-600 py-2"
                            onClick={() => setMobileOpen(false)}
                        >
                            Pricing
                        </Link>
                        <hr className="border-slate-100" />
                        <Link href="/login" onClick={() => setMobileOpen(false)}>
                            <Button variant="ghost" size="sm" className="w-full">
                                Log in
                            </Button>
                        </Link>
                        <Link href="/signup" onClick={() => setMobileOpen(false)}>
                            <Button variant="primary" size="sm" className="w-full">
                                Get Started Free
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
