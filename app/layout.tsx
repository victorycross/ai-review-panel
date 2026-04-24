import type { Metadata } from "next";
import "./globals.css";
import { ReviewProvider } from "@/lib/review-context";

export const metadata: Metadata = {
  title: "techassist — AI System Review Panel",
  description: "Multi-dimensional risk assessment for AI deployments. BrightPath Technologies.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-bg text-ink antialiased">
        <ReviewProvider>{children}</ReviewProvider>
      </body>
    </html>
  );
}
