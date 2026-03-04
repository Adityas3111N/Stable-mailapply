import { NextRequest, NextResponse } from "next/server";
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
            client_id: process.env.GMAIL_CLIENT_ID!,
            client_secret: process.env.GMAIL_CLIENT_SECRET!,
            refresh_token: user.gmailRefreshToken,
            grant_type: "refresh_token",
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
                clientId: process.env.GMAIL_CLIENT_ID,
                clientSecret: process.env.GMAIL_CLIENT_SECRET,
                refreshToken: user.gmailRefreshToken,
                accessToken,
            },
        });

        // Send a separate, personalized email to each recruiter
        const results = await Promise.all(
            emails.map(async ({ to, subject, message }) => {
                let sent = false;
                let sendError = "";
                try {
                    const mailOptions: nodemailer.SendMailOptions = {
                        from: `${user.name} <${user.email}>`,
                        to,
                        subject,
                        text: message,
                    };

                    if (user.resumeUrl) {
                        // user.resumeUrl is something like "/uploads/resumes/filename.pdf"
                        // Nodemailer needs a filesystem path, not a URL
                        const fs = await import("fs");
                        const path = await import("path");

                        // Try to resolve the path relative to the public directory (where it was uploaded)
                        const publicPath = path.join(process.cwd(), "public", user.resumeUrl);

                        // Check if file exists to prevent crashing if the user deleted it
                        if (fs.existsSync(publicPath)) {
                            mailOptions.attachments = [
                                {
                                    filename: `${user.name.replace(/\s+/g, "_")}_Resume.pdf`,
                                    path: publicPath, // Use absolute filesystem path
                                },
                            ];
                        }
                    }

                    await transporter.sendMail(mailOptions);
                    sent = true;
                } catch (err) {
                    sendError = err instanceof Error ? err.message : String(err);
                    console.error(`Failed to send to ${to}:`, sendError);
                }

                const record = await EmailModel.create({
                    userId: user._id,
                    outreachId: outreachId || undefined,
                    companyName: companyName.trim(),
                    recruiterEmail: to.toLowerCase().trim(),
                    jobTitle: jobTitle.trim(),
                    subject,
                    message,
                    status: sent ? "sent" : "failed",
                    sentAt: sent ? new Date() : undefined,
                });

                return { to, sent, sendError, recordId: record._id };
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
