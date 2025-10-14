import React, { useEffect, useState } from 'react';
import ApiService from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const CarouselPage: React.FC = () => {
  const { token } = useAuth();
  const [items, setItems] = useState<Array<{ _id: string; image_url: string }>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const loadAll = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiService.getCarousel();
      setItems(res.items || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load carousel');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const onUpload = async (): Promise<void> => {
    if (!token) { setError('Not authorized'); return; }
    if (!file) { setError('Please select an image'); return; }
    setSubmitting(true);
    setError(null);
    try {
      await ApiService.createCarousel(file, token);
      setFile(null);
      await loadAll();
    } catch (e: any) {
      setError(e?.message || 'Upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (id: string): Promise<void> => {
    if (!token) { setError('Not authorized'); return; }
    if (!confirm('Delete this image?')) return;
    try {
      await ApiService.deleteCarousel(id, token);
      await loadAll();
    } catch (e: any) {
      setError(e?.message || 'Delete failed');
    }
  };

  if (loading) return <div className="text-gray-600">Loading carousel...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Carousel</h2>
            <p className="text-gray-600">Manage homepage carousel images</p>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="border rounded-lg px-3 py-2"
            />
            <button 
              onClick={onUpload}
              disabled={submitting}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((it) => (
          <div key={it._id} className="rounded-xl overflow-hidden shadow border bg-white">
            <div className="w-full h-56 bg-gray-100 flex items-center justify-center">
              {ApiService.fileUrl(it.image_url) ? (
                <img
                  src={ApiService.fileUrl(it.image_url) || ''}
                  alt={it._id}
                  className="w-full h-56 object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <div className="text-gray-500">image not available</div>
              )}
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="text-xs text-gray-500 truncate">ID: {it._id}</div>
              <button onClick={() => onDelete(it._id)} className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 text-xs">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CarouselPage;
