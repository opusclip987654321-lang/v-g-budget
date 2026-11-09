import type { Metadata, Viewport } from "next";
import "./globals.css";
import { HOME_DESCRIPTION, HOME_TITLE, HREFLANG, publicOrigin } from "@/lib/seo";
import { ServiceWorkerRegister } from "@/components/app-installable";
import { pinterestVerification } from "@/lib/pinterest";

// Couleur de la barre du téléphone (et de l'appli installée, voir app/manifest.ts).
export const viewport: Viewport = { themeColor: "#174c38" };

function verification(): Pick<Metadata, "verification"> {
  const other: Record<string, string> = {};
  if (process.env.BING_SITE_VERIFICATION) other["msvalidate.01"] = process.env.BING_SITE_VERIFICATION;
  if (pinterestVerification()) other["p:domain_verify"] = pinterestVerification();
  if (!process.env.GOOGLE_SITE_VERIFICATION && !Object.keys(other).length) return {};
  return { verification: { google: process.env.GOOGLE_SITE_VERIFICATION, other: Object.keys(other).length ? other : undefined } };
}

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
    // Balises de propriété du site : Google, Bing et Pinterest (lib/pinterest.ts).
    ...verification(),
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
