import { NextRequest, NextResponse } from "next/server";
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
