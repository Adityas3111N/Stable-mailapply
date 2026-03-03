import React from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

interface BadgeProps {
    variant?: BadgeVariant;
    children: React.ReactNode;
    className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    success: "bg-success-100 text-success-700 border-success-500/20",
    warning: "bg-orange-100 text-orange-700 border-orange-500/20",
    danger: "bg-danger-100 text-danger-700 border-danger-500/20",
    info: "bg-primary-100 text-primary-700 border-primary-500/20",
};

export default function Badge({
    variant = "default",
    children,
    className = "",
}: BadgeProps) {
    return (
        <span
            className={`
        inline-flex items-center gap-1
        px-2.5 py-0.5 text-xs font-medium
        rounded-full border
        ${variantStyles[variant]}
        ${className}
      `}
        >
            {children}
        </span>
    );
}
