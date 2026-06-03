import ToastProvider from "@/components/ui/ToastProvider";
import "./globals.css";

export const metadata = {
  title: "LawPortal - Legal Practice Management",
  description: "Professional law firm management system for Pakistani lawyers",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-body antialiased">
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}
