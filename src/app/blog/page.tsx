import Link from "next/link";
import { getSortedPostsData } from "@/lib/blog";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";

export const metadata = {
    title: "Blog | MailApply",
    description: "Expert advice on job outreach, cold emailing, and career growth.",
};

export default function BlogIndex() {
    const posts = getSortedPostsData();

    return (
        <div className="bg-slate-50 min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-grow pt-32 pb-24">
                <div className="max-w-5xl mx-auto px-6">
                    <header className="mb-16 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold font-heading text-slate-900 mb-4">
                            Resources & Insights
                        </h1>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-6">
                            Master the art of job outreach. Tips from recruiters and career experts on how to land your next role.
                        </p>
                        <Link href="/blog/new">
                            <Button variant="outline" size="sm">
                                ✍️ Write New Article
                            </Button>
                        </Link>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post) => (
                            <Link
                                key={post.slug}
                                href={`/blog/${post.slug}`}
                                className="group bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl hover:border-primary-200 transition-all duration-300 flex flex-col"
                            >
                                {post.coverImage && (
                                    <div className="aspect-video overflow-hidden">
                                        <img
                                            src={post.coverImage}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                )}
                                <div className="p-6 flex flex-col flex-grow">
                                    <span className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-3">
                                        {post.category}
                                    </span>
                                    <h2 className="text-xl font-bold text-slate-900 leading-snug mb-3 group-hover:text-primary-700 transition-colors">
                                        {post.title}
                                    </h2>
                                    <p className="text-sm text-slate-500 line-clamp-3 mb-6 flex-grow">
                                        {post.excerpt}
                                    </p>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                        <span className="text-xs text-slate-400 font-medium">{post.date}</span>
                                        <span className="text-sm font-bold text-primary-600 group-hover:translate-x-1 transition-transform">
                                            Read More →
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {posts.length === 0 && (
                        <div className="text-center py-24">
                            <p className="text-slate-500">No articles published yet. Check back soon!</p>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
