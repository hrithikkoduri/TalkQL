import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ 
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "TalkQL - Database Connection Hub",
  description: "Connect and query your databases with ease",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <div id="modal-root" className="z-[999999]" />
      </body>
    </html>
  );
}