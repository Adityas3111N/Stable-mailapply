import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export default function Input({
    label,
    error,
    helperText,
    className = "",
    id,
    ...props
}: InputProps) {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                    {label}
                </label>
            )}
            <input
                id={inputId}
                className={`
          w-full px-4 py-2.5 text-sm
          bg-white text-slate-900
          border rounded-xl
          placeholder:text-slate-400
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-1
          ${error
                        ? "border-danger-500 focus:ring-danger-500/30"
                        : "border-slate-200 focus:border-primary-500 focus:ring-primary-500/30"
                    }
          ${className}
        `}
                {...props}
            />
            {error && (
                <p className="mt-1 text-xs text-danger-500">{error}</p>
            )}
            {helperText && !error && (
                <p className="mt-1 text-xs text-slate-400">{helperText}</p>
            )}
        </div>
    );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export function Textarea({
    label,
    error,
    className = "",
    id,
    ...props
}: TextareaProps) {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                    {label}
                </label>
            )}
            <textarea
                id={inputId}
                className={`
          w-full px-4 py-2.5 text-sm
          bg-white text-slate-900
          border rounded-xl
          placeholder:text-slate-400
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-1
          resize-y min-h-[100px]
          ${error
                        ? "border-danger-500 focus:ring-danger-500/30"
                        : "border-slate-200 focus:border-primary-500 focus:ring-primary-500/30"
                    }
          ${className}
        `}
                {...props}
            />
            {error && (
                <p className="mt-1 text-xs text-danger-500">{error}</p>
            )}
        </div>
    );
}
