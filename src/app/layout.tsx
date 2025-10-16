import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://json-diff-viewer.vercel.app"),
  title: "JSON Diff Viewer",
  description:
    "ファイル/外部APIのJSONを左右で読み込み、ツリー形式の差分を可視化するツール。",
  openGraph: {
    type: "website",
    url: "/",
    siteName: "JSON Diff Viewer",
    title: "JSON Diff Viewer",
    description:
      "ファイル/外部APIのJSONを左右で読み込み、ツリー形式の差分を可視化するツール。",
    images: [
      { url: "/og.png", width: 1200, height: 630, alt: "JSON Diff Viewer" },
    ],
  },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
