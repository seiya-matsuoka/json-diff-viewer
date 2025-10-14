import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JSON Diff Viewer",
  description: "Compare two JSONs with a tree diff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-yellow-200/40">
        {children}
      </body>
    </html>
  );
}
