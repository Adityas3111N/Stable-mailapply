import { NextResponse } from "next/server";
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
