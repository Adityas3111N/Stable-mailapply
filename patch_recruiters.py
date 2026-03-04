import pathlib, textwrap

base = pathlib.Path("src")

# ── 1. User model — add Gmail token fields ─────────────────────────────────────
pathlib.Path(base / "models" / "User.ts").write_text(r'''import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    password: string;
    skills: string[];
    role: string;
    experience: string;
    resumeUrl: string;
    bio: string;
    // Gmail OAuth tokens (stored when user connects their Gmail)
    gmailAccessToken: string;
    gmailRefreshToken: string;
    gmailTokenExpiry: number;   // Unix ms timestamp
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            maxlength: [100, "Name cannot exceed 100 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
        },
        skills:        { type: [String], default: [] },
        role:          { type: String, default: "", trim: true },
        experience:    { type: String, default: "", trim: true },
        resumeUrl:     { type: String, default: "" },
        bio:           { type: String, default: "", maxlength: [2000, "Bio cannot exceed 2000 characters"] },
        gmailAccessToken:  { type: String, default: "" },
        gmailRefreshToken: { type: String, default: "" },
        gmailTokenExpiry:  { type: Number, default: 0 },
    },
    { timestamps: true }
);

const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
''', encoding="utf-8")
print("✓ User.ts updated")


# ── 2. GET /api/auth/gmail — redirect user to Google's consent page ────────────
gmail_dir = base / "app" / "api" / "auth" / "gmail"
gmail_dir.mkdir(parents=True, exist_ok=True)

(gmail_dir / "route.ts").write_text(r'''import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clientId = process.env.GMAIL_CLIENT_ID;
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/gmail/callback`;

    if (!clientId) {
        return NextResponse.json(
            { error: "GMAIL_CLIENT_ID is not configured in .env.local" },
            { status: 500 }
        );
    }

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri!,
        response_type: "code",
        scope: "https://mail.google.com/",
        access_type: "offline",
        prompt: "consent",           // always get a refresh token
        state: session.user.email,   // pass the user email through the flow
    });

    return NextResponse.redirect(
        `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    );
}
''', encoding="utf-8")
print("✓ /api/auth/gmail/route.ts created")


# ── 3. GET /api/auth/gmail/callback — exchange code, save tokens ───────────────
callback_dir = gmail_dir / "callback"
callback_dir.mkdir(parents=True, exist_ok=True)

(callback_dir / "route.ts").write_text(r'''import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code  = searchParams.get("code");
    const state = searchParams.get("state"); // user email

    if (!code || !state) {
        return NextResponse.redirect(
            `${process.env.NEXTAUTH_URL}/dashboard/profile?gmail=error&reason=missing_params`
        );
    }

    try {
        // Exchange authorisation code for tokens
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id:     process.env.GMAIL_CLIENT_ID!,
                client_secret: process.env.GMAIL_CLIENT_SECRET!,
                redirect_uri:  `${process.env.NEXTAUTH_URL}/api/auth/gmail/callback`,
                grant_type:    "authorization_code",
            }),
        });

        if (!tokenRes.ok) {
            const err = await tokenRes.text();
            console.error("Token exchange failed:", err);
            return NextResponse.redirect(
                `${process.env.NEXTAUTH_URL}/dashboard/profile?gmail=error&reason=token_exchange`
            );
        }

        const tokens = await tokenRes.json();

        await dbConnect();
        await User.updateOne(
            { email: state },
            {
                gmailAccessToken:  tokens.access_token  || "",
                gmailRefreshToken: tokens.refresh_token || "",
                gmailTokenExpiry:  tokens.expires_in
                    ? Date.now() + tokens.expires_in * 1000
                    : 0,
            }
        );

        return NextResponse.redirect(
            `${process.env.NEXTAUTH_URL}/dashboard/profile?gmail=connected`
        );
    } catch (error) {
        console.error("Gmail callback error:", error);
        return NextResponse.redirect(
            `${process.env.NEXTAUTH_URL}/dashboard/profile?gmail=error&reason=server`
        );
    }
}
''', encoding="utf-8")
print("✓ /api/auth/gmail/callback/route.ts created")


