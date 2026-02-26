import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateProductDescription(name: string, category?: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Eres un asistente de ventas que genera descripciones de productos cortas, atractivas y profesionales en español. Máximo 2 oraciones.",
      },
      {
        role: "user",
        content: `Genera una descripción para el producto: "${name}"${category ? ` de categoría: ${category}` : ""}.`,
      },
    ],
    max_tokens: 100,
  });

  return completion.choices[0]?.message?.content ?? "";
}

export async function suggestInvoiceNotes(customerName: string, total: number): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Eres un asistente de facturación que genera notas profesionales para facturas en español. Máximo 1 oración.",
      },
      {
        role: "user",
        content: `Genera una nota para la factura del cliente "${customerName}" por un total de $${total}.`,
      },
    ],
    max_tokens: 80,
  });

  return completion.choices[0]?.message?.content ?? "";
}
