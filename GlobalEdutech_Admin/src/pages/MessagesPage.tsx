import React, { useEffect, useMemo, useState } from 'react';
import ApiService, { type ContactMessageItem } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const MessagesPage: React.FC = () => {
  const { token } = useAuth();
  const [items, setItems] = useState<ContactMessageItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');

  useEffect(() => {
    (async () => {
      try { const res = await ApiService.getContactMessages(); setItems((res.messages || []).slice().reverse()); }
      catch (e: any) { setError(e?.message || 'Failed to load'); }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => [it.name || '', it.email || '', it.subject || '', it.message || ''].some((v) => v.toLowerCase().includes(q)));
  }, [items, query]);

  const onDelete = async (id: string): Promise<void> => {
    if (!token) { setError('Not authorized'); return; }
    if (!confirm('Delete this message?')) return;
    try { await ApiService.deleteContactMessage(id, token); setItems((prev) => prev.filter((m) => m._id !== id)); }
    catch (e: any) { setError(e?.message || 'Delete failed'); }
  };

  if (loading) return <div className="text-gray-600">Loading messages...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Contact Messages</h2>
            <p className="text-gray-600">Total: {items.length}</p>
          </div>
          <input className="border rounded-lg px-3 py-2 w-full md:w-80" placeholder="Search messages" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map((it) => (
              <tr key={it._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{it.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{it.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{it.subject}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{it.message}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button onClick={() => onDelete(it._id)} className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MessagesPage;

