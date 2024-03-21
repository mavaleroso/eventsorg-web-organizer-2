import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PrelineScript from "./components/PrelineScript";
import { Toaster } from "react-hot-toast";
import Home from "./components/BaseLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EventsOrg",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster position="top-center" reverseOrder={false} />
        <Home>{children}</Home>
      </body>
      <PrelineScript />
    </html>
  );
}
