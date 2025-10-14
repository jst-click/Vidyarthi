import React, { useEffect, useMemo, useState } from 'react';
import ApiService, { type Institution } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const InstitutionsPage: React.FC = () => {
  const { token } = useAuth();
  const [items, setItems] = useState<Institution[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');

  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<Institution | null>(null);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [vision, setVision] = useState<string>('');
  const [mission, setMission] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) =>
      [it.name, it.description, it.vision || '', it.mission || '']
        .some((v) => v.toLowerCase().includes(q))
    );
  }, [items, query]);

  const loadAll = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiService.getInstitutions();
      setItems((res.institutions || []).slice().reverse());
    } catch (e: any) {
      setError(e?.message || 'Failed to load institutions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await ApiService.getInstitutions();
        if (active) setItems((res.institutions || []).slice().reverse());
      } catch (e: any) {
        if (active) setError(e?.message || 'Failed to load institutions');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const resetForm = (): void => {
    setEditing(null);
    setName('');
    setDescription('');
    setVision('');
    setMission('');
  };

  const openCreate = (): void => {
    resetForm();
    setFormOpen(true);
  };

  const openEdit = (it: Institution): void => {
    setEditing(it);
    setName(it.name);
    setDescription(it.description);
    setVision(it.vision || '');
    setMission(it.mission || '');
    setFormOpen(true);
  };

  const onSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!token) { setError('Not authorized'); return; }
    setSubmitting(true);
    setError(null);
    try {
      if (editing) {
        await ApiService.updateInstitution(editing._id, {
          name, description, vision, mission
        } as Partial<Institution>, token);
      } else {
        await ApiService.createInstitution({ name, description, vision, mission } as any, token);
      }
      setFormOpen(false);
      resetForm();
      await loadAll();
    } catch (e: any) {
      setError(e?.message || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (id: string): Promise<void> => {
    if (!token) { setError('Not authorized'); return; }
    if (!confirm('Delete this institution?')) return;
    try {
      await ApiService.deleteInstitution(id, token);
      await loadAll();
    } catch (e: any) {
      setError(e?.message || 'Delete failed');
    }
  };

  if (loading) return <div className="text-gray-600">Loading institutions...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Institutions</h2>
            <p className="text-gray-600">Total: {items.length}</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input className="border rounded-lg px-3 py-2 w-full md:w-80" placeholder="Search institutions" value={query} onChange={(e) => setQuery(e.target.value)} />
            <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Add</button>
          </div>
        </div>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={() => { setFormOpen(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b flex items-center justify-between bg-blue-900">
              <h3 className="text-xl font-bold text-white">{editing ? 'Edit Institution' : 'Create Institution'}</h3>
              <button className="text-yellow-400 hover:text-white" onClick={() => { setFormOpen(false); }}>{'✕'}</button>
            </div>
            <div className="p-6">
              <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                  <textarea className="border rounded-lg px-3 py-2 w-full h-32" placeholder="e.g., Global EduTech" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="flex flex-col">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                  <textarea className="border rounded-lg px-3 py-2 w-full h-32" placeholder="Short description" value={description} onChange={(e) => setDescription(e.target.value)} required />
                </div>
                <div className="flex flex-col">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Vision</label>
                  <textarea className="border rounded-lg px-3 py-2 w-full h-32" placeholder="Our vision" value={vision} onChange={(e) => setVision(e.target.value)} />
                </div>
                <div className="flex flex-col">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Mission</label>
                  <textarea className="border rounded-lg px-3 py-2 w-full h-32" placeholder="Our mission" value={mission} onChange={(e) => setMission(e.target.value)} />
                </div>
                <div className="col-span-1 md:col-span-2 flex items-center justify-between pt-2">
                  <button type="button" onClick={() => { setFormOpen(false); resetForm(); }} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-50">{submitting ? 'Saving...' : 'Save'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {filtered.map((it) => (
          <div key={it._id} className="rounded-2xl overflow-hidden shadow-lg border border-blue-100">
            <div className="bg-blue-900 text-white p-5">
              <h3 className="text-xl font-bold">{it.name}</h3>
              <p className="text-yellow-300 text-xs mt-1">Updated: {new Date(it.updated_at).toLocaleString()}</p>
            </div>
            <div className="p-5 bg-white space-y-4">
              <div>
                <p className="text-sm text-gray-500 font-semibold mb-1">Description</p>
                <p className="text-gray-800 text-sm leading-relaxed">{it.description}</p>
              </div>
              {(it.vision || it.mission) && (
                <div className="grid grid-cols-1 gap-3">
                  {it.vision && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-blue-900 mb-1">Vision</p>
                      <p className="text-sm text-blue-900/90">{it.vision}</p>
                    </div>
                  )}
                  {it.mission && (
                    <div className="bg-yellow-50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-yellow-700 mb-1">Mission</p>
                      <p className="text-sm text-yellow-800">{it.mission}</p>
                    </div>
                  )}
                </div>
              )}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button onClick={() => openEdit(it)} className="px-4 py-2 rounded-lg border border-blue-900 text-blue-900 hover:bg-yellow-400 hover:border-yellow-400">Edit</button>
                <button onClick={() => onDelete(it._id)} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstitutionsPage;


