"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import StampwerkLogo from "./StampwerkLogo";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/clients", label: "Clients", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { href: "/projects", label: "Projects", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { href: "/invoices", label: "Invoices", icon: "M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" },
  { href: "/contracts", label: "Contracts", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen">
      {/* Sidebar — arcade cabinet panel */}
      <aside
        className="w-56 flex flex-col flex-shrink-0"
        style={{
          background: "linear-gradient(180deg, #3D1810 0%, #2a1209 60%, #1e0d07 100%)",
          boxShadow: "inset -1px 0 0 #5C2419, 2px 0 8px rgba(0,0,0,0.4)",
        }}
      >
        {/* Logo area */}
        <div className="px-5 py-5 border-b border-stamp-800">
          <div className="flex items-center gap-2.5">
            <StampwerkLogo size={28} />
            <div>
              <h1
                className="font-heading text-[9px] text-stamp-300 tracking-wider"
                style={{ textShadow: "0 0 10px rgba(139,58,42,0.5)" }}
              >
                STAMPWERK
              </h1>
              {user?.business_name && (
                <p className="text-[10px] text-stamp-600 truncate font-mono tracking-wide mt-0.5">
                  {user.business_name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2.5 space-y-0.5">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`arcade-nav-item relative ${
                  active
                    ? "text-stamp-200 bg-stamp-900/70"
                    : "text-stamp-500 hover:bg-stamp-800/50 hover:text-stamp-300"
                }`}
                style={active ? { boxShadow: "inset 2px 0 0 #B5604A" } : undefined}
              >
                {/* Active indicator bar */}
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 font-mono text-[7px] text-stamp-400 pl-1">
                    &#9658;
                  </span>
                )}
                <svg
                  className={`w-4 h-4 flex-shrink-0 ml-2 ${active ? "text-stamp-300" : "text-stamp-600"}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                <span className="text-[9px] tracking-[0.15em]">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User section — cabinet player slot */}
        <div className="px-2.5 py-3 border-t border-stamp-800">
          <div
            className="flex items-center gap-2.5 px-2 py-2 rounded-arcade"
            style={{ background: "rgba(0,0,0,0.2)" }}
          >
            {/* Avatar badge */}
            <div
              className="w-7 h-7 rounded-retro flex items-center justify-center text-[8px] font-bold text-stamp-200 font-mono flex-shrink-0 border border-stamp-700"
              style={{
                background: "linear-gradient(135deg, #5C2419 0%, #3D1810 100%)",
                boxShadow: "1px 1px 0 #1e0d07",
              }}
            >
              {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-mono text-stamp-400 truncate leading-tight">
                {user?.name || user?.email}
              </p>
              <p className="text-[8px] font-mono text-stamp-700 tracking-wider">ONLINE</p>
            </div>
            <button
              onClick={logout}
              title="Sign out"
              className="text-stamp-700 hover:text-stamp-400 transition-colors flex-shrink-0 p-0.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-parchment">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
