"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Building2, Save } from "lucide-react";
import { toast } from "@/components/ui/toast";

const schema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  taxId: z.string().optional(),
  email: z.string().email("Correo inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

export default function CompanyPage() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    fetch("/api/settings/company")
      .then((r) => r.json())
      .then((d) => reset(d))
      .catch(() => {});
  }, [reset]);

  const onSubmit = async (data: FormData) => {
    const res = await fetch("/api/settings/company", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) toast("Datos de empresa actualizados");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Empresa</h1>
          <p className="text-gray-400 text-sm">Información de tu organización</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Nombre de la empresa *" error={errors.name?.message}>
            <input {...register("name")} className={inputCls} placeholder="Mi Empresa S.A." />
          </Field>
          <Field label="RFC / NIT" error={errors.taxId?.message}>
            <input {...register("taxId")} className={inputCls} placeholder="XAXX010101000" />
          </Field>
          <Field label="Correo electrónico" error={errors.email?.message}>
            <input {...register("email")} type="email" className={inputCls} placeholder="info@empresa.com" />
          </Field>
          <Field label="Teléfono">
            <input {...register("phone")} className={inputCls} placeholder="+52 55 0000 0000" />
          </Field>
          <Field label="Ciudad">
            <input {...register("city")} className={inputCls} placeholder="Ciudad de México" />
          </Field>
          <Field label="País">
            <input {...register("country")} className={inputCls} placeholder="México" />
          </Field>
        </div>
        <Field label="Dirección">
          <input {...register("address")} className={inputCls} placeholder="Av. Principal 100, Col. Centro" />
        </Field>
        <Field label="Sitio web" error={errors.website?.message}>
          <input {...register("website")} className={inputCls} placeholder="https://www.empresa.com" />
        </Field>

        <div className="flex justify-end pt-2">
          <Button type="submit" loading={isSubmitting} disabled={!isDirty} icon={<Save className="w-4 h-4" />}>
            Guardar cambios
          </Button>
        </div>
      </form>
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
