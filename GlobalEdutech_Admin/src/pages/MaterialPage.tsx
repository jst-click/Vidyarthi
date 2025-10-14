import React, { useEffect, useMemo, useState } from 'react';
import ApiService, { type Material } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const MaterialPage: React.FC = () => {
  const { token } = useAuth();
  const [items, setItems] = useState<Material[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterSubCategory, setFilterSubCategory] = useState<string>('');

  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [pdfViewerOpen, setPdfViewerOpen] = useState<boolean>(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [payload, setPayload] = useState({
    class_name: '',
    course: '',
    sub_category: '',
    module: '',
    title: '',
    description: '',
    academic_year: '',
    time_period: 0,
    price: 0,
  });
  const [pdf, setPdf] = useState<File | null>(null);
  const [sampleImages, setSampleImages] = useState<File[]>([]);
  const [existingSampleImages, setExistingSampleImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [feedbackOpen, setFeedbackOpen] = useState<boolean>(false);
  const [feedbackLoading, setFeedbackLoading] = useState<boolean>(false);
  const [imageGalleryOpen, setImageGalleryOpen] = useState<boolean>(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  // Course categories structure
  const courseCategories = {
    'PUC': ['I PUC', 'II PUC'],
    'UG Courses': ['B.Com', 'BBA', 'BCA', 'B.Sc'],
    'PG Courses': ['M.Com', 'MBA', 'MCA', 'MFA', 'MTA', 'M.Ed'],
    'UGC Exams': ['NET', 'KSET', 'NEET', 'JEE'],
    'Professional Courses': ['CA (Chartered Accountant)', 'CS (Company Secretary)', 'CMA (Cost & Management Accountant)', 'ACCA (Association of Chartered Certified Accountants)'],
    'Competitive Exams': ['KPSC (Karnataka Public Service Commission)', 'UPSC (Union Public Service Commission)', 'FDA (First Division Assistant)', 'SDA (Second Division Assistant)', 'Current Affairs', 'Banking Exams', 'Railway Exams', 'PDO (Panchayat Development Officer)', 'Others']
  };

  const loadAll = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiService.getMaterials();
      setItems((res.materials || []).slice().reverse());
    } catch (e: any) {
      setError(e?.message || 'Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await ApiService.getMaterials();
        if (active) setItems((res.materials || []).slice().reverse());
      } catch (e: any) {
        if (active) setError(e?.message || 'Failed to load materials');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      const matchesSearch = !q || [it.title, it.course, it.sub_category, it.module]
        .some((v) => v.toLowerCase().includes(q));
      
      const matchesCategory = !filterCategory || it.course === filterCategory;
      const matchesSubCategory = !filterSubCategory || it.sub_category === filterSubCategory;
      
      return matchesSearch && matchesCategory && matchesSubCategory;
    });
  }, [items, query, filterCategory, filterSubCategory]);

  const resetForm = (): void => {
    setEditing(null);
    setPayload({
      class_name: '', course: '', sub_category: '', module: '', title: '', description: '', academic_year: '', time_period: 0, price: 0,
    });
    setPdf(null);
    setSampleImages([]);
    setExistingSampleImages([]);
  };

  const openCreate = (): void => { resetForm(); setFormOpen(true); };
  const openEdit = (it: Material): void => {
    setEditing(it);
    setPayload({
      class_name: it.class_name,
      course: it.course,
      sub_category: it.sub_category,
      module: it.module,
      title: it.title,
      description: it.description,
      academic_year: it.academic_year,
      time_period: it.time_period,
      price: it.price,
    });
    setPdf(null);
    setSampleImages([]);
    setExistingSampleImages(it.sample_images || []);
    setFormOpen(true);
  };

  const onSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!token) { setError('Not authorized'); return; }
    setSubmitting(true);
    setError(null);
    try {
      if (editing) {
        await ApiService.updateMaterial(editing._id, payload as any, token);
      } else {
        if (!pdf) { setError('PDF is required'); setSubmitting(false); return; }
        await ApiService.createMaterial({ payload, pdf_file: pdf, sample_images: sampleImages }, token);
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
    if (!confirm('Delete this material?')) return;
    try {
      await ApiService.deleteMaterial(id, token);
      await loadAll();
    } catch (e: any) {
      setError(e?.message || 'Delete failed');
    }
  };

  const openPdfViewer = (material: Material) => {
    setSelectedMaterial(material);
    setPdfViewerOpen(true);
  };

  const openFeedback = async (material: Material) => {
    setSelectedMaterial(material);
    setFeedbackOpen(true);
    setFeedbackLoading(true);
    try {
      const res = await ApiService.getMaterialById(material._id);
      if (res && res.material) {
        const matFull: any = res.material;
        const feedback: any[] = (matFull.feedback || []) as any[];
        const uniqueUserIds = Array.from(new Set(
          feedback
            .map((fb: any) => (typeof fb.user_id === 'string' ? fb.user_id : fb.user_id?._id || ''))
            .filter((id: string) => !!id)
        ));
        const apiBase = (process.env.REACT_APP_API_URL || 'https://server.globaledutechlearn.com');
        const userMap: Record<string, { name?: string; contact_no?: string }> = {};
        await Promise.all(
          uniqueUserIds.map(async (uid) => {
            try {
              const resp = await fetch(`${apiBase}/users/${uid}`);
              if (resp.ok) {
                const data = await resp.json();
                const u = data.user || {};
                userMap[uid] = { name: u.name, contact_no: u.contact_no };
              }
            } catch {}
          })
        );
        matFull.feedback = feedback.map((fb: any) => {
          const uid = typeof fb.user_id === 'string' ? fb.user_id : fb.user_id?._id || '';
          const fromMap = uid ? userMap[uid] : undefined;
          return {
            ...fb,
            user_name: fb.user_name || fromMap?.name || 'Unknown',
            user_contact: fromMap?.contact_no || '',
          };
        });
        setSelectedMaterial(matFull);
      }
    } catch (e) {
      // keep existing selected material if fetch fails
    } finally {
      setFeedbackLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getPdfUrl = (fileUrl: string): string => {
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) return fileUrl;
    return `https://server.globaledutechlearn.com/${fileUrl}`;
  };

  const getImageUrl = (fileUrl: string): string => {
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) return fileUrl;
    return `https://server.globaledutechlearn.com/${fileUrl}`;
  };

  const deleteExistingImage = (imageUrl: string): void => {
    setExistingSampleImages(prev => prev.filter(img => img !== imageUrl));
  };

  const openImageGallery = (images: string[], startIndex: number = 0): void => {
    setGalleryImages(images);
    setCurrentImageIndex(startIndex);
    setImageGalleryOpen(true);
  };

  const nextImage = (): void => {
    setCurrentImageIndex(prev => (prev + 1) % galleryImages.length);
  };

  const prevImage = (): void => {
    setCurrentImageIndex(prev => prev === 0 ? galleryImages.length - 1 : prev - 1);
  };

  const handleCategoryChange = (category: string) => {
    setFilterCategory(category);
    setFilterSubCategory(''); // Reset subcategory when category changes
  };

  const handleSubCategoryChange = (subCategory: string) => {
    setFilterSubCategory(subCategory);
  };

  const clearFilters = () => {
    setQuery('');
    setFilterCategory('');
    setFilterSubCategory('');
  };

  const getSubCategories = () => {
    return filterCategory ? courseCategories[filterCategory as keyof typeof courseCategories] || [] : [];
  };

  if (loading) return <div className="text-gray-600">Loading materials...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Materials</h2>
            <p className="text-gray-600">Total: {items.length} | Filtered: {filtered.length}</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input className="border rounded-lg px-3 py-2 w-full md:w-80" placeholder="Search materials" value={query} onChange={(e) => setQuery(e.target.value)} />
            <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Add</button>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl p-6 shadow">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="flex flex-col md:flex-row gap-2">
              <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Filter by Course:</label>
              <select 
                className="border rounded-lg px-3 py-2 min-w-[200px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                value={filterCategory} 
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <option value="">All Courses</option>
                {Object.keys(courseCategories).map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col md:flex-row gap-2">
              <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Filter by Sub-Category:</label>
              <select 
                className="border rounded-lg px-3 py-2 min-w-[200px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                value={filterSubCategory} 
                onChange={(e) => handleSubCategoryChange(e.target.value)}
                disabled={!filterCategory}
              >
                <option value="">All Sub-Categories</option>
                {getSubCategories().map((subCategory) => (
                  <option key={subCategory} value={subCategory}>{subCategory}</option>
                ))}
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

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={() => { setFormOpen(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b flex items-center justify-between bg-blue-900">
              <h3 className="text-xl font-bold text-white">{editing ? 'Edit Material' : 'Create Material'}</h3>
              <button className="text-yellow-400 hover:text-white" onClick={() => { setFormOpen(false); }}>{'✕'}</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Class Name</label>
                  <input className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Professional" value={payload.class_name} onChange={(e) => setPayload({ ...payload, class_name: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Course Category</label>
                  <select 
                    className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    value={payload.course} 
                    onChange={(e) => setPayload({ ...payload, course: e.target.value, sub_category: '' })}
                    required
                  >
                    <option value="">Select Course Category</option>
                    {Object.keys(courseCategories).map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Sub-Category</label>
                  <select 
                    className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    value={payload.sub_category} 
                    onChange={(e) => setPayload({ ...payload, sub_category: e.target.value })}
                    required
                    disabled={!payload.course}
                  >
                    <option value="">Select Sub-Category</option>
                    {payload.course && courseCategories[payload.course as keyof typeof courseCategories]?.map((subCategory) => (
                      <option key={subCategory} value={subCategory}>{subCategory}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Module</label>
                  <input className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Module 2" value={payload.module} onChange={(e) => setPayload({ ...payload, module: e.target.value })} required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                  <input className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Marketing - Module 2" value={payload.title} onChange={(e) => setPayload({ ...payload, title: e.target.value })} required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                  <textarea className="border rounded-lg px-3 py-2 w-full h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Material description..." value={payload.description} onChange={(e) => setPayload({ ...payload, description: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Academic Year</label>
                  <input className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., 2023-24" value={payload.academic_year} onChange={(e) => setPayload({ ...payload, academic_year: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Time Period (days)</label>
                  <input className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" type="number" min={0} value={payload.time_period} onChange={(e) => setPayload({ ...payload, time_period: Number(e.target.value) })} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Price (₹)</label>
                  <input className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" type="number" min={0} step="0.01" value={payload.price} onChange={(e) => setPayload({ ...payload, price: Number(e.target.value) })} required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    PDF File {editing ? '(Optional - leave empty to keep current)' : '(Required)'}
                  </label>
                  <input 
                    className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    type="file" 
                    accept="application/pdf" 
                    onChange={(e) => setPdf(e.target.files?.[0] || null)} 
                    required={!editing}
                  />
                  {editing && (
                    <p className="text-xs text-gray-500 mt-1">Current PDF: {editing.file_url?.split('/').pop()}</p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Sample Images (Optional)</label>
                  <input 
                    className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    onChange={(e) => setSampleImages(Array.from(e.target.files || []))} 
                  />
                  <p className="text-xs text-gray-500 mt-1">You can select multiple images to show as samples</p>
                  
                  {/* New Images Preview */}
                  {sampleImages.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">New images: {sampleImages.length}</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {sampleImages.map((file, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="w-16 h-16 object-cover rounded border"
                            />
                            <button
                              type="button"
                              onClick={() => setSampleImages(prev => prev.filter((_, i) => i !== index))}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Existing Images (Edit Mode) */}
                  {editing && existingSampleImages.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Current sample images:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {existingSampleImages.map((imageUrl, index) => (
                          <div key={index} className="relative">
                            <img
                              src={getImageUrl(imageUrl)}
                              alt={`Sample ${index + 1}`}
                              className="w-16 h-16 object-cover rounded border cursor-pointer hover:opacity-80"
                              onClick={() => openImageGallery(existingSampleImages, index)}
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => deleteExistingImage(imageUrl)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course/Sub-Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year/Module</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Info</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sample Images</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Downloads</th> */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map((it) => (
              <tr key={it._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{it.title}</div>
                    <div className="text-sm text-gray-500">{it.class_name}</div>
                    <div className="text-xs text-gray-400 mt-1 line-clamp-2">{it.description}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{it.course}</div>
                  <div className="text-sm text-gray-500">{it.sub_category}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{it.academic_year}</div>
                  <div className="text-sm text-gray-500">{it.module}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatFileSize(it.file_size || 0)}</div>
                  <div className="text-xs text-gray-500">{it.time_period} days</div>
                </td>
                <td className="px-6 py-4">
                  {it.sample_images && it.sample_images.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {it.sample_images.slice(0, 2).map((imageUrl, index) => (
                        <img
                          key={index}
                          src={getImageUrl(imageUrl)}
                          alt={`Sample ${index + 1}`}
                          className="w-8 h-8 object-cover rounded border cursor-pointer hover:opacity-80"
                          onClick={() => openImageGallery(it.sample_images, index)}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ))}
                      {it.sample_images.length > 2 && (
                        <div 
                          className="w-8 h-8 bg-gray-200 rounded border flex items-center justify-center text-xs text-gray-500 cursor-pointer hover:bg-gray-300"
                          onClick={() => openImageGallery(it.sample_images, 2)}
                        >
                          +{it.sample_images.length - 2}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">No samples</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-green-600">₹{it.price}</span>
                </td>
                {/* <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">{it.download_count || 0}</span>
                </td> */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(it.updated_at).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                  <button 
                    onClick={() => openPdfViewer(it)} 
                    className="px-3 py-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs"
                  >
                    View PDF
                  </button>
                  <button 
                    onClick={() => openFeedback(it)} 
                    className="px-3 py-1 rounded-md bg-yellow-100 text-yellow-700 hover:bg-yellow-200 text-xs"
                  >
                    Feedback
                  </button>
                  <button onClick={() => openEdit(it)} className="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-50 text-xs">Edit</button>
                  <button onClick={() => onDelete(it._id)} className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PDF Viewer Modal - Centered */}
      {pdfViewerOpen && selectedMaterial && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50" onClick={() => { setPdfViewerOpen(false); }}>
          <div className="w-1/2 h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header Bar */}
            <div className="px-4 py-3 bg-blue-900 flex items-center justify-between border-b border-blue-700">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <h3 className="text-lg font-bold text-white">PDF Viewer</h3>
                <p className="text-blue-200 text-sm truncate">{selectedMaterial.title}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-3 text-sm text-blue-200">
                  <span>Size: {formatFileSize(selectedMaterial.file_size || 0)}</span>
                  <span>Downloads: {selectedMaterial.download_count || 0}</span>
                  <span>Price: ₹{selectedMaterial.price}</span>
                </div>
                <a 
                  href={getPdfUrl(selectedMaterial.file_url)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm whitespace-nowrap"
                >
                  Download
                </a>
                <button 
                  className="text-yellow-400 hover:text-white text-xl font-bold ml-2" 
                  onClick={() => { setPdfViewerOpen(false); }}
                >
                  ✕
                </button>
              </div>
            </div>
            
            {/* Sample Images Section */}
            {selectedMaterial.sample_images && selectedMaterial.sample_images.length > 0 && (
              <div className="px-4 py-3 bg-gray-50 border-b">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Sample Images</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedMaterial.sample_images.slice(0, 6).map((imageUrl, index) => (
                    <img
                      key={index}
                      src={getImageUrl(imageUrl)}
                      alt={`Sample ${index + 1}`}
                      className="w-16 h-16 object-cover rounded border cursor-pointer hover:opacity-80"
                      onClick={() => openImageGallery(selectedMaterial.sample_images, index)}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ))}
                  {selectedMaterial.sample_images.length > 6 && (
                    <div 
                      className="w-16 h-16 bg-gray-200 rounded border flex items-center justify-center text-xs text-gray-500 cursor-pointer hover:bg-gray-300"
                      onClick={() => openImageGallery(selectedMaterial.sample_images, 6)}
                    >
                      +{selectedMaterial.sample_images.length - 6}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* PDF Content */}
            <div className="flex-1 bg-gray-100">
              <iframe
                src={getPdfUrl(selectedMaterial.file_url)}
                className="w-full h-full border-0"
                title={`PDF Viewer - ${selectedMaterial.title}`}
              />
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackOpen && selectedMaterial && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50" onClick={() => { setFeedbackOpen(false); }}>
          <div className="w-full max-w-2xl max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 py-3 bg-blue-900 flex items-center justify-between border-b border-blue-700">
              <div>
                <h3 className="text-lg font-bold text-white">Feedback</h3>
                <p className="text-blue-200 text-sm">{selectedMaterial.title}</p>
              </div>
              <button 
                className="text-yellow-400 hover:text-white text-xl font-bold" 
                onClick={() => { setFeedbackOpen(false); }}
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {feedbackLoading ? (
                <div className="text-gray-600">Loading feedback...</div>
              ) : selectedMaterial.feedback && selectedMaterial.feedback.length > 0 ? (
                <div className="space-y-3">
                  {selectedMaterial.feedback.map((fb: any, idx: number) => (
                    <div key={idx} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-sm font-semibold text-gray-800">Rating: {fb.rating}/5</div>
                        <div className="text-xs text-gray-500">{fb.created_at ? new Date(fb.created_at).toLocaleString() : ''}</div>
                      </div>
                      <div className="text-sm text-gray-800">
                        <span className="font-medium">Name:</span> {fb.user_name || 'Unknown'}
                        {fb.user_contact && (
                          <span className="ml-3"><span className="font-medium">Contact:</span> {fb.user_contact}</span>
                        )}
                      </div>
                      {fb.comment && <p className="text-sm text-gray-700 mt-2">{fb.comment}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-600">No feedback yet.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Gallery Modal */}
      {imageGalleryOpen && galleryImages.length > 0 && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black bg-opacity-90" onClick={() => setImageGalleryOpen(false)}>
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="px-4 py-3 bg-gray-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                Sample Images ({currentImageIndex + 1} of {galleryImages.length})
              </h3>
              <button 
                className="text-white hover:text-gray-300 text-xl font-bold"
                onClick={() => setImageGalleryOpen(false)}
              >
                ✕
              </button>
            </div>
            
            {/* Image Container */}
            <div className="relative bg-black">
              <img
                src={getImageUrl(galleryImages[currentImageIndex])}
                alt={`Gallery Image ${currentImageIndex + 1}`}
                className="max-w-full max-h-[70vh] mx-auto block"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
                }}
              />
              
              {/* Navigation Arrows */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                  >
                    ←
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                  >
                    →
                  </button>
                </>
              )}
            </div>
            
            {/* Thumbnail Strip */}
            {galleryImages.length > 1 && (
              <div className="px-4 py-3 bg-gray-100">
                <div className="flex gap-2 overflow-x-auto">
                  {galleryImages.map((imageUrl, index) => (
                    <img
                      key={index}
                      src={getImageUrl(imageUrl)}
                      alt={`Thumbnail ${index + 1}`}
                      className={`w-12 h-12 object-cover rounded border cursor-pointer ${
                        index === currentImageIndex ? 'ring-2 ring-blue-500' : 'hover:opacity-80'
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialPage;


