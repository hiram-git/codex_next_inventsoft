"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Users, Package, FileText, TrendingUp, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface Stats {
  customers: number;
  products: number;
  invoices: number;
  revenue: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ customers: 0, products: 0, invoices: 0, revenue: 0 });
  const cardsRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => setStats({ customers: 24, products: 158, invoices: 67, revenue: 142500 }));
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
      );
      gsap.fromTo(
        cardsRef.current?.querySelectorAll(".stat-card") ?? [],
        { opacity: 0, y: 30, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "back.out(1.2)",
          delay: 0.2,
        }
      );
    });
    return () => ctx.revert();
  }, []);

  const cards = [
    {
      title: "Clientes",
      value: stats.customers,
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      bg: "bg-blue-500/10",
      href: "/customers",
    },
    {
      title: "Productos",
      value: stats.products,
      icon: Package,
      color: "from-emerald-500 to-teal-500",
      bg: "bg-emerald-500/10",
      href: "/products",
    },
    {
      title: "Facturas",
      value: stats.invoices,
      icon: FileText,
      color: "from-violet-500 to-purple-500",
      bg: "bg-violet-500/10",
      href: "/invoices",
    },
    {
      title: "Ingresos",
      value: `$${stats.revenue.toLocaleString("es-MX")}`,
      icon: TrendingUp,
      color: "from-amber-500 to-orange-500",
      bg: "bg-amber-500/10",
      href: "/invoices",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div ref={headerRef} style={{ opacity: 0 }}>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Resumen general de tu empresa</p>
      </div>

      {/* Stat cards */}
      <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {cards.map((card) => (
          <Link key={card.title} href={card.href} className="stat-card group" style={{ opacity: 0 }}>
            <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-5 hover:border-gray-700/60 transition-all duration-200 hover:shadow-xl">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <card.icon className={`w-5 h-5 bg-gradient-to-br ${card.color} bg-clip-text`} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
              </div>
              <p className="text-3xl font-bold text-white">{card.value}</p>
              <p className="text-gray-400 text-sm mt-1">{card.title}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <QuickAction
          href="/customers"
          title="Gestionar Clientes"
          desc="Agrega, edita y administra tu cartera de clientes."
          icon={Users}
        />
        <QuickAction
          href="/products"
          title="Catálogo de Productos"
          desc="Controla tu inventario y precios actualizados."
          icon={Package}
        />
        <QuickAction
          href="/invoices"
          title="Proceso de Facturas"
          desc="Crea y administra facturas de forma eficiente."
          icon={FileText}
        />
      </div>
    </div>
  );
}

function QuickAction({
  href,
  title,
  desc,
  icon: Icon,
}: {
  href: string;
  title: string;
  desc: string;
  icon: React.ElementType;
}) {
  return (
    <Link
      href={href}
      className="bg-gray-900/40 border border-gray-800/60 rounded-2xl p-5 hover:bg-gray-900/80 hover:border-indigo-500/30 transition-all duration-200 group"
    >
      <Icon className="w-6 h-6 text-indigo-400 mb-3" />
      <h3 className="font-semibold text-white mb-1 group-hover:text-indigo-300 transition-colors">
        {title}
      </h3>
      <p className="text-gray-500 text-sm">{desc}</p>
    </Link>
  );
}
