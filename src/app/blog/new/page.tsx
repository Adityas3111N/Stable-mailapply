"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function NewBlogPost() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    if (status === "loading") return null;

    if (!session) {
        router.push("/login");
        return null;
    }

    const [formData, setFormData] = useState({
        title: "",
        excerpt: "",
        content: "",
        category: "Career Advice",
        author: "MailApply Team",
        coverImage: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/blog", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Failed to create post");
            } else {
                setSuccess("Post created successfully! Redirecting...");
                setTimeout(() => {
                    router.push(`/blog/${data.slug}`);
                }, 2000);
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-grow pt-32 pb-24">
                <div className="max-w-3xl mx-auto px-6">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold font-heading text-slate-900">Write New Article</h1>
                        <p className="text-slate-500 mt-1">Create a new article for the MailApply blog.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-danger-100 text-danger-700 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 rounded-xl bg-success-100 text-success-700 text-sm font-medium">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
                            <Input
                                label="Title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="How to get hired..."
                                required
                            />

                            <Input
                                label="Excerpt (Brief Summary)"
                                value={formData.excerpt}
                                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                placeholder="A short 1-2 sentence hook..."
                                required
                            />

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Content (Markdown Supported)</label>
                                <textarea
                                    className="w-full h-80 px-4 py-3 text-sm bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all font-mono"
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="# My Awesome Heading..."
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Category"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                />
                                <Input
                                    label="Author"
                                    value={formData.author}
                                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                />
                            </div>

                            <Input
                                label="Cover Image URL (Optional)"
                                value={formData.coverImage}
                                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                                placeholder="https://unsplash.com/..."
                            />
                        </div>

                        <div className="flex gap-4">
                            <Button
                                type="submit"
                                variant="primary"
                                className="flex-1"
                                disabled={loading}
                            >
                                {loading ? "Publishing..." : "Publish Article"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
}
