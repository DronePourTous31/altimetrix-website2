import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AltiMetrix - Photogrammétrie par Drone | Modèles 3D, Mesures, Analyse Solaire",
  description:
    "AltiMetrix transforme vos photos aériennes en modèles 3D précis. Mesures, calepinage solaire, analyse d'irradiation et rapports professionnels pour artisans et particuliers.",
  keywords:
    "photogrammétrie, drone, modèle 3D, mesure toiture, calepinage solaire, analyse irradiation, devis toiture, inspection drone",
  openGraph: {
    title: "AltiMetrix - Photogrammétrie par Drone",
    description: "Transformez vos photos aériennes en modèles 3D précis",
    type: "website",
    locale: "fr_FR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-anthracite-900 text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
