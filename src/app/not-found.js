"use client";

import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#071614] text-white flex items-center justify-center p-6 relative overflow-hidden select-none">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#11584e_1px,transparent_1px),linear-gradient(to_bottom,#11584e_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#0e8278]/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#11584e]/40 rounded-full blur-[150px]" />
      </div>

      <div className="text-center max-w-2xl w-full relative z-10 flex flex-col items-center">
        <div className="relative flex items-center justify-center mb-2 w-full h-[16rem] sm:h-[22rem]">
          <h1
            className="text-[14rem] sm:text-[20rem] font-bold leading-none tracking-tight flex items-center justify-center text-transparent bg-clip-text bg-gradient-to-b from-[#0e8278] via-[#11584e] to-[#07403d] filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)]"
            style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
          >
            <span className="relative inline-flex items-center justify-center mx-[-1.5rem] sm:mx-[-2.5rem] w-[14rem] h-[14rem] sm:w-[20rem] sm:h-[20rem] z-20">
              <span className="absolute text-[9rem] sm:text-[13rem] font-black text-[#0e8278] opacity-40 mix-blend-screen scale-110 blur-[1px]">
                0
              </span>

              <div className="absolute w-[150%] h-[30px] bg-gradient-to-r from-transparent via-white/20 to-transparent rotate-[35deg] translate-y-[-20px] blur-sm pointer-events-none z-30" />

              <span className="absolute w-[75%] h-[75%] rounded-full border-[12px] sm:border-[16px] border-t-[#0e8278] border-r-[#11584e] border-b-[#07403d] border-l-[#0e8278] bg-gradient-to-b from-white/10 to-transparent backdrop-blur-[6px] shadow-[inset_0_4px_12px_rgba(255,255,255,0.2),0_12px_24px_rgba(0,0,0,0.6)] z-20" />

              <span className="absolute w-[75%] h-[75%] rounded-full border border-black/40 pointer-events-none z-20" />

              <span className="absolute bottom-[-10%] left-[100%] w-[24px] h-[90px] sm:w-[32px] sm:h-[130px] bg-gradient-to-r from-[#07403d] via-[#0e8278] to-[#11584e] rounded-xl transform -rotate-45 origin-bottom-left shadow-[0_8px_16px_rgba(0,0,0,0.5)] border-t border-l border-white/20 z-10 flex flex-col items-center pt-4 gap-2">
                <span className="w-[60%] h-[4px] bg-[#07403d] rounded-full opacity-60" />
                <span className="w-[60%] h-[4px] bg-[#07403d] rounded-full opacity-60" />
                <span className="w-[60%] h-[4px] bg-[#07403d] rounded-full opacity-60" />
              </span>
            </span>
            4
          </h1>
        </div>

        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4 text-white drop-shadow-md">
          Oops! page not found
        </h2>

        <p className="text-sm sm:text-base text-slate-400 max-w-md mx-auto leading-relaxed mb-10 px-4">
          A 404 "Not Found" page informs visitors that a requested URL does not
          exist on a server. Contact Developer.
        </p>

        {/* Sleek, Rounded UI Button Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full px-6">
          <button
            onClick={() => window.history.back()}
            className="group flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-full border border-slate-700 bg-[#071614]/60 text-slate-300 font-medium text-sm hover:text-white hover:border-slate-500 hover:bg-[#11584e]/20 transition-all duration-200 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
            Go Back
          </button>

          <Link
            href="/dashboard"
            className="group flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-[#0e8278] to-[#11584e] text-white font-medium text-sm hover:from-[#11584e] hover:to-[#07403d] shadow-[0_4px_20px_rgba(14,130,120,0.3)] transition-all duration-200 active:scale-95"
          >
            <Home className="w-4 h-4 group-hover:scale-105 transition-transform duration-200" />
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
}
