import type { Metadata } from "next";
import "./globals.css";
import { HOME_DESCRIPTION, HOME_TITLE, publicOrigin } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(await publicOrigin()),
    title: { default: HOME_TITLE, template: "%s | VégéBudget" },
    description: HOME_DESCRIPTION,
    applicationName: "VégéBudget",
    alternates: { canonical: "/" },
    openGraph: { type: "website", locale: "fr_FR", siteName: "VégéBudget", title: HOME_TITLE, description: HOME_DESCRIPTION },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
    ...(process.env.GOOGLE_SITE_VERIFICATION || process.env.BING_SITE_VERIFICATION ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION, other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined } } : {}),
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
