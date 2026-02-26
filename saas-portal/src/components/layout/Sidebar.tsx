"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  Settings,
  Building2,
  ShieldCheck,
  UserCog,
  ChevronDown,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const nav = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Clientes",
    href: "/customers",
    icon: Users,
  },
  {
    title: "Productos",
    href: "/products",
    icon: Package,
  },
  {
    title: "Facturas",
    href: "/invoices",
    icon: FileText,
  },
  {
    title: "Configuración",
    icon: Settings,
    children: [
      { title: "Empresa", href: "/settings/company", icon: Building2 },
      { title: "Roles y Permisos", href: "/settings/roles", icon: ShieldCheck },
      { title: "Usuarios", href: "/settings/users", icon: UserCog },
    ],
  },
];

export function Sidebar({ isOpen }: { isOpen: boolean }) {
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLElement>(null);
  const itemsRef = useRef<HTMLLIElement[]>([]);
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  // Entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        sidebarRef.current,
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
      );
      gsap.fromTo(
        itemsRef.current,
        { x: -16, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.05,
          ease: "power2.out",
          delay: 0.3,
        }
      );
    });
    return () => ctx.revert();
  }, []);

  // Auto-open active group
  useEffect(() => {
    nav.forEach((item) => {
      if (item.children) {
        const active = item.children.some((c) => pathname.startsWith(c.href));
        if (active && !openGroups.includes(item.title)) {
          setOpenGroups((prev) => [...prev, item.title]);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <aside
      ref={sidebarRef}
      className={cn(
        "fixed top-0 left-0 h-screen w-[260px] bg-gray-900 border-r border-gray-800/60 z-30 flex flex-col transition-transform duration-300",
        !isOpen && "-translate-x-full lg:translate-x-0"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800/60">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className="text-white font-semibold text-lg tracking-tight">SaaS Portal</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {nav.map((item, idx) => (
            <li
              key={item.title}
              ref={(el) => { if (el) itemsRef.current[idx] = el; }}
            >
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleGroup(item.title)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                      "text-gray-400 hover:text-white hover:bg-gray-800/60"
                    )}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 text-left">{item.title}</span>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform duration-200",
                        openGroups.includes(item.title) && "rotate-180"
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300",
                      openGroups.includes(item.title) ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    <ul className="pl-4 mt-0.5 space-y-0.5 border-l border-gray-800 ml-5">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <NavLink href={child.href} active={isActive(child.href)} icon={child.icon}>
                            {child.title}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <NavLink href={item.href!} active={isActive(item.href!)} icon={item.icon}>
                  {item.title}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-800/60">
        <p className="text-xs text-gray-600 text-center">v1.0.0 · Next.js 15</p>
      </div>
    </aside>
  );
}

function NavLink({
  href,
  active,
  icon: Icon,
  children,
}: {
  href: string;
  active: boolean;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  const handleEnter = () => {
    if (!active) {
      gsap.to(ref.current, { x: 4, duration: 0.2, ease: "power2.out" });
    }
  };
  const handleLeave = () => {
    if (!active) {
      gsap.to(ref.current, { x: 0, duration: 0.2, ease: "power2.inOut" });
    }
  };

  return (
    <Link
      ref={ref}
      href={href}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150",
        active
          ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/20"
          : "text-gray-400 hover:text-white hover:bg-gray-800/60"
      )}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      {children}
    </Link>
  );
}
