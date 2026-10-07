import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VégéBudget — vos dîners de la semaine pour environ 25 €",
  description: "Des dîners sans viande, simples et pas chers, avec la liste de courses exacte et votre placard déduit. Première semaine gratuite.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

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
