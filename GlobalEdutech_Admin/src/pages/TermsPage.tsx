import React, { useEffect, useState } from 'react';
import ApiService, { type TermsItem } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const TermsPage: React.FC = () => {
  const { token } = useAuth();
  const [item, setItem] = useState<TermsItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await ApiService.getActiveTerms();
        setItem(res.terms);
        setContent((res.terms as any).content || '');
      } catch (e: any) { setError(e?.message || 'Failed to load'); }
      finally { setLoading(false); }
    })();
  }, []);

  const onSave = async (): Promise<void> => {
    if (!token || !item) { setError('Not authorized'); return; }
    setSaving(true);
    try { await ApiService.updateTerms(item._id, { content }, token); }
    catch (e: any) { setError(e?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="text-gray-600">Loading terms...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Terms & Conditions</h2>
        <textarea className="w-full border rounded-lg px-3 py-2 h-64" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Enter terms content..." />
        <div className="mt-3">
          <button onClick={onSave} disabled={saving} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;

