import NextAuth, { AuthOptions, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongoose";
import UserModel from "@/models/User";
import { JWT } from "next-auth/jwt";

export const authOptions: AuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GMAIL_CLIENT_ID as string,
            clientSecret: process.env.GMAIL_CLIENT_SECRET as string,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required");
                }

                await dbConnect();

                const user = await UserModel.findOne({ email: credentials.email });
                if (!user) {
                    throw new Error("No account found with this email");
                }

                if (!user.password) {
                    throw new Error("This account was created with Google. Please 'Continue with Google'.");
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) {
                    throw new Error("Invalid password");
                }

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                };
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                await dbConnect();
                const existingUser = await UserModel.findOne({ email: user.email });
                if (!existingUser) {
                    const newUser = await UserModel.create({
                        name: user.name,
                        email: user.email?.toLowerCase(),
                    });
                    user.id = newUser._id.toString();
                } else {
                    user.id = existingUser._id.toString();
                }
                return true;
            }
            return true;
        },
        async jwt({ token, user, account }: { token: JWT; user?: { id?: string }, account?: unknown }) {
            if (user?.id) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }: { session: Session; token: JWT }) {
            if (session.user) {
                (session.user as { id?: string }).id = token.id as string;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
