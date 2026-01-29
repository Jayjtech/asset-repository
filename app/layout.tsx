import type { Metadata } from "next";
import { Sora, Space_Mono } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME?.trim() || "";
const siteName = companyName ? `${companyName} Asset Repo` : "Asset Repo";

export const metadata: Metadata = {
  title: siteName,
  description: "Internal asset platform for teams to upload and manage media.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sora.variable} ${spaceMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
