import Navbar from "@/components/ui/landing/Navbar";

export const metadata = {
  title: "LegalPortal | Law Firm Management Software for Pakistani Lawyers",
  description:
    "LegalPortal is Pakistan's all-in-one law firm management software. Manage cases, clients, court hearings, documents, billing, judgments, and your entire legal practice from one secure cloud platform.",

  keywords: [
    "lawportal",
    "LegalPortal",
    "law firm management software",
    "legal practice management software",
    "law practice management software",
    "lawyer software Pakistan",
    "law firm software Pakistan",
    "legal software Pakistan",
    "case management software",
    "legal case management software",
    "client management for lawyers",
    "legal document management",
    "lawyer billing software",
    "court hearing management",
    "court diary software",
    "digital chamber management",
    "litigation management software",
    "legal CRM",
    "AI legal assistant",
    "judgment search Pakistan",
    "Pakistan court judgments",
    "Pakistan legal research",
    "online law firm software",
    "cloud legal software",
    "best legal software Pakistan",
    "best law firm management software",
  ],

  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || "https://localhost:3000",
  },

  openGraph: {
    type: "website",
    locale: "en_PK",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://localhost:3000",
    siteName: "LegalPortal",
    title: "LegalPortal | Law Firm Management Software for Pakistani Lawyers",
    description:
      "Manage your law firm with LegalPortal. Cases, clients, billing, hearings, documents, AI legal assistant, and Pakistan court judgment search—all in one platform.",
    images: [
      {
        url: "/opengrapgImg.png",
        width: 1200,
        height: 630,
        alt: "LegalPortal - Law Firm Management Software",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "LegalPortal | Law Firm Management Software",
    description:
      "Pakistan's all-in-one legal practice management software for lawyers and law firms.",
    images: "/opengrapgImg.png",
  },
  category: "Legal Software",
};

export default function RootLayout({ children }) {
  return (
    <body className="font-body antialiased">
      <Navbar />
      {children}
    </body>
  );
}
