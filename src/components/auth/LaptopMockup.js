"use client";

import {
  Bell,
  Settings,
  CreditCard,
  LayoutDashboard,
  Briefcase,
  Calendar,
  FileText,
  LogOut,
  Plus,
  BookOpen,
  Clock,
  ChevronDown,
  Scale,
} from "lucide-react";

function NavigationItem({
  icon: Icon,
  label,
  active = false,
  rightElement = null,
}) {
  return (
    <div
      className={`flex items-center gap-1.5 px-1.5 py-1 rounded cursor-pointer transition-colors ${
        active
          ? "bg-white text-[#024e43] font-medium shadow-xs"
          : "hover:bg-white/5"
      }`}
    >
      <Icon className="w-3 h-3" />
      <span className="flex-1">{label}</span>
      {rightElement}
    </div>
  );
}

function NavSection({ title, items }) {
  return (
    <div>
      <p className="text-[7px] tracking-wider text-teal-300/60 uppercase font-bold px-1.5 mb-1">
        {title}
      </p>
      <div className="space-y-0.5">
        {items.map((item, idx) => (
          <NavigationItem key={idx} {...item} />
        ))}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sublabel, active = false }) {
  return (
    <div
      className={`bg-white p-2.5 rounded-md border border-slate-100 shadow-xs text-center flex flex-col justify-between h-[76px] hover:shadow-md transition-shadow ${
        active
          ? "bg-[#024e43] text-white ring-2 ring-teal-500/20 hover:scale-105 transform -translate-y-0.5"
          : ""
      }`}
    >
      <div
        className={`mx-auto p-1 rounded ${
          active
            ? "bg-white/20 text-white animate-pulse"
            : "bg-blue-50 text-blue-600"
        }`}
      >
        <Icon className="w-3 h-3" />
      </div>
      <p className="text-[6.5px] text-slate-400 uppercase font-bold tracking-wider">
        {label}
      </p>
      <p className="text-base font-bold text-slate-800 leading-none">{value}</p>
      <p className="text-[6px] text-slate-400">{sublabel}</p>
    </div>
  );
}

