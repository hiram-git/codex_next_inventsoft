"use client";

import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import { Plus, Pencil, Trash2, Eye, Send, CheckCircle2 } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Invoice {
  id: string;
  number: string;
  customer: { name: string };
  status: "DRAFT" | "SENT" | "PAID" | "CANCELLED";
  issueDate: string;
  total: string;
}

const statusConfig = {
  DRAFT: { label: "Borrador", cls: "bg-gray-700/60 text-gray-300" },
  SENT: { label: "Enviada", cls: "bg-blue-500/20 text-blue-400" },
  PAID: { label: "Pagada", cls: "bg-emerald-500/20 text-emerald-400" },
  CANCELLED: { label: "Cancelada", cls: "bg-red-500/20 text-red-400" },
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(headerRef.current, { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.5 });
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/invoices");
      setInvoices(await res.json());
    } catch {
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta factura?")) return;
    await fetch(`/api/invoices/${id}`, { method: "DELETE" });
    loadInvoices();
  };

  const handleStatusChange = async (id: string, status: string) => {
    await fetch(`/api/invoices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadInvoices();
  };

  const columns = [
    { key: "number", label: "Número", className: "font-mono text-xs text-indigo-400" },
    {
      key: "customer",
      label: "Cliente",
      render: (_: unknown, row: Invoice) => row.customer?.name ?? "—",
    },
    {
      key: "issueDate",
      label: "Fecha",
      render: (v: unknown) => formatDate(v as string),
    },
    {
      key: "total",
      label: "Total",
      render: (v: unknown) => (
        <span className="text-emerald-400 font-medium">{formatCurrency(v as string)}</span>
      ),
    },
    {
      key: "status",
      label: "Estado",
      render: (v: unknown) => {
        const s = statusConfig[v as keyof typeof statusConfig];
        return (
          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${s.cls}`}>
            {s.label}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div ref={headerRef} className="flex items-center justify-between" style={{ opacity: 0 }}>
        <div>
          <h1 className="text-2xl font-bold text-white">Facturas</h1>
          <p className="text-gray-400 text-sm mt-1">{invoices.length} facturas registradas</p>
        </div>
        <Link href="/invoices/new">
          <Button icon={<Plus className="w-4 h-4" />}>Nueva factura</Button>
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={invoices}
        loading={loading}
        searchPlaceholder="Buscar facturas..."
        emptyMessage="No hay facturas registradas"
        actions={(row) => (
          <>
            <Link href={`/invoices/${row.id}`}>
              <button className="p-1.5 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors">
                <Eye className="w-3.5 h-3.5" />
              </button>
            </Link>
            {row.status === "DRAFT" && (
              <>
                <Link href={`/invoices/${row.id}`}>
                  <button className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </Link>
                <button
                  onClick={() => handleStatusChange(row.id, "SENT")}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                  title="Marcar como enviada"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </>
            )}
            {row.status === "SENT" && (
              <button
                onClick={() => handleStatusChange(row.id, "PAID")}
                className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                title="Marcar como pagada"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => handleDelete(row.id)}
              className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      />
    </div>
  );
}
