import { DM_Sans, JetBrains_Mono, Playfair_Display } from "next/font/google";
import ToastProvider from "@/components/ui/ToastProvider";
import "./globals.css";

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "600", "700"],
});

const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata = {
  title: "LawPortal � Legal Practice Management",
  description: "Professional law firm management system for Pakistani lawyers",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${display.variable} ${body.variable} ${mono.variable} font-body antialiased`}
      >
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}
