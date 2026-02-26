"use client";

import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import { Plus, Pencil, Trash2, Sparkles } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatCurrency } from "@/lib/utils";

interface Product {
  id: string;
  sku: string;
  name: string;
  price: string;
  stock: number;
  unit: string;
  active: boolean;
}

const schema = z.object({
  sku: z.string().min(1, "SKU requerido"),
  name: z.string().min(2, "Nombre requerido"),
  description: z.string().optional(),
  price: z.string().min(1, "Precio requerido"),
  stock: z.string().transform((v) => parseInt(v, 10) || 0),
  unit: z.string().default("unit"),
});

type FormData = z.input<typeof schema>;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
  });

  const productName = watch("name");

  useEffect(() => {
    gsap.fromTo(headerRef.current, { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.5 });
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      setProducts(await res.json());
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    reset({ unit: "unit", stock: "0" });
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    reset({ ...p, price: p.price, stock: String(p.stock) });
    setModalOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/products/${editing.id}` : "/api/products";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setModalOpen(false);
    loadProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este producto?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    loadProducts();
  };

  const generateDescription = async () => {
    if (!productName) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/product-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: productName }),
      });
      const { description } = await res.json();
      setValue("description", description);
    } finally {
      setAiLoading(false);
    }
  };

  const columns = [
    { key: "sku", label: "SKU", className: "font-mono text-xs" },
    { key: "name", label: "Nombre" },
    {
      key: "price",
      label: "Precio",
      render: (v: unknown) => (
        <span className="text-emerald-400 font-medium">{formatCurrency(v as string)}</span>
      ),
    },
    { key: "stock", label: "Stock", render: (v: unknown) => (
      <span className={Number(v) < 10 ? "text-amber-400" : "text-gray-300"}>{String(v)}</span>
    )},
    { key: "unit", label: "Unidad" },
    {
      key: "active",
      label: "Estado",
      render: (v: unknown) => (
        <span className={`text-xs font-medium ${v ? "text-emerald-400" : "text-red-400"}`}>
          {v ? "Activo" : "Inactivo"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div ref={headerRef} className="flex items-center justify-between" style={{ opacity: 0 }}>
        <div>
          <h1 className="text-2xl font-bold text-white">Productos</h1>
          <p className="text-gray-400 text-sm mt-1">{products.length} productos en catálogo</p>
        </div>
        <Button onClick={openCreate} icon={<Plus className="w-4 h-4" />}>
          Nuevo producto
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        searchPlaceholder="Buscar productos..."
        emptyMessage="No hay productos registrados"
        actions={(row) => (
          <>
            <button
              onClick={() => openEdit(row)}
              className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleDelete(row.id)}
              className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar Producto" : "Nuevo Producto"}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="SKU *" error={errors.sku?.message}>
              <input {...register("sku")} className={inputCls} placeholder="PROD-001" />
            </Field>
            <Field label="Nombre *" error={errors.name?.message}>
              <input {...register("name")} className={inputCls} placeholder="Laptop Pro 15" />
            </Field>
            <Field label="Precio *" error={errors.price?.message}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input {...register("price")} className={`${inputCls} pl-7`} placeholder="0.00" />
              </div>
            </Field>
            <Field label="Stock">
              <input {...register("stock")} type="number" className={inputCls} placeholder="0" />
            </Field>
            <Field label="Unidad">
              <select {...register("unit")} className={inputCls}>
                <option value="unit">Unidad</option>
                <option value="kg">Kilogramo</option>
                <option value="lt">Litro</option>
                <option value="box">Caja</option>
                <option value="hour">Hora</option>
              </select>
            </Field>
          </div>

          {/* AI Description */}
          <Field label="Descripción" error={errors.description?.message}>
            <div className="space-y-2">
              <textarea
                {...register("description")}
                className={`${inputCls} resize-none h-20`}
                placeholder="Descripción del producto..."
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={generateDescription}
                loading={aiLoading}
                icon={<Sparkles className="w-3.5 h-3.5 text-violet-400" />}
              >
                Generar con IA
              </Button>
            </div>
          </Field>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {editing ? "Actualizar" : "Crear producto"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

const inputCls =
  "w-full bg-gray-800/60 border border-gray-700/60 rounded-xl px-3.5 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}
