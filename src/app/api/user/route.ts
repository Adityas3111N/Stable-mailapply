import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";

// GET /api/user — Get current user's profile
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const user = await User.findOne({ email: session.user.email }).select(
            "-password"
        );

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
                experience: user.experience,
                bio: user.bio,
                skills: user.skills,
                resumeUrl: user.resumeUrl,
                // Expose as boolean — never send the actual token to the client
                gmailRefreshToken: Boolean(user.gmailRefreshToken),
            },
        });
    } catch (error) {
        console.error("Get user error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PUT /api/user — Update current user's profile
export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, role, experience, bio, skills, resumeUrl } = body;

        await dbConnect();

        const updateData: Record<string, unknown> = {};
        if (name !== undefined) updateData.name = name.trim();
        if (role !== undefined) updateData.role = role.trim();
        if (experience !== undefined) updateData.experience = String(experience).trim();
        if (bio !== undefined) updateData.bio = bio.trim();
        if (skills !== undefined) updateData.skills = skills;
        if (resumeUrl !== undefined) updateData.resumeUrl = resumeUrl;

        const user = await User.findOneAndUpdate(
            { email: session.user.email },
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            message: "Profile updated successfully",
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
                experience: user.experience,
                bio: user.bio,
                skills: user.skills,
                resumeUrl: user.resumeUrl,
            },
        });
    } catch (error) {
        console.error("Update user error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
