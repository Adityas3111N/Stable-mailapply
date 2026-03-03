import React from "react";

interface CardProps {
    children: React.ReactNode;
    className?: string;
    glass?: boolean;
    hoverable?: boolean;
}

export default function Card({
    children,
    className = "",
    glass = false,
    hoverable = false,
}: CardProps) {
    return (
        <div
            className={`
        rounded-2xl p-6
        ${glass ? "glass-card" : "bg-white border border-slate-200"}
        ${hoverable ? "transition-all duration-300 hover:-translate-y-1 hover:shadow-soft" : "shadow-sm"}
        ${className}
      `}
        >
            {children}
        </div>
    );
}

export function CardHeader({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={`mb-4 ${className}`}>
            {children}
        </div>
    );
}

export function CardTitle({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <h3 className={`text-lg font-semibold text-slate-900 ${className}`}>
            {children}
        </h3>
    );
}

export function CardDescription({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <p className={`text-sm text-slate-500 mt-1 ${className}`}>
            {children}
        </p>
    );
}

export function CardContent({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={className}>
            {children}
        </div>
    );
}
