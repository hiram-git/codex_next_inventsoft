"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, UserCog } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface Role { id: string; name: string; }
interface User {
  id: string;
  name: string;
  email: string;
  role: { name: string };
  active: boolean;
}

const createSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres").optional(),
  roleId: z.string().min(1, "Rol requerido"),
  active: z.boolean().optional().default(true),
});

type FormData = z.infer<typeof createSchema>;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(createSchema) as any, defaultValues: { active: true } });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [u, r] = await Promise.all([
        fetch("/api/settings/users").then((r) => r.json()),
        fetch("/api/settings/roles").then((r) => r.json()),
      ]);
      setUsers(u);
      setRoles(r);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    reset({ active: true });
    setModalOpen(true);
  };

  const openEdit = (user: User) => {
    setEditing(user);
    reset({ name: user.name, email: user.email, active: user.active });
    setModalOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    const url = editing ? `/api/settings/users/${editing.id}` : "/api/settings/users";
    await fetch(url, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setModalOpen(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este usuario?")) return;
    await fetch(`/api/settings/users/${id}`, { method: "DELETE" });
    loadData();
  };

  const columns = [
    { key: "name", label: "Nombre" },
    { key: "email", label: "Correo" },
    {
      key: "role",
      label: "Rol",
      render: (_: unknown, row: User) => (
        <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-500/20 text-indigo-400">
          {row.role?.name}
        </span>
      ),
    },
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <UserCog className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Usuarios</h1>
            <p className="text-gray-400 text-sm">Gestiona los accesos al sistema</p>
          </div>
        </div>
        <Button onClick={openCreate} icon={<Plus className="w-4 h-4" />}>
          Nuevo usuario
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        searchPlaceholder="Buscar usuarios..."
        actions={(row) => (
          <>
            <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => handleDelete(row.id)} className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Usuario" : "Nuevo Usuario"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">Nombre *</label>
              <input {...register("name")} className={inputCls} placeholder="Juan Pérez" />
              {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">Correo *</label>
              <input {...register("email")} type="email" className={inputCls} placeholder="juan@empresa.com" />
              {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
            </div>
          </div>

          {!editing && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">Contraseña *</label>
              <input {...register("password")} type="password" className={inputCls} placeholder="••••••••" />
              {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">Rol *</label>
              <select {...register("roleId")} className={inputCls}>
                <option value="">Seleccionar rol...</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              {errors.roleId && <p className="text-red-400 text-xs">{errors.roleId.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">Estado</label>
              <div className="flex items-center gap-3 h-[42px]">
                <input {...register("active")} type="checkbox" id="active" className="w-4 h-4 rounded accent-indigo-500" />
                <label htmlFor="active" className="text-sm text-gray-300">Usuario activo</label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={isSubmitting}>{editing ? "Actualizar" : "Crear usuario"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

const inputCls =
  "w-full bg-gray-800/60 border border-gray-700/60 rounded-xl px-3.5 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all";
