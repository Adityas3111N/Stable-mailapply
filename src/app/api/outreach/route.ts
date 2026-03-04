import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongoose";
import Outreach from "@/models/Outreach";
import User from "@/models/User";

// GET /api/outreach — List user's outreach targets
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const outreaches = await Outreach.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ outreaches });
    } catch (error) {
        console.error("Get outreach error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST /api/outreach — Create an outreach target
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { companyName, recruiters, jobTitle, jobLink, notes } = body;

        if (!companyName || !recruiters || recruiters.length === 0 || !jobTitle) {
            return NextResponse.json(
                { error: "Company name, at least one recruiter email, and job title are required" },
                { status: 400 }
            );
        }

        await dbConnect();
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const outreach = await Outreach.create({
            userId: user._id,
            companyName: companyName.trim(),
            recruiters: recruiters.map((r: { email: string; name: string }) => ({
                email: r.email.toLowerCase().trim(),
                name: r.name?.trim() || "",
            })),
            jobTitle: jobTitle.trim(),
            jobLink: jobLink?.trim() || "",
            notes: notes?.trim() || "",
        });

        return NextResponse.json(
            { message: "Outreach target created", outreach },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create outreach error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
