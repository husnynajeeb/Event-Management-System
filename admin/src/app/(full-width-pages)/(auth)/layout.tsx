import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import { ThemeProvider } from "@/context/ThemeContext";
import Link from "next/link";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-white dark:bg-[#0a0a0f]">
      <ThemeProvider>
        <div className="flex lg:flex-row w-full min-h-screen">

          {/* ── Left: Form Panel ── */}
          <div className="lg:w-1/2 w-full flex items-center justify-center px-6 py-12 sm:px-12 bg-white dark:bg-[#0a0a0f]">
            {children}
          </div>

          {/* ── Right: Branding Panel ── */}
          <div className="lg:w-1/2 hidden lg:flex flex-col items-center justify-center relative overflow-hidden bg-[#0d0821] min-h-screen sticky top-0">

            {/* Ambient gradient layers */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a0533] via-[#0d0821] to-[#05102b]" />

            {/* Glowing orbs */}
            <div className="absolute top-[-80px] left-[-80px] w-[420px] h-[420px] rounded-full bg-[#7c3aed]/20 blur-[100px] animate-pulse" />
            <div className="absolute bottom-[-60px] right-[-60px] w-[360px] h-[360px] rounded-full bg-[#2563eb]/20 blur-[100px] animate-pulse delay-700" />
            <div className="absolute top-1/2 left-1/3 w-[200px] h-[200px] rounded-full bg-[#a855f7]/10 blur-[80px]" />

            {/* Dot-grid texture overlay */}
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />

            {/* Decorative floating cards */}
            <div className="absolute top-16 right-12 w-48 h-28 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm flex flex-col gap-2 p-4 rotate-6 shadow-xl">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-purple-600" />
              <div className="h-2 w-3/4 rounded bg-white/20" />
              <div className="h-2 w-1/2 rounded bg-white/10" />
              <div className="mt-auto text-[10px] text-white/30 font-mono tracking-widest">GALA EVENT</div>
            </div>

            <div className="absolute bottom-20 left-10 w-44 h-24 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm flex flex-col gap-2 p-4 -rotate-3 shadow-xl">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500" />
              <div className="h-2 w-2/3 rounded bg-white/20" />
              <div className="h-2 w-2/5 rounded bg-white/10" />
              <div className="mt-auto text-[10px] text-white/30 font-mono tracking-widest">CONF 2025</div>
            </div>

            {/* Main branding */}
            <div className="relative z-10 flex flex-col items-center text-center px-10 gap-5">
              {/* Logo mark */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-[0_0_40px_rgba(124,58,237,0.5)] mb-2">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M16 4L28 10V22L16 28L4 22V10L16 4Z" stroke="white" strokeWidth="1.5" fill="none"/>
                  <circle cx="16" cy="16" r="5" fill="white" fillOpacity="0.9"/>
                </svg>
              </div>

              <Link href="/">
                <h1
                  className="text-5xl font-bold tracking-tight text-white leading-none"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Event<span className="text-violet-400">Nest</span>
                </h1>
              </Link>

              <div className="flex items-center gap-3">
                <div className="h-px w-10 bg-white/20" />
                <p className="text-xs uppercase tracking-[0.25em] text-white/40 font-light">
                  Event Management System
                </p>
                <div className="h-px w-10 bg-white/20" />
              </div>

              <p className="text-white/50 text-sm max-w-[260px] leading-relaxed font-light mt-2">
                Plan, manage, and elevate every occasion — from intimate gatherings to grand galas.
              </p>

              {/* Stat pills */}
              <div className="flex gap-3 mt-6">
                {[
                  { label: "Events", value: "10K+" },
                  { label: "Clients", value: "3.2K" },
                  { label: "Cities", value: "40+" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-center"
                  >
                    <div className="text-white text-sm font-semibold">{s.value}</div>
                    <div className="text-white/30 text-[10px] uppercase tracking-widest">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Theme toggler */}
          <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
            <ThemeTogglerTwo />
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}