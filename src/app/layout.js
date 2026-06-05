import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "BiztelAI Workflow Automation",
  description: "AI-Powered Workflow Automation System",
};

import Sidebar from "./Sidebar";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body style={{ display: 'flex', minHeight: '100vh', margin: 0 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '2rem 3rem', marginLeft: '260px' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