# ── 4. /api/send-email — use user's own Gmail tokens ─────────────────────────
(base / "app" / "api" / "send-email" / "route.ts").write_text(r'''import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import EmailModel from "@/models/Email";
import nodemailer from "nodemailer";

interface EmailPayload {
    to: string;
    subject: string;
    message: string;
}

// Refresh the access token if expired
async function getFreshAccessToken(user: {
    gmailRefreshToken: string;
    gmailTokenExpiry: number;
    gmailAccessToken: string;
    _id: unknown;
}): Promise<string> {
    // Still valid — return as-is
    if (user.gmailTokenExpiry > Date.now() + 60_000) {
        return user.gmailAccessToken;
    }

    const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id:     process.env.GMAIL_CLIENT_ID!,
            client_secret: process.env.GMAIL_CLIENT_SECRET!,
            refresh_token: user.gmailRefreshToken,
            grant_type:    "refresh_token",
        }),
    });

    if (!res.ok) throw new Error("Failed to refresh Gmail access token");

    const data = await res.json();
    const newExpiry = Date.now() + (data.expires_in ?? 3600) * 1000;

    // Persist updated access token
    await User.updateOne(
        { _id: user._id },
        { gmailAccessToken: data.access_token, gmailTokenExpiry: newExpiry }
    );

    return data.access_token as string;
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { emails, companyName, jobTitle, outreachId } = body as {
            emails: EmailPayload[];
            companyName: string;
            jobTitle: string;
            outreachId?: string;
        };

        if (!emails || emails.length === 0 || !companyName || !jobTitle) {
            return NextResponse.json(
                { error: "emails array, companyName and jobTitle are required" },
                { status: 400 }
            );
        }

        await dbConnect();
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if user has connected their Gmail
        if (!user.gmailRefreshToken) {
            return NextResponse.json(
                {
                    error: "Gmail not connected",
                    message: "Please connect your Gmail account from your profile page to enable sending.",
                    connectUrl: "/api/auth/gmail",
                },
                { status: 403 }
            );
        }

        // Get a valid access token (auto-refreshes if expired)
        let accessToken: string;
        try {
            accessToken = await getFreshAccessToken(user);
        } catch {
            return NextResponse.json(
                {
                    error: "Gmail token refresh failed",
                    message: "Your Gmail connection has expired. Please reconnect from your profile page.",
                    connectUrl: "/api/auth/gmail",
                },
                { status: 403 }
            );
        }

        // Build transporter using user's own OAuth2 access token
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: user.email,
                clientId:     process.env.GMAIL_CLIENT_ID,
                clientSecret: process.env.GMAIL_CLIENT_SECRET,
                refreshToken: user.gmailRefreshToken,
                accessToken,
            },
        });

        // Send a separate, personalized email to each recruiter
        const results = await Promise.all(
            emails.map(async ({ to, subject, message }) => {
                let sent = false;
                try {
                    const mailOptions: nodemailer.SendMailOptions = {
                        from: `${user.name} <${user.email}>`,
                        to,
                        subject,
                        text: message,
                    };

                    if (user.resumeUrl) {
                        mailOptions.attachments = [
                            {
                                filename: `${user.name.replace(/\s+/g, "_")}_Resume.pdf`,
                                path: user.resumeUrl,
                            },
                        ];
                    }

                    await transporter.sendMail(mailOptions);
                    sent = true;
                } catch (err) {
                    console.error(`Failed to send to ${to}:`, err);
                }

                const record = await EmailModel.create({
                    userId:         user._id,
                    outreachId:     outreachId || undefined,
                    companyName:    companyName.trim(),
                    recruiterEmail: to.toLowerCase().trim(),
                    jobTitle:       jobTitle.trim(),
                    subject,
                    message,
                    status:  sent ? "sent" : "failed",
                    sentAt:  sent ? new Date() : undefined,
                });

                return { to, sent, recordId: record._id };
            })
        );

        const allSent = results.every((r) => r.sent);
        const anySent = results.some((r) => r.sent);

        return NextResponse.json({
            success: anySent,
            allSent,
            message: allSent
                ? "All emails sent successfully!"
                : "Some emails could not be sent.",
            results,
        });
    } catch (error) {
        console.error("Send email error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
''', encoding="utf-8")
print("✓ /api/send-email/route.ts updated")

print("\nAll done!")
