import { getPostData, getSortedPostsData } from "@/lib/blog";
import { notFound } from "next/navigation";
import { marked } from "marked";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

export async function generateStaticParams() {
    const posts = getSortedPostsData();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = getPostData(slug);
    if (!post) return { title: "Post Not Found" };

    return {
        title: `${post.title} | MailApply Blog`,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            type: "article",
            images: post.coverImage ? [post.coverImage] : [],
        },
    };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = getPostData(slug);

    if (!post) {
        notFound();
    }

    const htmlContent = marked(post.content);

    return (
        <div className="bg-white min-h-screen">
            <Navbar />

            <main className="pt-32 pb-24">
                <article className="max-w-3xl mx-auto px-6">
                    <Link
                        href="/blog"
                        className="inline-flex items-center text-sm font-semibold text-primary-600 hover:text-primary-700 mb-8 group"
                    >
                        <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> Back to Blog
                    </Link>

                    <header className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-bold uppercase tracking-widest">
                                {post.category}
                            </span>
                            <span className="text-slate-400 text-sm">•</span>
                            <time className="text-slate-400 text-sm font-medium">{post.date}</time>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold font-heading text-slate-900 leading-tight mb-8">
                            {post.title}
                        </h1>

                        <div className="flex items-center gap-4 py-6 border-y border-slate-100">
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                                {post.author[0]}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">{post.author}</p>
                                <p className="text-xs text-slate-500">Author</p>
                            </div>
                        </div>
                    </header>

                    {post.coverImage && (
                        <div className="mb-12 aspect-video rounded-3xl overflow-hidden shadow-2xl">
                            <img
                                src={post.coverImage}
                                alt={post.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    <div
                        className="prose prose-slate prose-lg max-w-none 
              prose-headings:font-heading prose-headings:font-bold prose-headings:text-slate-900
              prose-p:text-slate-600 prose-p:leading-relaxed
              prose-a:text-primary-600 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
              prose-strong:text-slate-900
              prose-ul:list-disc prose-ol:list-decimal
              prose-img:rounded-3xl prose-img:shadow-lg"
                        dangerouslySetInnerHTML={{ __html: htmlContent }}
                    />

                    <div className="mt-16 pt-12 border-t border-slate-100">
                        <div className="bg-primary-50 rounded-3xl p-8 text-center">
                            <h3 className="text-2xl font-bold font-heading text-slate-900 mb-4">
                                Ready to land that interview?
                            </h3>
                            <p className="text-slate-600 mb-8 max-w-md mx-auto">
                                Join thousands of job seekers using MailApply to automate their recruiter outreach.
                            </p>
                            <Link
                                href="/signup"
                                className="inline-flex h-12 items-center justify-center rounded-xl bg-primary-600 px-8 text-sm font-bold text-white hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200"
                            >
                                Get Started Free
                            </Link>
                        </div>
                    </div>
                </article>
            </main>

            <Footer />
        </div>
    );
}
