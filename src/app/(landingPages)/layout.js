import Navbar from "@/components/ui/landing/Navbar";

export default function RootLayout({ children }) {
  return (
    <body className="font-body antialiased">
      <Navbar />
      {children}
    </body>
  );
}
