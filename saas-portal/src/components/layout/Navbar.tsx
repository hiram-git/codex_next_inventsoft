"use client";

import { useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { gsap } from "gsap";
import { Menu, Bell, ChevronDown, LogOut, User, Settings } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Navbar({
  onMenuToggle,
}: {
  onMenuToggle: () => void;
}) {
  const { data: session } = useSession();
  const navRef = useRef<HTMLElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const user = session?.user as {
    name?: string;
    email?: string;
    role?: string;
    avatar?: string;
  } | undefined;

  // Entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        navRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power3.out", delay: 0.1 }
      );
    });
    return () => ctx.revert();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = () => {
    gsap.to("body", {
      opacity: 0,
      duration: 0.3,
      onComplete: () => void signOut({ callbackUrl: "/login" }),
    });
  };

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "U";

  return (
    <header
      ref={navRef}
      className="fixed top-0 right-0 left-0 lg:left-[260px] h-16 bg-gray-900/95 backdrop-blur-md border-b border-gray-800/60 z-20 flex items-center px-4 lg:px-6 gap-4"
      style={{ opacity: 0 }}
    >
      {/* Mobile menu */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title placeholder */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications bell */}
        <button className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
        </button>

        {/* User dropdown */}
        <div ref={userMenuRef} className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-gray-800 transition-colors duration-150"
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-white leading-none">{user?.name ?? "Usuario"}</p>
              <p className="text-xs text-gray-500 mt-0.5">{user?.role ?? "Admin"}</p>
            </div>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-gray-500 transition-transform duration-200",
                dropdownOpen && "rotate-180"
              )}
            />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50">
              {/* User info header */}
              <div className="px-4 py-3 border-b border-gray-800">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>

              <div className="p-1">
                <DropdownItem href="/settings/users" icon={User}>
                  Mi perfil
                </DropdownItem>
                <DropdownItem href="/settings/company" icon={Settings}>
                  Configuración
                </DropdownItem>
              </div>

              <div className="p-1 border-t border-gray-800">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function DropdownItem({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
    >
      <Icon className="w-4 h-4" />
      {children}
    </Link>
  );
}
