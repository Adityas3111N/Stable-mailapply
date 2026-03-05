import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getServerSession } from "next-auth/next";

export async function POST(req: Request) {
    const session = await getServerSession();

    // For now, any authenticated user can post, or you can add an admin email check
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { title, excerpt, content, category, author, coverImage } = await req.json();

        if (!title || !content) {
            return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
        }

        // Create slug from title
        const slug = title
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim();

        const date = new Date().toISOString().split("T")[0];

        const fileContent = `---
title: "${title.replace(/"/g, '\\"')}"
date: "${date}"
excerpt: "${excerpt.replace(/"/g, '\\"')}"
author: "${author.replace(/"/g, '\\"')}"
category: "${category.replace(/"/g, '\\"')}"
coverImage: "${coverImage || ""}"
---

${content}
`;

        const postsDirectory = path.join(process.cwd(), "content/blog");
        if (!fs.existsSync(postsDirectory)) {
            fs.mkdirSync(postsDirectory, { recursive: true });
        }

        const filePath = path.join(postsDirectory, `${slug}.md`);

        // Check if exists to avoid overwriting unless intended (simple version: overwrite)
        fs.writeFileSync(filePath, fileContent, "utf8");

        return NextResponse.json({ success: true, slug });
    } catch (error) {
        console.error("Blog post error:", error);
        return NextResponse.json({ error: "Failed to save post" }, { status: 500 });
    }
}
