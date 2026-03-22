"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountToggle } from "@/components/ui/account-toggle";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "grid" },
  { href: "/research", label: "Research Feed", icon: "search" },
  { href: "/instagram", label: "Instagram", icon: "camera" },
  { href: "/linkedin", label: "LinkedIn", icon: "briefcase" },
  { href: "/twitter", label: "Twitter/X", icon: "message" },
  { href: "/youtube", label: "YouTube", icon: "play" },
  { href: "/calendar", label: "Content Calendar", icon: "calendar" },
  { href: "/analytics", label: "Analytics", icon: "chart" },
  { href: "/tracked-accounts", label: "Tracked Accounts", icon: "users" },
  { href: "/evergreen", label: "Evergreen Library", icon: "bookmark" },
  { href: "/settings", label: "Voice Settings", icon: "settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[220px] bg-azen-card border-r border-azen-border flex flex-col h-screen fixed left-0 top-0">
      <div className="px-5 py-6 border-b border-azen-border">
        <span className="text-white text-[22px] font-bold">azen</span>
        <span className="text-azen-accent text-[10px] ml-1">content</span>
      </div>

      <nav className="flex-1 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-5 py-2.5 text-[13px] transition-colors ${
                isActive
                  ? "text-azen-accent font-semibold bg-azen-accent/[0.08] border-l-[3px] border-azen-accent"
                  : "text-azen-text hover:text-white border-l-[3px] border-transparent"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-azen-border">
        <div className="text-azen-text text-[11px] uppercase tracking-wider mb-2">Account</div>
        <AccountToggle />
      </div>
    </aside>
  );
}
