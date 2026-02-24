import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SecretlustAI – Adult AI Video Generator",
  description:
    "Generate adult AI videos with SecretlustAI. Explore video templates and create your own. New templates added daily.",
  keywords: [
    "AI video generator",
    "adult AI",
    "NSFW AI",
    "AI porn generator",
    "video templates",
    "AI generated videos",
  ],
  openGraph: {
    title: "SecretlustAI – Adult AI Video Generator",
    description:
      "Explore AI-generated adult video templates. Click to create your own.",
    type: "website",
    siteName: "SecretlustAI",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${dmSans.className} antialiased`}>{children}</body>
    </html>
  );
}
