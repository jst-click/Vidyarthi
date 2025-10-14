import React, { useEffect, useMemo, useState } from 'react';
import ApiService, { type CurrentAffairsItem } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const CurrentAffairsPage: React.FC = () => {
  const { token } = useAuth();
  const [items, setItems] = useState<CurrentAffairsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterFeatured, setFilterFeatured] = useState<string>('');

  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<CurrentAffairsItem | null>(null);
  const [payload, setPayload] = useState({
    title: '',
    content: '',
    category: '',
    publish_date: '',
    tags: [] as string[],
    is_active: true,
    is_featured: false,
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [newTag, setNewTag] = useState<string>('');

  // Category will be free-text; no fixed categories list
  // const statusOptions = ['active', 'inactive'];
  // const featuredOptions = ['featured', 'not-featured'];

  const loadAll = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiService.getCurrentAffairs();
      setItems((res.current_affairs || []).slice().reverse());
    } catch (e: any) { setError(e?.message || 'Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { void loadAll(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      const matchesSearch = !q || [it.title, it.category, it.content, ...it.tags].some((v) => v.toLowerCase().includes(q));
      const matchesCategory = !filterCategory || it.category === filterCategory;
      const matchesStatus = !filterStatus || (filterStatus === 'active' ? it.is_active : !it.is_active);
      const matchesFeatured = !filterFeatured || (filterFeatured === 'featured' ? it.is_featured : !it.is_featured);
      
      return matchesSearch && matchesCategory && matchesStatus && matchesFeatured;
    });
  }, [items, query, filterCategory, filterStatus, filterFeatured]);

  const resetForm = (): void => {
    setEditing(null);
    setPayload({
      title: '',
      content: '',
      category: '',
      publish_date: '',
      tags: [],
      is_active: true,
      is_featured: false,
    });
    setNewTag('');
  };

  const openCreate = (): void => { resetForm(); setFormOpen(true); };
  const openEdit = (it: CurrentAffairsItem): void => {
    setEditing(it);
    // Format the date for the date input (YYYY-MM-DD)
    const formattedDate = it.publish_date ? new Date(it.publish_date).toISOString().split('T')[0] : '';
    setPayload({
      title: it.title,
      content: it.content,
      category: it.category,
      publish_date: formattedDate,
      tags: it.tags || [],
      is_active: it.is_active,
      is_featured: it.is_featured,
    });
    setFormOpen(true);
  };

  const onSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!token) { setError('Not authorized'); return; }
    
    // Basic validation
    if (!payload.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!payload.content.trim()) {
      setError('Content is required');
      return;
    }
    if (!payload.category) {
      setError('Category is required');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    try {
      // Prepare the data for submission
      const submitData = {
        ...payload,
        // Ensure publish_date is in the correct format for backend
        publish_date: payload.publish_date ? new Date(payload.publish_date).toISOString() : new Date().toISOString(),
      };
      
      console.log('Submitting data:', submitData); // Debug log
      
      if (editing) {
        console.log('Updating current affairs with ID:', editing._id); // Debug log
        await ApiService.updateCurrentAffairs(editing._id, submitData as any, token);
      } else {
        console.log('Creating new current affairs'); // Debug log
        await ApiService.createCurrentAffairs(submitData as any, token);
      }
      setFormOpen(false);
      resetForm();
      await loadAll();
    } catch (e: any) {
      console.error('Error submitting form:', e); // Debug log
      setError(e?.message || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (id: string): Promise<void> => {
    if (!token) { setError('Not authorized'); return; }
    if (!confirm('Delete this article?')) return;
    try { await ApiService.deleteCurrentAffairs(id, token); await loadAll(); }
    catch (e: any) { setError(e?.message || 'Delete failed'); }
  };

  const clearFilters = () => {
    setQuery('');
    setFilterCategory('');
    setFilterStatus('');
    setFilterFeatured('');
  };

  const addTag = () => {
    if (newTag.trim() && !payload.tags.includes(newTag.trim())) {
      setPayload({ ...payload, tags: [...payload.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setPayload({ ...payload, tags: payload.tags.filter(tag => tag !== tagToRemove) });
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) return <div className="text-gray-600">Loading current affairs...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Current Affairs</h2>
            <p className="text-gray-600">Total: {items.length} | Filtered: {filtered.length}</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input className="border rounded-lg px-3 py-2 w-full md:w-80" placeholder="Search articles" value={query} onChange={(e) => setQuery(e.target.value)} />
            <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Add Article</button>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl p-6 shadow">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="flex flex-col md:flex-row gap-2">
              <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Filter by Category:</label>
              <input
                className="border rounded-lg px-3 py-2 min-w-[180px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Type category"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              />
            </div>
            <div className="flex flex-col md:flex-row gap-2">
              <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Filter by Status:</label>
              <select 
                className="border rounded-lg px-3 py-2 min-w-[150px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex flex-col md:flex-row gap-2">
              <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Filter by Featured:</label>
              <select 
                className="border rounded-lg px-3 py-2 min-w-[150px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                value={filterFeatured} 
                onChange={(e) => setFilterFeatured(e.target.value)}
              >
                <option value="">All Articles</option>
                <option value="featured">Featured</option>
                <option value="not-featured">Not Featured</option>
              </select>
            </div>
          </div>
          <button 
            onClick={clearFilters} 
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 whitespace-nowrap"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={() => { setFormOpen(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b flex items-center justify-between bg-blue-900">
              <h3 className="text-xl font-bold text-white">{editing ? 'Edit Article' : 'Create Article'}</h3>
              <button className="text-yellow-400 hover:text-white" onClick={() => { setFormOpen(false); }}>{'✕'}</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                  <input 
                    className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="Article title" 
                    value={payload.title} 
                    onChange={(e) => setPayload({ ...payload, title: e.target.value })} 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Content</label>
                  <textarea 
                    className="border rounded-lg px-3 py-2 w-full h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="Article content" 
                    value={payload.content} 
                    onChange={(e) => setPayload({ ...payload, content: e.target.value })} 
                    required 
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                    <input
                      className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Type category"
                      value={payload.category}
                      onChange={(e) => setPayload({ ...payload, category: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Publish Date</label>
                    <input 
                      type="date"
                      className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      value={payload.publish_date} 
                      onChange={(e) => setPayload({ ...payload, publish_date: e.target.value })}
                      required 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tags</label>
                  <div className="flex gap-2 mb-2">
                    <input 
                      className="border rounded-lg px-3 py-2 flex-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      placeholder="Add a tag" 
                      value={newTag} 
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <button type="button" onClick={addTag} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {payload.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="text-blue-600 hover:text-blue-800">×</button>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="is_active"
                      className="mr-2" 
                      checked={payload.is_active} 
                      onChange={(e) => setPayload({ ...payload, is_active: e.target.checked })}
                    />
                    <label htmlFor="is_active" className="text-sm font-semibold text-gray-700">Active</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="is_featured"
                      className="mr-2" 
                      checked={payload.is_featured} 
                      onChange={(e) => setPayload({ ...payload, is_featured: e.target.checked })}
                    />
                    <label htmlFor="is_featured" className="text-sm font-semibold text-gray-700">Featured</label>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <button type="button" onClick={() => { setFormOpen(false); resetForm(); }} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-50">{submitting ? 'Saving...' : 'Save'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Article Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status & Featured</th>
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stats</th> */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Published</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map((it) => (
              <tr key={it._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{it.title}</div>
                    <div className="text-sm text-gray-500 mt-1 line-clamp-2">{it.content}</div>
                    {it.tags && it.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {it.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                            {tag}
                          </span>
                        ))}
                        {it.tags.length > 3 && (
                          <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                            +{it.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                    {it.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${it.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {it.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {it.is_featured && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">
                        Featured
                      </span>
                    )}
                  </div>
                </td>
                {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <div className="flex flex-col">
                    <span>👁️ {it.view_count || 0} views</span>
                    <span>❤️ {it.likes || 0} likes</span>
                  </div>
                </td> */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(it.publish_date)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                  <button onClick={() => openEdit(it)} className="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-50 text-xs">Edit</button>
                  <button onClick={() => onDelete(it._id)} className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CurrentAffairsPage;

