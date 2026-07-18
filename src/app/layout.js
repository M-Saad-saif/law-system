import ToastProvider from "@/components/ui/ToastProvider";
import LogoutOverlay from "@/components/layout/LogoutOverlay";
import "./globals.css";

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  icons: {
    icon: "/Monogram.png",
  },
  title: {
    default: "LegalPortal - Law Firm Management for Pakistani Lawyers",
    template: "%s | LegalPortal",
  },
  description:
    "LegalPortal is Pakistan's all-in-one law firm management software for lawyers and advocates. Manage cases, clients, billing, hearings, documents, and your legal practice with ease.",

  keywords: [
    "lawportal",
    "LegalPort1al",
    "law firm management software",
    "legal practice management software",
    "law practice management software",
    "lawyer software",
    "lawyer software Pakistan",
    "law firm software",
    "law firm software Pakistan",
    "legal software",
    "legal software Pakistan",
    "legal management system",
    "case management software",
    "legal case management software",
    "case management system",
    "court case management software",
    "law office management software",
    "legal document management",
    "legal CRM",
    "client management for lawyers",
    "lawyer billing software",
    "legal billing software",
    "court diary software",
    "court hearing reminder",
    "legal calendar software",
    "litigation management software",
    "advocate management software",
    "advocate software Pakistan",
    "digital chamber management",
    "AI legal assistant",
    "AI legal software",
    "judgment search Pakistan",
    "Pakistan court judgments",
    "Pakistan legal research",
    "Pakistan legal database",
    "cloud law practice management",
    "online law firm software",
    "legal workflow automation",
    "law firm productivity software",
    "best law firm management software",
    "best legal software Pakistan",
  ],

  authors: [{ name: "LegalPortal" }],
  creator: "LegalPortal",
  publisher: "LegalPortal",

  openGraph: {
    type: "website",
    locale: "en_PK",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    siteName: "LegalPortal",
    title: "LegalPortal — Law Firm Management for Pakistani Lawyers",
    description:
      "Manage your chamber, cases, clients, and billing with LegalPortal — built specifically for law firms in Pakistan.",
    images: [
      {
        url: "/opengrapgImg.png",
        width: 1200,
        height: 630,
        alt: "LegalPortal — Law Firm Management System",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "LegalPortal — Law Firm Management for Pakistani Lawyers",
    description:
      "Manage your chamber, cases, clients, and billing with LegalPortal — built for Pakistani law firms.",
    images: ["/opengrapgImg.png"],
  },

  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "LegalPortal",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
              description:
                "Professional law firm management system for Pakistani lawyers. Manage cases, clients, billing, and chambers.",
              offers: {
                "@type": "Offer",
                price: "5000",
                priceCurrency: "PKR",
              },
              provider: {
                "@type": "Organization",
                name: "LegalPortal",
                url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
              },
            }),
          }}
        />
      </head>
      <body className="font-body antialiased">
        <ToastProvider />
        <LogoutOverlay />
        {children}
      </body>
    </html>
  );
}
