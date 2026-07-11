'use client';

import Navbar from "@/components/ui/landing/Navbar";

export default function AuthLayout({ children }) {
  return (
    <div className="">
      <Navbar/>
      {children}
    </div>
  );
}
