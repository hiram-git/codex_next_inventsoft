"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Plus, Trash2, ArrowLeft, Sparkles } from "lucide-react";
import { formatCurrency, generateInvoiceNumber } from "@/lib/utils";

interface Customer { id: string; name: string; }
interface Product { id: string; name: string; price: string; }

const itemSchema = z.object({
  productId: z.string().optional(),
  description: z.string().min(1, "Descripción requerida"),
  quantity: z.string().transform((v) => parseFloat(v) || 1),
  unitPrice: z.string().transform((v) => parseFloat(v) || 0),
});

const schema = z.object({
  number: z.string().min(1, "Número de factura requerido"),
  customerId: z.string().min(1, "Cliente requerido"),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1, "Agrega al menos un ítem"),
});

type FormData = z.infer<typeof schema>;

export default function InvoicePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = id === "new";

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<FormData>({
      resolver: zodResolver(schema) as any,
      defaultValues: {
        number: generateInvoiceNumber(),
        items: [{ description: "", quantity: "1" as any, unitPrice: "0" as any }],
      },
    });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchItems = watch("items");
  const watchCustomerId = watch("customerId");

  const subtotal = watchItems?.reduce(
    (acc, item) => acc + (item.quantity || 0) * (item.unitPrice || 0),
    0
  ) ?? 0;
  const tax = subtotal * 0.16;
  const total = subtotal + tax;

  useEffect(() => {
    fetch("/api/customers").then((r) => r.json()).then(setCustomers).catch(() => []);
    fetch("/api/products").then((r) => r.json()).then(setProducts).catch(() => []);

    if (!isNew) {
      fetch(`/api/invoices/${id}`)
        .then((r) => r.json())
        .then((data) => {
          setValue("number", data.number);
          setValue("customerId", data.customerId);
          setValue("notes", data.notes ?? "");
          setValue(
            "items",
            data.items.map((i: { productId?: string; description: string; quantity: number; unitPrice: number }) => ({
              productId: i.productId,
              description: i.description,
              quantity: Number(i.quantity),
              unitPrice: Number(i.unitPrice),
            }))
          );
        });
    }
  }, [id, isNew, setValue]);

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setValue(`items.${index}.description`, product.name);
      setValue(`items.${index}.unitPrice`, parseFloat(product.price));
    }
  };

  const generateNotes = async () => {
    const customer = customers.find((c) => c.id === watchCustomerId);
    if (!customer) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/invoice-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName: customer.name, total }),
      });
      const { notes } = await res.json();
      setValue("notes", notes);
    } finally {
      setAiLoading(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    const url = isNew ? "/api/invoices" : `/api/invoices/${id}`;
    const method = isNew ? "POST" : "PUT";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, subtotal, tax, total }),
    });
    if (res.ok) router.push("/invoices");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isNew ? "Nueva Factura" : "Editar Factura"}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header */}
        <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Información general
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Número de factura *" error={errors.number?.message}>
              <input {...register("number")} className={inputCls} />
            </Field>
            <Field label="Cliente *" error={errors.customerId?.message}>
              <select {...register("customerId")} className={inputCls}>
                <option value="">Seleccionar cliente...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Fecha de vencimiento">
              <input {...register("dueDate")} type="date" className={inputCls} />
            </Field>
          </div>
        </div>

        {/* Items */}
        <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Líneas de factura
            </h2>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })}
            >
              Agregar línea
            </Button>
          </div>

          <div className="space-y-3">
            {/* Header row */}
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 px-1">
              <div className="col-span-4">Descripción</div>
              <div className="col-span-3">Producto (opcional)</div>
              <div className="col-span-2 text-right">Cantidad</div>
              <div className="col-span-2 text-right">P. Unitario</div>
              <div className="col-span-1" />
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-4">
                  <input
                    {...register(`items.${index}.description`)}
                    className={inputCls}
                    placeholder="Descripción del servicio..."
                  />
                  {errors.items?.[index]?.description && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.items[index]?.description?.message}
                    </p>
                  )}
                </div>
                <div className="col-span-3">
                  <select
                    className={inputCls}
                    onChange={(e) => handleProductChange(index, e.target.value)}
                    defaultValue=""
                  >
                    <option value="">Seleccionar...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <input
                    {...register(`items.${index}.quantity`)}
                    type="number"
                    step="0.001"
                    className={`${inputCls} text-right`}
                    placeholder="1"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    {...register(`items.${index}.unitPrice`)}
                    type="number"
                    step="0.01"
                    className={`${inputCls} text-right`}
                    placeholder="0.00"
                  />
                </div>
                <div className="col-span-1 flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-6 flex justify-end">
            <div className="w-60 space-y-2">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>IVA (16%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-white border-t border-gray-700 pt-2">
                <span>Total</span>
                <span className="text-emerald-400">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Notas</h2>
          <textarea
            {...register("notes")}
            className={`${inputCls} h-24 resize-none`}
            placeholder="Notas adicionales para el cliente..."
          />
          <div className="mt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={generateNotes}
              loading={aiLoading}
              icon={<Sparkles className="w-3.5 h-3.5 text-violet-400" />}
            >
              Sugerir nota con IA
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isNew ? "Crear factura" : "Actualizar factura"}
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
