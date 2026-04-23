import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { AccountProvider } from "@/lib/account-context";

const outfit = localFont({
  src: [
    { path: "../../public/fonts/Outfit-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/Outfit-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-outfit",
  display: "swap",
});

const playfair = localFont({
  src: [
    { path: "../../public/fonts/PlayfairDisplay-BlackItalic.ttf", weight: "900", style: "italic" },
  ],
  variable: "--font-playfair",
  display: "swap",
});

const jetbrains = localFont({
  src: [
    { path: "../../public/fonts/JetBrainsMono-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/JetBrainsMono-Medium.ttf", weight: "500", style: "normal" },
  ],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Azen Content Dashboard",
  description: "AI-powered content generation and management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${playfair.variable} ${jetbrains.variable}`}>
      <body>
        <AccountProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-[240px] px-10 py-8">{children}</main>
          </div>
        </AccountProvider>
      </body>
    </html>
  );
}
