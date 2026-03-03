"use client";

import React, { useState, KeyboardEvent } from "react";

interface TagInputProps {
    label?: string;
    tags: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
    maxTags?: number;
}

export default function TagInput({
    label,
    tags,
    onChange,
    placeholder = "Type and press Enter…",
    maxTags = 20,
}: TagInputProps) {
    const [inputValue, setInputValue] = useState("");

    const addTag = (value: string) => {
        const trimmed = value.trim().toLowerCase();
        if (trimmed && !tags.includes(trimmed) && tags.length < maxTags) {
            onChange([...tags, trimmed]);
        }
        setInputValue("");
    };

    const removeTag = (index: number) => {
        onChange(tags.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag(inputValue);
        } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
            removeTag(tags.length - 1);
        }
    };

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {label}
                </label>
            )}
            <div
                className="
          flex flex-wrap gap-2 p-3
          bg-white border border-slate-200 rounded-xl
          focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/30
          transition-all duration-200
        "
            >
                {tags.map((tag, index) => (
                    <span
                        key={tag}
                        className="
              inline-flex items-center gap-1
              px-3 py-1 text-sm font-medium
              bg-primary-100 text-primary-700
              rounded-lg
            "
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="
                ml-1 text-primary-400 hover:text-primary-700
                transition-colors cursor-pointer
              "
                            aria-label={`Remove ${tag}`}
                        >
                            ×
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => inputValue && addTag(inputValue)}
                    placeholder={tags.length === 0 ? placeholder : ""}
                    className="
            flex-1 min-w-[120px] py-1 text-sm
            bg-transparent outline-none
            placeholder:text-slate-400
          "
                />
            </div>
            <p className="mt-1 text-xs text-slate-400">
                {tags.length}/{maxTags} skills added
            </p>
        </div>
    );
}
