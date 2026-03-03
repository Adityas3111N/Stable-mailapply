import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MailApply – Smart Job Email Outreach Platform",
  description:
    "Generate personalized job application emails, send them directly to recruiters, and track your outreach — all in one dashboard.",
  keywords: [
    "job application",
    "email outreach",
    "cold email",
    "job search",
    "recruiter email",
    "career",
    "MailApply",
  ],
  openGraph: {
    title: "MailApply – Smart Job Email Outreach Platform",
    description:
      "Generate personalized job application emails, send them directly to recruiters, and track your outreach.",
    type: "website",
    url: "https://mailapply.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
