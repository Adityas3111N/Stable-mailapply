"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const navItems = [
    {
        label: "Overview",
        href: "/dashboard",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
            </svg>
        ),
    },
    {
        label: "Profile",
        href: "/dashboard/profile",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
        ),
    },
    {
        label: "Outreach",
        href: "/dashboard/outreach",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
            </svg>
        ),
    },
    {
        label: "History",
        href: "/dashboard/history",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
        ),
    },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { data: session } = useSession();

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 fixed top-0 left-0 bottom-0 z-40">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 px-6 h-16 border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                        </svg>
                    </div>
                    <span className="text-lg font-bold font-heading text-slate-900">
                        MailApply
                    </span>
                </Link>

                {/* Nav Items */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive =
                            item.href === "/dashboard"
                                ? pathname === "/dashboard"
                                : pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${isActive
                                        ? "bg-primary-50 text-primary-700 shadow-sm"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    }
                `}
                            >
                                <span className={isActive ? "text-primary-600" : "text-slate-400"}>
                                    {item.icon}
                                </span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Info */}
                <div className="p-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
                            {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                                {session?.user?.name || "User"}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                                {session?.user?.email || ""}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full text-left px-3 py-2 text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                    >
                        Log out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-between px-4 h-14 bg-white border-b border-slate-200 sticky top-0 z-30">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                            </svg>
                        </div>
                        <span className="text-base font-bold font-heading text-slate-900">MailApply</span>
                    </Link>
                </div>

                {/* Mobile Bottom Nav */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30">
                    <div className="flex items-center justify-around py-2">
                        {navItems.map((item) => {
                            const isActive =
                                item.href === "/dashboard"
                                    ? pathname === "/dashboard"
                                    : pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex flex-col items-center gap-1 py-1 px-3 ${isActive ? "text-primary-600" : "text-slate-400"
                                        }`}
                                >
                                    {item.icon}
                                    <span className="text-[10px] font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Page Content */}
                <div className="p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
