"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  LayoutDashboard,
  Radar,
  BookOpen,
  Camera,
  Briefcase,
  MessageSquare,
  Video,
  CalendarDays,
  BarChart3,
  Users,
  Bookmark,
  Settings,
  Sparkles,
  ListChecks,
} from "lucide-react";
import { AccountToggle } from "@/components/ui/account-toggle";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number }> };

const NAV_GROUPS: { heading: string; items: NavItem[] }[] = [
  {
    heading: "Overview",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/research", label: "Research", icon: Radar },
    ],
  },
  {
    heading: "Content",
    items: [
      { href: "/strategy", label: "Strategy", icon: BookOpen },
      { href: "/instagram", label: "Instagram", icon: Camera },
      { href: "/linkedin", label: "LinkedIn", icon: Briefcase },
      { href: "/twitter", label: "Twitter / X", icon: MessageSquare },
      { href: "/youtube", label: "YouTube", icon: Video },
    ],
  },
  {
    heading: "Operations",
    items: [
      { href: "/tasks", label: "Tasks", icon: ListChecks },
      { href: "/calendar", label: "Calendar", icon: CalendarDays },
      { href: "/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/tracked-accounts", label: "Tracked Accounts", icon: Users },
      { href: "/evergreen", label: "Evergreen", icon: Bookmark },
    ],
  },
];

const SETTINGS_ITEMS: NavItem[] = [{ href: "/settings", label: "Voice Settings", icon: Settings }];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  // Prefetch every nav destination as soon as the sidebar mounts so the
  // first click after load is served from cache and feels instant.
  useEffect(() => {
    const ALL: NavItem[] = [...NAV_GROUPS.flatMap((g) => g.items), ...SETTINGS_ITEMS];
    ALL.forEach((item) => router.prefetch(item.href));
  }, [router]);

  // Reset the optimistic pending state once navigation settles
  useEffect(() => {
    if (!pending) setPendingHref(null);
  }, [pending]);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  function NavLink({ item }: { item: NavItem }) {
    const active = isActive(item.href);
    const isPending = pendingHref === item.href;
    // Treat the clicked link as visually active immediately so the UI feels instant
    const highlight = active || isPending;
    const Icon = item.icon;
    return (
      <Link
        href={item.href}
        prefetch
        onClick={(e) => {
          // Immediate visual state flip + soft replace (no history spam)
          if (item.href === pathname) return;
          e.preventDefault();
          setPendingHref(item.href);
          startTransition(() => {
            router.push(item.href);
          });
        }}
        className={`group relative flex items-center gap-3 mx-3 px-3 py-2 rounded-md text-[13px] transition-all duration-150 ${
          highlight
            ? "bg-azen-accent/10 text-white font-semibold shadow-[inset_0_0_0_1px_rgba(var(--color-azen-accent-rgb), 0.25)]"
            : "text-azen-text hover:text-white hover:bg-azen-surface-2"
        }`}
      >
        <Icon size={16} strokeWidth={highlight ? 2.3 : 1.8} />
        <span className="flex-1">{item.label}</span>
        {isPending ? (
          <span className="h-3 w-3 border-2 border-azen-accent border-t-transparent rounded-full animate-spin" />
        ) : active ? (
          <span className="h-1.5 w-1.5 rounded-full bg-azen-accent shadow-[0_0_8px_rgba(var(--color-azen-accent-rgb), 0.8)]" />
        ) : null}
      </Link>
    );
  }

  return (
    <aside className="w-[240px] bg-azen-surface/55 backdrop-blur-2xl backdrop-saturate-150 border-r border-white/[0.07] flex flex-col h-screen fixed left-0 top-0 z-20">
      {/* Brand lockup */}
      <div className="px-6 py-6 border-b border-white/[0.06]">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span
            className="relative h-8 w-8 rounded-lg flex items-center justify-center shadow-accent"
            style={{
              background:
                "linear-gradient(135deg, var(--color-azen-accent), color-mix(in srgb, var(--color-azen-accent) 55%, black))",
            }}
          >
            <Sparkles size={14} strokeWidth={2.2} className="text-azen-bg" />
          </span>
          <div className="leading-none">
            <div className="font-display font-semibold text-white text-[22px] tracking-tight">azen</div>
            <div className="text-azen-muted text-[9px] uppercase tracking-[0.2em] mt-0.5">content · hub</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.heading} className="mb-5">
            <div className="px-6 mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-azen-muted/70">
              {group.heading}
            </div>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Settings + Account */}
      <div className="border-t border-white/[0.06]">
        <div className="py-3">
          {SETTINGS_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>
        <div className="px-5 py-4 border-t border-white/[0.04]">
          <div className="text-azen-muted text-[10px] uppercase tracking-[0.2em] mb-2">Account</div>
          <AccountToggle />
        </div>
      </div>
    </aside>
  );
}
