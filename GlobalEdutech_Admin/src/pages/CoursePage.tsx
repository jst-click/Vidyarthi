import React, { useEffect, useMemo, useState } from 'react';
import ApiService, { type Course } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const CoursePage: React.FC = () => {
  const { token } = useAuth();
  const [items, setItems] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterSubCategory, setFilterSubCategory] = useState<string>('');

  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [payload, setPayload] = useState({
    name: '',
    title: '',
    description: '',
    category: '',
    sub_category: '',
    start_date: '',
    end_date: '',
    duration: '',
    instructor: '',
    price: 0,
  });
  const [showSubCategories, setShowSubCategories] = useState<boolean>(false);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [feedbackOpen, setFeedbackOpen] = useState<boolean>(false);
  const [feedbackLoading, setFeedbackLoading] = useState<boolean>(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseFeedback, setCourseFeedback] = useState<any[]>([]);

  // Category and Subcategory data
  const courseCategories = {
    'PUC': ['I PUC', 'II PUC'],
    'UG Courses': ['B.Com', 'BBA', 'BCA', 'B.Sc'],
    'PG Courses': ['M.Com', 'MBA', 'MCA', 'MFA', 'MTA', 'M.Ed'],
    'UGC Exams': ['NET', 'KSET', 'NEET', 'JEE'],
    'Professional Courses': ['CA (Chartered Accountant)', 'CS (Company Secretary)', 'CMA (Cost & Management Accountant)', 'ACCA (Association of Chartered Certified Accountants)'],
    'Competitive Exams': ['KPSC (Karnataka Public Service Commission)', 'UPSC (Union Public Service Commission)', 'FDA (First Division Assistant)', 'SDA (Second Division Assistant)', 'Current Affairs', 'Banking Exams', 'Railway Exams', 'PDO (Panchayat Development Officer)', 'Others']
  };

  // Helper functions
  const handleCategoryChange = (category: string) => {
    setPayload({ ...payload, category, sub_category: '' });
    setShowSubCategories(true);
  };

  const handleSubCategoryChange = (subCategory: string) => {
    setPayload({ ...payload, sub_category: subCategory });
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
  };

  const handleDateChange = (field: 'start_date' | 'end_date', value: string) => {
    const isoDate = value ? new Date(value).toISOString() : '';
    setPayload({ ...payload, [field]: isoDate });
  };

  const handleFilterCategoryChange = (category: string) => {
    setFilterCategory(category);
    setFilterSubCategory(''); // Reset subcategory when category changes
  };

  const clearFilters = () => {
    setQuery('');
    setFilterCategory('');
    setFilterSubCategory('');
  };

  const filtered = useMemo(() => {
    let filteredItems = items;
    
    // Text search filter
    const q = query.trim().toLowerCase();
    if (q) {
      filteredItems = filteredItems.filter((it) =>
        [it.title, it.name, it.category, it.sub_category, it.instructor]
          .some((v) => v.toLowerCase().includes(q))
      );
    }
    
    // Category filter
    if (filterCategory) {
      filteredItems = filteredItems.filter((it) => it.category === filterCategory);
    }
    
    // Subcategory filter
    if (filterSubCategory) {
      filteredItems = filteredItems.filter((it) => it.sub_category === filterSubCategory);
    }
    
    return filteredItems;
  }, [items, query, filterCategory, filterSubCategory]);

  const loadAll = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiService.getCourses();
      setItems((res.courses || []).slice().reverse());
    } catch (e: any) {
      setError(e?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await ApiService.getCourses();
        if (active) setItems((res.courses || []).slice().reverse());
      } catch (e: any) {
        if (active) setError(e?.message || 'Failed to load courses');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const resetForm = (): void => {
    setEditing(null);
    setPayload({
      name: '', title: '', description: '', category: '', sub_category: '',
      start_date: '', end_date: '', duration: '', instructor: '', price: 0,
    });
    setThumbnail(null);
    setShowSubCategories(false);
  };

  const openCreate = (): void => { resetForm(); setFormOpen(true); };
  const openEdit = (it: Course): void => {
    setEditing(it);
    setPayload({
      name: it.name,
      title: it.title,
      description: it.description,
      category: it.category,
      sub_category: it.sub_category,
      start_date: it.start_date,
      end_date: it.end_date,
      duration: it.duration,
      instructor: it.instructor,
      price: 0,
    });
    setThumbnail(null);
    setShowSubCategories(!!it.category);
    setFormOpen(true);
  };

  const onSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!token) { setError('Not authorized'); return; }
    setSubmitting(true);
    setError(null);
    try {
      if (editing) {
        // For editing, only update the course data (thumbnail updates not supported yet)
        if (thumbnail) {
          setError('Thumbnail updates are not supported in edit mode. Please delete and recreate the course to change the thumbnail.');
          setSubmitting(false);
          return;
        }
        await ApiService.updateCourse(editing._id, { ...payload, price: 0 } as any, token);
      } else {
        if (!thumbnail) { setError('Thumbnail is required'); setSubmitting(false); return; }
        await ApiService.createCourse({ payload: { ...payload, price: 0 }, thumbnail }, token);
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
    if (!confirm('Delete this course?')) return;
    try {
      await ApiService.deleteCourse(id, token);
      await loadAll();
    } catch (e: any) {
      setError(e?.message || 'Delete failed');
    }
  };

  const openFeedback = async (course: Course) => {
    setSelectedCourse(course);
    setFeedbackOpen(true);
    setFeedbackLoading(true);
    try {
      // Prefer fetching course by ID to get feedback array on course document
      const courseRes = await ApiService.getCourseById(course._id);
      let feedbacks: any[] = [];
      if (courseRes && (courseRes as any).course) {
        feedbacks = ((courseRes as any).course.feedback || []) as any[];
      } else {
        // Fallback to legacy enrollments method
        const res = await ApiService.getEnrollmentsByCourse(course._id);
        feedbacks = (res.enrollments || [])
          .map((enr: any) => enr.feedback)
          .filter((fb: any) => !!fb);
      }

      // Enrich feedback with user name/contact
      const uniqueUserIds = Array.from(new Set(
        feedbacks
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
      const enriched = feedbacks.map((fb: any) => {
        const uid = typeof fb.user_id === 'string' ? fb.user_id : fb.user_id?._id || '';
        const fromMap = uid ? userMap[uid] : undefined;
        return {
          ...fb,
          user_name: fb.user_name || fromMap?.name || 'Unknown',
          user_contact: fromMap?.contact_no || '',
        };
      });
      setCourseFeedback(enriched);
    } catch (e) {
      setCourseFeedback([]);
    } finally {
      setFeedbackLoading(false);
    }
  };

  if (loading) return <div className="text-gray-600">Loading courses...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Courses</h2>
            <p className="text-gray-600">Total: {items.length} | Showing: {filtered.length}</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input className="border rounded-lg px-3 py-2 w-full md:w-80" placeholder="Search courses" value={query} onChange={(e) => setQuery(e.target.value)} />
            <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Add</button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Filter by Category</label>
            <select 
              className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              value={filterCategory} 
              onChange={(e) => handleFilterCategoryChange(e.target.value)}
            >
              <option value="">All Categories</option>
              {Object.keys(courseCategories).map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Filter by Sub Category</label>
            <select 
              className={`border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                !filterCategory ? 'bg-gray-100 text-gray-500' : ''
              }`}
              value={filterSubCategory} 
              onChange={(e) => setFilterSubCategory(e.target.value)}
              disabled={!filterCategory}
            >
              <option value="">All Sub Categories</option>
              {filterCategory && courseCategories[filterCategory as keyof typeof courseCategories]?.map((subCategory) => (
                <option key={subCategory} value={subCategory}>{subCategory}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button 
              onClick={clearFilters}
              className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={() => { setFormOpen(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b flex items-center justify-between bg-blue-900">
              <h3 className="text-xl font-bold text-white">{editing ? 'Edit Course' : 'Create Course'}</h3>
              <button className="text-yellow-400 hover:text-white" onClick={() => { setFormOpen(false); }}>{'✕'}</button>
            </div>
            <div className="p-6">
              <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                  <input className="border rounded-lg px-3 py-2 w-full" placeholder="e.g., PUC1-SCI" value={payload.name} onChange={(e) => setPayload({ ...payload, name: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                  <input className="border rounded-lg px-3 py-2 w-full" placeholder="e.g., I PUC Science" value={payload.title} onChange={(e) => setPayload({ ...payload, title: e.target.value })} required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                  <textarea className="border rounded-lg px-3 py-2 w-full h-28" placeholder="Brief description of the course" value={payload.description} onChange={(e) => setPayload({ ...payload, description: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                  <select 
                    className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    value={payload.category} 
                    onChange={(e) => handleCategoryChange(e.target.value)} 
                    required
                  >
                    <option value="">Select Category</option>
                    {Object.keys(courseCategories).map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Sub Category
                    {payload.category && (
                      <span className="text-xs text-gray-500 ml-2">
                        ({courseCategories[payload.category as keyof typeof courseCategories]?.length} options)
                      </span>
                    )}
                  </label>
                  <select 
                    className={`border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      !showSubCategories ? 'bg-gray-100 text-gray-500' : ''
                    }`}
                    value={payload.sub_category} 
                    onChange={(e) => handleSubCategoryChange(e.target.value)} 
                    required
                    disabled={!showSubCategories}
                  >
                    <option value="">{showSubCategories ? 'Select Sub Category' : 'Select a category first'}</option>
                    {payload.category && courseCategories[payload.category as keyof typeof courseCategories]?.map((subCategory) => (
                      <option key={subCategory} value={subCategory}>{subCategory}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Start Date & Time</label>
                  <input 
                    type="datetime-local"
                    className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    value={formatDateForInput(payload.start_date)} 
                    onChange={(e) => handleDateChange('start_date', e.target.value)} 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">End Date & Time</label>
                  <input 
                    type="datetime-local"
                    className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    value={formatDateForInput(payload.end_date)} 
                    onChange={(e) => handleDateChange('end_date', e.target.value)} 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Duration</label>
                  <input className="border rounded-lg px-3 py-2 w-full" placeholder="e.g., 16 weeks" value={payload.duration} onChange={(e) => setPayload({ ...payload, duration: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Instructor</label>
                  <input className="border rounded-lg px-3 py-2 w-full" placeholder="Instructor name" value={payload.instructor} onChange={(e) => setPayload({ ...payload, instructor: e.target.value })} required />
                </div>
                {/* Price removed - all courses are free */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Thumbnail {editing && <span className="text-sm text-orange-600">(Cannot be changed in edit mode)</span>}
                  </label>
                  <input 
                    className={`border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      editing ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setThumbnail(e.target.files?.[0] || null)} 
                    required={!editing}
                    disabled={!!editing}
                  />
                  {editing && (
                    <div className="mt-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Current Thumbnail</label>
                      <div className="flex items-center gap-4">
                        <img 
                          src={ApiService.fileUrl((editing as Course).thumbnail_image) || ''} 
                          alt={(editing as Course).title} 
                          className="w-36 h-20 object-cover rounded-md border" 
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} 
                        />
                        <div className="text-sm text-gray-600">
                          <p className="text-orange-600 font-medium">Thumbnail cannot be changed in edit mode.</p>
                          <p className="text-gray-500">To change thumbnail, delete and recreate the course.</p>
                        </div>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((it) => (
          <div key={it._id} className="rounded-2xl overflow-hidden shadow-lg border border-blue-100 bg-white flex flex-col">
            <div className="relative w-full h-40 bg-gray-100 flex items-center justify-center">
              {ApiService.fileUrl(it.thumbnail_image) ? (
                <img src={ApiService.fileUrl(it.thumbnail_image) || ''} alt={it.title} className="w-full h-40 object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                <div className="text-gray-500">img not available</div>
              )}
            </div>
            <div className="p-5">
              <h3 className="text-lg font-bold text-gray-900">{it.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{it.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="bg-blue-50 rounded-lg p-2"><span className="font-semibold text-blue-900">Category:</span> {it.category} / {it.sub_category}</div>
                <div className="bg-yellow-50 rounded-lg p-2"><span className="font-semibold text-yellow-700">Instructor:</span> {it.instructor}</div>
                {/* Price removed from card */}
                <div className="bg-yellow-50 rounded-lg p-2"><span className="font-semibold text-yellow-700">Updated:</span> {new Date(it.updated_at).toLocaleString()}</div>
              </div>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button onClick={() => openEdit(it)} className="px-4 py-2 rounded-lg border border-blue-900 text-blue-900 hover:bg-yellow-400 hover:border-yellow-400">Edit</button>
                <button onClick={() => openFeedback(it)} className="px-4 py-2 rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200">Feedback</button>
                <button onClick={() => onDelete(it._id)} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Delete</button>
              </div>
            </div>
          </div>
        ))}
    </div>

      {/* Feedback Modal */}
      {feedbackOpen && selectedCourse && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50" onClick={() => { setFeedbackOpen(false); }}>
          <div className="w-full max-w-2xl max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 py-3 bg-blue-900 flex items-center justify-between border-b border-blue-700">
              <div>
                <h3 className="text-lg font-bold text-white">Feedback</h3>
                <p className="text-blue-200 text-sm">{selectedCourse.title}</p>
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
              ) : courseFeedback && courseFeedback.length > 0 ? (
                <div className="space-y-3">
                  {courseFeedback.map((fb: any, idx: number) => (
                    <div key={idx} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-sm font-semibold text-gray-800">Rating: {fb.rating}/5</div>
                        <div className="text-xs text-gray-500">{(fb.created_at || fb.feedback_date) ? new Date(fb.created_at || fb.feedback_date).toLocaleString() : ''}</div>
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
  </div>
);
};

export default CoursePage;