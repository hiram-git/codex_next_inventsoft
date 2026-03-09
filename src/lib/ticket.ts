/**
 * Thermal ticket printing via node-thermal-printer
 *
 * Configuration via environment variables:
 *   PRINTER_TYPE    = "network" | "printer" (default: network)
 *   PRINTER_HOST    = IP address       (network, default: 192.168.1.100)
 *   PRINTER_PORT    = port number      (network, default: 9100)
 *   PRINTER_NAME    = device path/name (printer type, e.g. /dev/usb/lp0)
 *   PRINTER_WIDTH   = 32 | 48          (58mm=32, 80mm=48, default: 32)
 */

// node-thermal-printer does not ship types; loaded via require inside buildPrinter

const W = parseInt(process.env.PRINTER_WIDTH ?? '32'); // chars per line

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildPrinter() {
  const type   = process.env.PRINTER_TYPE ?? 'network';
  const host   = process.env.PRINTER_HOST ?? '192.168.1.100';
  const port   = parseInt(process.env.PRINTER_PORT ?? '9100');
  const name   = process.env.PRINTER_NAME ?? '/dev/usb/lp0';

  const { ThermalPrinter: Printer, PrinterTypes: Types } = require('node-thermal-printer');

  const printer = new Printer({
    type: type === 'network' ? Types.EPSON : Types.EPSON,
    interface: type === 'network' ? `tcp://${host}:${port}` : `file://${name}`,
    characterSet: 'PC858_EURO',
    removeSpecialCharacters: false,
    lineCharacter: '-',
    width: W,
  });

  return printer;
}

/** Pad string on the right to length n */
function padR(s: string, n: number) { return s.substring(0, n).padEnd(n); }
/** Pad string on the left to length n */
function padL(s: string, n: number) { return s.substring(0, n).padStart(n); }

/** Two-column line: left + right justified, total = W chars */
function twoCol(left: string, right: string) {
  const max = W - right.length - 1;
  return padR(left, max) + ' ' + right;
}

