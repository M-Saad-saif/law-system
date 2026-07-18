export const metadata = {
  title: "Client Portal | LegalPortal",
  description:
    "Secure client portal for LegalPortal. View your legal cases, court hearings, documents, invoices, and communicate with your lawyer online.",

  keywords: [
    "client portal",
    "legal client portal",
    "law firm client portal",
    "lawyer client portal",
    "secure legal portal",
    "case tracking portal",
    "legal case tracking",
    "court hearing updates",
    "legal document portal",
    "online legal services",
    "client dashboard",
    "law firm dashboard",
    "legal case status",
    "client case management",
    "lawyer communication portal",
    "LegalPortal",
    "lawportal"
  ],

  openGraph: {
    title: "Client Portal | LegalPortal",
    description:
      "Access your cases, documents, court dates, invoices, and communicate securely with your lawyer through LegalPortal.",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    siteName: "LegalPortal",
    type: "website",
    locale: "en_PK",
    images: [
      {
        url: "/opengrapgImg.png",
        width: 1200,
        height: 630,
        alt: "LegalPortal Client Portal",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Client Portal | LegalPortal",
    description:
      "Securely access your legal cases, documents, court schedules, and communicate with your lawyer.",
    images: "/opengrapgImg.png",
  },
};

export default function PortalLayout({ children }) {
  return <div className="min-h-screen bg-[#f4faf8]">{children}</div>;
}