function QuickAction({ icon: Icon, label, color }) {
  const colorMap = {
    teal: "bg-teal-50 text-teal-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-xs flex flex-col items-center gap-1 hover:bg-slate-50 hover:scale-105 cursor-pointer transition-all">
      <div className={`p-1.5 ${colorMap[color]} rounded-full`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <span className="text-[8.5px] font-semibold text-slate-700">{label}</span>
    </div>
  );
}

function DashboardSidebar() {
  return (
    <div className="w-[180px] bg-[#024e43] text-white/80 p-3 flex flex-col justify-between text-[11px]">
      <div>
        <div className="flex items-center gap-2 mb-4 p-1">
          <div className="w-7 h-7 rounded-full bg-slate-400 border border-teal-400 relative overflow-hidden flex-shrink-0">
            <div className="w-full h-full bg-gradient-to-br from-amber-600 to-amber-900" />
            <span className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-green-400 rounded-full border border-[#024e43]" />
          </div>
          <div className="truncate">
            <p className="font-bold text-white text-[11px] leading-tight">
              User
            </p>
            <p className="text-[8px] text-white/50 truncate">
              youremail@gmail.com
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <NavSection
            title="Account"
            items={[
              { icon: Settings, label: "Settings" },
              { icon: CreditCard, label: "Billing" },
            ]}
          />
          <NavSection
            title="Main"
            items={[
              { icon: LayoutDashboard, label: "Dashboard", active: true },
              { icon: Briefcase, label: "Cases" },
              { icon: Calendar, label: "Calendar" },
            ]}
          />
          <NavSection
            title="Litigation"
            items={[
              {
                icon: FileText,
                label: "Cross-Exam...",
                rightElement: (
                  <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                ),
              },
              {
                icon: FileText,
                label: "Application Gen...",
                rightElement: (
                  <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                ),
              },
            ]}
          />
        </div>
      </div>

      <div className="border border-white/10 rounded-md p-1.5 flex items-center justify-center gap-1 text-[9px] hover:bg-white/5 cursor-pointer transition-colors">
        <LogOut className="w-3 h-3" /> Sign Out
      </div>
    </div>
  );
}

function DashboardWorkspace() {
  const hour = new Date().getHours();

  let greeting = "";

  if (hour >= 0 && hour < 5) {
    greeting = "Good Night";
  } else if (hour >= 5 && hour < 12) {
    greeting = "Good Morning";
  } else if (hour >= 12 && hour < 17) {
    greeting = "Good Afternoon";
  } else {
    greeting = "Good Night";
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-white px-4 py-2.5 flex justify-between items-center border-b border-slate-100 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-0.5 h-4 bg-[#024e43] rounded-full" />
          <span className="font-bold text-slate-800 text-[13px]">
            Dashboard
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Bell className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-600 animate-icon-float" />
          <div className="flex items-center gap-2 border-l pl-3 border-slate-200">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-700 to-amber-900" />
            <div className="text-[9px] leading-none">
              <p className="font-bold text-slate-700">User</p>
              <p className="text-slate-400 text-[6px] mt-0.5">Senior Lawyer</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-base font-serif font-bold text-[#042f2e]">
              {greeting}, User
            </h1>
            <p className="text-[9px] text-slate-400 mt-0.5">
              Here's your practice overview • Saturday, 27 June 2026
            </p>
          </div>
          <button className="bg-[#024e43] hover:bg-[#0d9488] text-white text-[9px] font-medium px-3 py-1.5 rounded-md flex items-center gap-1 shadow-sm transition-colors">
            <Plus className="w-3 h-3" /> New Case
          </button>
        </div>

        <div className="grid grid-cols-5 gap-2.5">
          <StatCard
            icon={Scale}
            label="Total Cases"
            value="0"
            sublabel="All time"
          />
          <StatCard
            icon={Briefcase}
            label="Active Cases"
            value="0"
            sublabel="Currently active"
          />
          <StatCard
            icon={Calendar}
            label="Today's Hearings"
            value="0"
            sublabel="Scheduled today"
            active
          />
          <StatCard
            icon={Calendar}
            label="Tomorrow"
            value="0"
            sublabel="Hearings & proc."
          />
          <StatCard
            icon={Scale}
            label="Closed Cases"
            value="0"
            sublabel="Disposed / closed"
          />
        </div>

        <div className="grid grid-cols-4 gap-3">
          <QuickAction icon={Briefcase} label="Add Case" color="teal" />
          <QuickAction icon={Calendar} label="Calendar" color="blue" />
          <QuickAction icon={BookOpen} label="Law Books" color="purple" />
          <QuickAction icon={Clock} label="Reminders" color="orange" />
        </div>

        <div className="bg-white p-2.5 rounded-md border border-slate-100 flex justify-between items-center text-[7.5px] animate-pulse-slow">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-slate-700">Legal Updates</span>
            <span className="text-slate-400">Pakistani Courts — Live</span>
          </div>
          <span className="text-slate-400">Updated 10:19 pm</span>
        </div>
      </div>
    </div>
  );
}

export function LaptopMockup() {
  return (
    <div className="hidden lg:flex lg:col-span-7 h-full w-full relative items-center justify-center p-4">
      <style jsx global>{`
        @keyframes floatDevice {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        @keyframes screenGlow {
          0%,
          100% {
            box-shadow:
              0 0 30px rgba(13, 148, 136, 0.1),
              0 0 60px rgba(13, 148, 136, 0.05);
          }
          50% {
            box-shadow:
              0 0 40px rgba(13, 148, 136, 0.2),
              0 0 80px rgba(13, 148, 136, 0.1);
          }
        }
        @keyframes screenShine {
          0% {
            transform: translateX(-100%) translateY(-100%) rotate(45deg);
          }
          100% {
            transform: translateX(200%) translateY(200%) rotate(45deg);
          }
        }
        @keyframes laptopOpen {
          0% {
            transform: rotateX(86deg) scaleY(0.08);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          65% {
            transform: rotateX(10deg) scaleY(1);
            opacity: 1;
          }
          80% {
            transform: rotateX(6deg) scaleY(1);
            opacity: 1;
          }
          100% {
            transform: rotateX(8deg) scaleY(1);
            opacity: 1;
          }
        }
        @keyframes shadowReveal {
          0% {
            opacity: 0;
            transform: scaleX(0.15);
          }
          100% {
            opacity: 1;
            transform: scaleX(1);
          }
        }
        @keyframes screenFadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        @keyframes iconFloat {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        @keyframes pulseSlow {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }

        .laptop-lid {
          transform-origin: bottom center;
          animation: laptopOpen 1.5s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both;
        }
        .laptop-ambient-shadow {
          animation: shadowReveal 1s ease-out 1.5s both;
        }
        .laptop-screen-content {
          animation: screenFadeIn 0.6s ease-out 1.1s both;
        }
        .laptop-float-wrapper {
          animation: floatDevice 6s ease-in-out 1.85s infinite;
        }
        .animate-icon-float {
          animation: iconFloat 3s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulseSlow 3s ease-in-out infinite;
        }
        .animate-screen-glow {
          animation: screenGlow 3s ease-in-out infinite;
        }
        .animate-screen-shine {
          animation: screenShine 4s ease-in-out infinite;
        }

        .laptop-screen-content * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }

        .laptop-screen-content {
          transform: translateZ(0);
          backface-visibility: hidden;
          -webkit-font-smoothing: antialiased;
        }
      `}</style>

      <div
        style={{
          perspective: "800px",
          transform: "rotateX(8deg) rotateY(-12deg) scale(0.85)",
        }}
      >
        <div className="laptop-float-wrapper relative w-[550px] flex flex-col items-center">
          <div className="laptop-ambient-shadow absolute -bottom-12 left-1/2 -translate-x-1/2 w-[450px] h-16 bg-gradient-to-r from-transparent via-slate-300/20 to-transparent rounded-full blur-xl" />

          <div
            className="laptop-lid relative w-[700px]"
            style={{ perspective: "1200px" }}
          >
            <div className="relative w-[700px] h-[440px] bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-t-2xl p-3 shadow-2xl border-t border-x border-slate-600/50 flex flex-col justify-between overflow-hidden animate-screen-glow">
              <div className="absolute inset-0 border-[6px] border-slate-950 rounded-t-xl pointer-events-none z-10" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none z-10 rounded-t-xl" />
              <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-white/3 to-transparent pointer-events-none z-10 rounded-t-xl" />
              <div
                className="absolute inset-0 pointer-events-none z-10 rounded-t-xl overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 55%, transparent 100%)",
                  backgroundSize: "200% 200%",
                  animation: "screenShine 4s ease-in-out 2s infinite",
                }}
              />
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent z-10 rounded-t-xl" />
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-slate-800 rounded-full flex items-center justify-center z-20">
                <div className="w-0.5 h-0.5 bg-teal-400 rounded-full opacity-70 animate-pulse" />
              </div>

              <div className="laptop-screen-content w-full h-full bg-[#f4f7f6] rounded shadow-inner flex overflow-hidden relative z-0">
                <DashboardSidebar />
                <DashboardWorkspace />
              </div>
            </div>
          </div>

          <div className="w-[160px] h-2.5 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-b-sm border-b border-slate-950 z-10" />
          <div className="relative w-[730px] h-4 bg-gradient-to-b from-slate-300 via-slate-200 to-slate-400 rounded-b-xl shadow-xl border-x border-b border-slate-400/60 z-0">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-[2px] bg-slate-500/40 rounded-b" />
          </div>
        </div>
      </div>
    </div>
  );
}
