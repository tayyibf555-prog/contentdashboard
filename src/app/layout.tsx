import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { AccountProvider } from "@/lib/account-context";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en">
      <body className={inter.className}>
        <AccountProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-[220px] p-6">{children}</main>
          </div>
        </AccountProvider>
      </body>
    </html>
  );
}
