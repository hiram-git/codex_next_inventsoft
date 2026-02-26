"use client";

import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import { Plus, Pencil, Trash2, UserCheck, UserX } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  active: boolean;
}

const schema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Correo inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  taxId: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    gsap.fromTo(headerRef.current, { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.5 });
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/customers");
      const data = await res.json();
      setCustomers(data);
    } catch {
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    reset({});
    setModalOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setEditing(customer);
    reset(customer);
    setModalOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/customers/${editing.id}` : "/api/customers";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setModalOpen(false);
    loadCustomers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este cliente?")) return;
    await fetch(`/api/customers/${id}`, { method: "DELETE" });
    loadCustomers();
  };

  const columns = [
    { key: "name", label: "Nombre" },
    { key: "email", label: "Correo" },
    { key: "phone", label: "Teléfono" },
    { key: "city", label: "Ciudad" },
    {
      key: "active",
      label: "Estado",
      render: (v: unknown) =>
        v ? (
          <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-medium">
            <UserCheck className="w-3 h-3" /> Activo
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-red-400 text-xs font-medium">
            <UserX className="w-3 h-3" /> Inactivo
          </span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div ref={headerRef} className="flex items-center justify-between" style={{ opacity: 0 }}>
        <div>
          <h1 className="text-2xl font-bold text-white">Clientes</h1>
          <p className="text-gray-400 text-sm mt-1">{customers.length} clientes registrados</p>
        </div>
        <Button onClick={openCreate} icon={<Plus className="w-4 h-4" />}>
          Nuevo cliente
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={customers}
        loading={loading}
        searchPlaceholder="Buscar clientes..."
        emptyMessage="No hay clientes registrados"
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
        title={editing ? "Editar Cliente" : "Nuevo Cliente"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nombre *" error={errors.name?.message}>
              <input {...register("name")} className={inputCls} placeholder="Juan Pérez" />
            </Field>
            <Field label="Correo" error={errors.email?.message}>
              <input {...register("email")} type="email" className={inputCls} placeholder="juan@ejemplo.com" />
            </Field>
            <Field label="Teléfono">
              <input {...register("phone")} className={inputCls} placeholder="+52 55 1234 5678" />
            </Field>
            <Field label="RFC / NIT">
              <input {...register("taxId")} className={inputCls} placeholder="XXXX000000XXX" />
            </Field>
            <Field label="Ciudad">
              <input {...register("city")} className={inputCls} placeholder="Ciudad de México" />
            </Field>
            <Field label="País">
              <input {...register("country")} className={inputCls} placeholder="México" />
            </Field>
          </div>
          <Field label="Dirección">
            <input {...register("address")} className={inputCls} placeholder="Av. Ejemplo 123, Col. Centro" />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {editing ? "Actualizar" : "Crear cliente"}
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
