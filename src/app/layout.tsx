import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "react-activity/dist/library.css";
import "react-toastify/dist/ReactToastify.css";
import App from "./app";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NearNow - Discover Events Near You",
  description: "NearNow is the essential event discovery application designed for spontaneous and savvy city dwellers. Find exciting events happening in your immediate vicinity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen`} suppressHydrationWarning>
      <App>{children}</App>
  
      </body>
    </html>
  );
}
