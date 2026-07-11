import ToastProvider from "@/components/ui/ToastProvider";
import LogoutOverlay from "@/components/layout/LogoutOverlay";
import "./globals.css";
import Navbar from "@/components/ui/landing/Navbar";


export const metadata = {
  metadataBase: new URL("http://localhost:3000"),
  icons: {
    icon: "/Monogram.png",
  },
  title: {
    default: "LegalPortal - Law Firm Management for Pakistani Lawyers",
    template: "%s | LegalPortal",
  },
  description:
    "LegalPortal is a professional law firm management system built for Pakistani lawyers. Manage cases, clients, billing, and your chamber — all in one place.",

  keywords: [
    "law firm management Pakistan",
    "legal practice management software",
    "Pakistani lawyer software",
    "chamber management system",
    "case management Pakistan",
    "advocate management system",
    "legal billing software Pakistan",
    "law portal Pakistan",
  ],

  authors: [{ name: "LegalPortal" }],
  creator: "LegalPortal",
  publisher: "LegalPortal",

  openGraph: {
    type: "website",
    locale: "en_PK",
    url: "http://localhost:3000",
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
    images: ["/og-image.png"],
  },

  alternates: {
    canonical: "http://localhost:3000",
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
              url: "http://localhost:3000",
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
                url: "http://localhost:3000",
              },
            }),
          }}
        />
      </head>
      <body className="font-body antialiased">
        <Navbar />
        <ToastProvider />
        <LogoutOverlay />
        {children}
      </body>
    </html>
  );
}
