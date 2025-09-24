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
      <body className="min-h-screen bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
