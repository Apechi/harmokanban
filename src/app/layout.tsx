import type { Metadata } from "next";
import { Inter, Share_Tech_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const shareTechMono = Share_Tech_Mono({
  weight: "400",
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KanbanHarmo - Startup Kanban Board",
  description: "Advanced P2P collaborative Kanban board for startup planning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${shareTechMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-brand-bg text-foreground flex flex-col font-sans transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}
