"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ShieldCheck } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface Permission { id: string; module: string; action: string; description: string; }
interface Role {
  id: string;
  name: string;
  description: string;
  permissions: { permissionId: string; permission: Permission }[];
}

const schema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  description: z.string().optional(),
  permissionIds: z.array(z.string()),
});
type FormData = z.infer<typeof schema>;

const MODULES = ["customers", "products", "invoices", "settings", "users"] as const;
const ACTIONS = ["create", "read", "update", "delete"] as const;

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { permissionIds: [] } });

  const selectedPermissions = watch("permissionIds");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [r, p] = await Promise.all([
        fetch("/api/settings/roles").then((r) => r.json()),
        fetch("/api/settings/permissions").then((r) => r.json()),
      ]);
      setRoles(r);
      setPermissions(p);
    } catch {
      setRoles([]); setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (id: string) => {
    const curr = selectedPermissions ?? [];
    setValue(
      "permissionIds",
      curr.includes(id) ? curr.filter((p) => p !== id) : [...curr, id]
    );
  };

  const openCreate = () => {
    setEditing(null);
    reset({ permissionIds: [] });
    setModalOpen(true);
  };

  const openEdit = (role: Role) => {
    setEditing(role);
    reset({
      name: role.name,
      description: role.description,
      permissionIds: role.permissions.map((rp) => rp.permissionId),
    });
    setModalOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    const url = editing ? `/api/settings/roles/${editing.id}` : "/api/settings/roles";
    await fetch(url, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setModalOpen(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este rol?")) return;
    await fetch(`/api/settings/roles/${id}`, { method: "DELETE" });
    loadData();
  };

  const columns = [
    { key: "name", label: "Nombre", render: (v: unknown) => (
      <span className="font-medium text-white">{String(v)}</span>
    )},
    { key: "description", label: "Descripción" },
    {
      key: "permissions",
      label: "Permisos",
      render: (_: unknown, row: Role) => (
        <span className="text-indigo-400 text-xs">{row.permissions?.length ?? 0} permisos</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Roles y Permisos</h1>
            <p className="text-gray-400 text-sm">Gestiona el control de acceso</p>
          </div>
        </div>
        <Button onClick={openCreate} icon={<Plus className="w-4 h-4" />}>
          Nuevo rol
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={roles}
        loading={loading}
        searchPlaceholder="Buscar roles..."
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Rol" : "Nuevo Rol"} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">Nombre *</label>
              <input {...register("name")} className={inputCls} placeholder="Administrador" />
              {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">Descripción</label>
              <input {...register("description")} className={inputCls} placeholder="Acceso total al sistema" />
            </div>
          </div>

          {/* Permissions matrix */}
          <div>
            <label className="text-sm font-medium text-gray-300 block mb-3">Permisos</label>
            <div className="bg-gray-800/40 rounded-xl p-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left text-gray-500 font-medium pb-3">Módulo</th>
                    {ACTIONS.map((a) => (
                      <th key={a} className="text-center text-gray-500 font-medium pb-3 px-2">
                        {a.charAt(0).toUpperCase() + a.slice(1)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {MODULES.map((mod) => (
                    <tr key={mod}>
                      <td className="py-2.5 text-gray-300 capitalize">{mod}</td>
                      {ACTIONS.map((action) => {
                        const perm = permissions.find(
                          (p) => p.module === mod && p.action === action
                        );
                        return (
                          <td key={action} className="py-2.5 text-center">
                            <input
                              type="checkbox"
                              disabled={!perm}
                              checked={perm ? (selectedPermissions ?? []).includes(perm.id) : false}
                              onChange={() => perm && togglePermission(perm.id)}
                              className="w-4 h-4 rounded accent-indigo-500 cursor-pointer disabled:opacity-30"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={isSubmitting}>{editing ? "Actualizar" : "Crear rol"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

const inputCls =
  "w-full bg-gray-800/60 border border-gray-700/60 rounded-xl px-3.5 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all";