/** Format currency */
function money(n: number) {
  return '$' + n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Ticket builders ──────────────────────────────────────────────────────────

export async function imprimirTicketFactura(factura: any, empresa: any): Promise<void> {
  const printer = buildPrinter();

  printer.alignCenter();
  printer.bold(true); printer.setTextDoubleHeight(); printer.println(empresa.nombre ?? 'Empresa');
  printer.setTextNormal(); printer.bold(false);
  if (empresa.rfc)       printer.println(empresa.rfc);
  if (empresa.direccion) printer.println(empresa.direccion);
  if (empresa.telefono)  printer.println(`Tel: ${empresa.telefono}`);
  printer.drawLine();

  printer.alignLeft();
  printer.println(`Factura : ${factura.numero}`);
  printer.println(`Fecha   : ${factura.fecha}`);
  if (factura.fechaVencimiento)
    printer.println(`Vence   : ${factura.fechaVencimiento}`);
  printer.println(`Cliente : ${factura.clienteNombre}`);
  printer.println(`Estado  : ${factura.estado.toUpperCase()}`);
  printer.drawLine();

  // Items
  for (const item of factura.items ?? []) {
    printer.println(item.productoNombre.substring(0, W));
    printer.println(twoCol(`  ${item.cantidad} x ${money(item.precioUnitario)}`, money(item.subtotal)));
  }

  printer.drawLine();
  printer.alignRight();
  printer.println(twoCol('Subtotal:', money(factura.subtotal)));
  printer.println(twoCol('IVA 16%:', money(factura.iva)));
  printer.bold(true); printer.setTextDoubleHeight();
  printer.println(twoCol('TOTAL:', money(factura.total)));
  printer.setTextNormal(); printer.bold(false);

  printer.drawLine();
  printer.alignCenter();
  printer.println('¡Gracias por su compra!');
  if (empresa.email) printer.println(empresa.email);

  printer.cut();
  await printer.execute();
}

export async function imprimirTicketCobro(cobro: any, factura: any, empresa: any): Promise<void> {
  const printer = buildPrinter();

  printer.alignCenter();
  printer.bold(true); printer.setTextDoubleHeight(); printer.println(empresa.nombre ?? 'Empresa');
  printer.setTextNormal(); printer.bold(false);
  if (empresa.rfc) printer.println(empresa.rfc);
  printer.drawLine();

  printer.alignCenter();
  printer.bold(true); printer.println('RECIBO DE PAGO'); printer.bold(false);
  printer.drawLine();

  printer.alignLeft();
  printer.println(`Cobro   : ${cobro.numero}`);
  printer.println(`Fecha   : ${cobro.fecha}`);
  printer.println(`Cliente : ${cobro.clienteNombre}`);
  printer.println(`Factura : ${cobro.facturaNumero}`);
  printer.println(`Metodo  : ${cobro.metodoPago.toUpperCase()}`);
  if (cobro.referencia) printer.println(`Ref     : ${cobro.referencia}`);
  printer.drawLine();

  if (factura) {
    printer.println(twoCol('Total factura:', money(factura.total)));
    printer.println(twoCol('Pagado antes:', money(factura.total - factura.saldo - cobro.monto)));
  }

  printer.bold(true); printer.setTextDoubleHeight();
  printer.println(twoCol('MONTO COBRADO:', money(cobro.monto)));
  printer.setTextNormal(); printer.bold(false);

  if (factura && factura.saldo !== undefined) {
    const saldoRestante = Math.max(0, factura.saldo - cobro.monto);
    printer.println(twoCol('Saldo pendiente:', money(saldoRestante)));
  }

  printer.drawLine();
  printer.alignCenter();
  printer.println('Pago recibido conforme');
  if (cobro.notas) printer.println(cobro.notas.substring(0, W));

  printer.cut();
  await printer.execute();
}

export async function imprimirTicketCotizacion(cot: any, empresa: any): Promise<void> {
  const printer = buildPrinter();

  printer.alignCenter();
  printer.bold(true); printer.setTextDoubleHeight(); printer.println(empresa.nombre ?? 'Empresa');
  printer.setTextNormal(); printer.bold(false);
  if (empresa.rfc)       printer.println(empresa.rfc);
  if (empresa.direccion) printer.println(empresa.direccion);
  printer.drawLine();

  printer.alignCenter();
  printer.bold(true); printer.println('COTIZACION'); printer.bold(false);
  printer.drawLine();

  printer.alignLeft();
  printer.println(`No      : ${cot.numero}`);
  printer.println(`Fecha   : ${cot.fecha}`);
  if (cot.fechaVencimiento)
    printer.println(`Valida  : ${cot.fechaVencimiento}`);
  printer.println(`Cliente : ${cot.clienteNombre}`);
  printer.drawLine();

  for (const item of cot.items ?? []) {
    printer.println(item.productoNombre.substring(0, W));
    printer.println(twoCol(`  ${item.cantidad} x ${money(item.precioUnitario)}`, money(item.subtotal)));
  }

  printer.drawLine();
  printer.alignRight();
  printer.println(twoCol('Subtotal:', money(cot.subtotal)));
  printer.println(twoCol('IVA 16%:', money(cot.iva)));
  printer.bold(true); printer.setTextDoubleHeight();
  printer.println(twoCol('TOTAL:', money(cot.total)));
  printer.setTextNormal(); printer.bold(false);

  printer.drawLine();
  printer.alignCenter();
  if (cot.notas) { printer.println(cot.notas.substring(0, W)); printer.newLine(); }
  printer.println('Cotizacion sujeta a cambios');
  printer.println('sin previo aviso');

  printer.cut();
  await printer.execute();
}

export async function imprimirTicketPedido(pedido: any, empresa: any): Promise<void> {
  const printer = buildPrinter();

  printer.alignCenter();
  printer.bold(true); printer.setTextDoubleHeight(); printer.println(empresa.nombre ?? 'Empresa');
  printer.setTextNormal(); printer.bold(false);
  printer.drawLine();

  printer.alignCenter();
  printer.bold(true); printer.println('PEDIDO'); printer.bold(false);
  printer.drawLine();

  printer.alignLeft();
  printer.println(`Pedido  : ${pedido.numero}`);
  printer.println(`Fecha   : ${pedido.fecha}`);
  printer.println(`Cliente : ${pedido.clienteNombre}`);
  printer.println(`Almacen : ${pedido.almacenNombre}`);
  printer.println(`Estado  : ${pedido.estado.toUpperCase()}`);
  printer.drawLine();

  for (const item of pedido.items ?? []) {
    printer.println(item.productoNombre.substring(0, W));
    printer.println(twoCol(`  ${item.cantidad} x ${money(item.precioUnitario)}`, money(item.subtotal)));
  }

  printer.drawLine();
  printer.alignRight();
  printer.println(twoCol('Subtotal:', money(pedido.subtotal)));
  printer.println(twoCol('IVA 16%:', money(pedido.iva)));
  printer.bold(true); printer.setTextDoubleHeight();
  printer.println(twoCol('TOTAL:', money(pedido.total)));
  printer.setTextNormal(); printer.bold(false);

  if (pedido.notas) {
    printer.drawLine();
    printer.alignLeft();
    printer.println(pedido.notas.substring(0, W));
  }

  printer.cut();
  await printer.execute();
}
