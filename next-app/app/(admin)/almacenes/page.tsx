'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

type Almacen = {
  id: string;
  nombre: string;
  descripcion: string | null;
  ubicacion: string | null;
  activo: boolean;
};

type FormState = {
  nombre: string;
  descripcion: string;
  ubicacion: string;
  activo: boolean;
};

const emptyForm: FormState = {
  nombre: '',
  descripcion: '',
  ubicacion: '',
  activo: true,
};

export default function AlmacenesPage() {
  const [rows, setRows] = useState<Almacen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/almacenes', { cache: 'no-store' });
      if (!response.ok) throw new Error('No se pudo cargar almacenes');
      const data = (await response.json()) as Almacen[];
      setRows(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return rows;
    return rows.filter((row) => [row.nombre, row.descripcion, row.ubicacion].filter(Boolean).some((entry) => String(entry).toLowerCase().includes(value)));
  }, [rows, query]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const url = editingId ? `/api/almacenes/${editingId}` : '/api/almacenes';
    const method = editingId ? 'PATCH' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      setError(payload.error ?? 'No se pudo guardar');
      return;
    }

    setForm(emptyForm);
    setEditingId(null);
    await load();
  }

  function startEdit(row: Almacen) {
    setEditingId(row.id);
    setForm({
      nombre: row.nombre,
      descripcion: row.descripcion ?? '',
      ubicacion: row.ubicacion ?? '',
      activo: row.activo,
    });
  }

  async function onDelete(id: string) {
    const ok = window.confirm('¿Eliminar este almacén?');
    if (!ok) return;

    const response = await fetch(`/api/almacenes/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      setError('No se pudo eliminar');
      return;
    }

    if (editingId === id) {
      setEditingId(null);
      setForm(emptyForm);
    }

    await load();
  }

  return (
    <section className="card stack">
      <header className="row-between">
        <div>
          <h1>Almacenes</h1>
          <p className="muted">Módulo piloto migrado a Next.js 16</p>
        </div>
        <input
          className="input"
          placeholder="Buscar por nombre, descripción o ubicación"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </header>

      <form className="stack" onSubmit={onSubmit}>
        <div className="grid-2">
          <label>
            Nombre
            <input className="input" required value={form.nombre} onChange={(event) => setForm((s) => ({ ...s, nombre: event.target.value }))} />
          </label>
          <label>
            Ubicación
            <input className="input" value={form.ubicacion} onChange={(event) => setForm((s) => ({ ...s, ubicacion: event.target.value }))} />
          </label>
        </div>

        <label>
          Descripción
          <input className="input" value={form.descripcion} onChange={(event) => setForm((s) => ({ ...s, descripcion: event.target.value }))} />
        </label>

        <label className="check-row">
          <input type="checkbox" checked={form.activo} onChange={(event) => setForm((s) => ({ ...s, activo: event.target.checked }))} />
          Activo
        </label>

        <div className="row-actions">
          <button className="btn btn-primary" type="submit">{editingId ? 'Actualizar' : 'Crear'}</button>
          {editingId ? (
            <button className="btn" type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
              Cancelar edición
            </button>
          ) : null}
        </div>
      </form>

      {error ? <p className="error">{error}</p> : null}

      {loading ? <p>Cargando...</p> : (
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Ubicación</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id}>
                <td>{row.nombre}</td>
                <td>{row.descripcion || '—'}</td>
                <td>{row.ubicacion || '—'}</td>
                <td>{row.activo ? 'Activo' : 'Inactivo'}</td>
                <td>
                  <div className="row-actions">
                    <button className="btn btn-primary" onClick={() => startEdit(row)} type="button">Editar</button>
                    <button className="btn btn-danger" onClick={() => void onDelete(row.id)} type="button">Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="muted">No hay almacenes para mostrar.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      )}
    </section>
  );
}
