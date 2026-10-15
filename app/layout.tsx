import type { Metadata, Viewport } from "next";
import "./globals.css";
import { HOME_DESCRIPTION, HOME_TITLE, HREFLANG, publicOrigin } from "@/lib/seo";
import { ServiceWorkerRegister } from "@/components/app-installable";

// Couleur de la barre du téléphone (et de l'appli installée, voir app/manifest.ts).
export const viewport: Viewport = { themeColor: "#174c38" };

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(await publicOrigin()),
    title: { default: HOME_TITLE, template: "%s · VégéBudget" },
    description: HOME_DESCRIPTION,
    applicationName: "VégéBudget",
    alternates: { canonical: "/", languages: HREFLANG },
    openGraph: { type: "website", locale: "fr_FR", siteName: "VégéBudget", title: HOME_TITLE, description: HOME_DESCRIPTION },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg", apple: "/icons/apple-touch-icon.png" },
    appleWebApp: { capable: true, title: "VégéBudget", statusBarStyle: "default" },
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
      <head>
        {/* Statistiques Umami (serveur stats.nourmeet.com) : sans cookie. */}
        <script defer src="https://stats.nourmeet.com/script.js" data-website-id="7cdda908-b5f3-4627-8805-03d19eab9d6c"></script>
      </head>
      <body className="antialiased">{children}<ServiceWorkerRegister /></body>
    </html>
  );
}
