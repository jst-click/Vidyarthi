import React, { useEffect, useMemo, useState } from 'react';
import ApiService, { type Testimonial } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const TestimonialsPage: React.FC = () => {
  const { token } = useAuth();
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');

  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [studentName, setStudentName] = useState<string>('');
  const [course, setCourse] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [mediaType, setMediaType] = useState<string>('video');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [studentImage, setStudentImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) =>
      [it.title, it.student_name, it.course, String(it.rating)]
        .some((v) => v.toLowerCase().includes(q))
    );
  }, [items, query]);

  const loadAll = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiService.getTestimonials();
      setItems((res.testimonials || []).slice().reverse());
    } catch (e: any) {
      setError(e?.message || 'Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await ApiService.getTestimonials();
        if (active) setItems((res.testimonials || []).slice().reverse());
      } catch (e: any) {
        if (active) setError(e?.message || 'Failed to load testimonials');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const resetForm = (): void => {
    setEditing(null);
    setTitle('');
    setDescription('');
    setStudentName('');
    setCourse('');
    setRating(5);
    setMediaType('video');
    setMediaFile(null);
    setStudentImage(null);
  };

  const openCreate = (): void => {
    resetForm();
    setFormOpen(true);
  };

  // const openEdit = (it: Testimonial): void => {
  //   setEditing(it);
  //   setTitle(it.title);
  //   setDescription(it.description);
  //   setStudentName(it.student_name);
  //   setCourse(it.course);
  //   setRating(it.rating);
  //   setMediaType(it.media_type);
  //   setMediaFile(null);
  //   setStudentImage(null);
  //   setFormOpen(true);
  // };

  const onSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!token) { setError('Not authorized'); return; }
    setSubmitting(true);
    setError(null);
    try {
      if (editing) {
        await ApiService.updateTestimonial(editing._id, {
          title,
          description,
          student_name: studentName,
          course,
          rating,
          media_type: mediaType,
        } as Partial<Testimonial>, token);
      } else {
        if (!mediaFile) { setError('Media file is required'); setSubmitting(false); return; }
        await ApiService.createTestimonial({
          payload: { title, description, student_name: studentName, course, rating, media_type: mediaType },
          media_file: mediaFile,
          student_image: studentImage || undefined,
        }, token);
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
    if (!confirm('Delete this testimonial?')) return;
    try {
      await ApiService.deleteTestimonial(id, token);
      await loadAll();
    } catch (e: any) {
      setError(e?.message || 'Delete failed');
    }
  };

  if (loading) return <div className="text-gray-600">Loading testimonials...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Testimonials</h2>
            <p className="text-gray-600">Total: {items.length}</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input className="border rounded-lg px-3 py-2 w-full md:w-80" placeholder="Search testimonials" value={query} onChange={(e) => setQuery(e.target.value)} />
            <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Add</button>
          </div>
        </div>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={() => { setFormOpen(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b flex items-center justify-between bg-blue-900">
              <h3 className="text-xl font-bold text-white">{editing ? 'Edit Testimonial' : 'Create Testimonial'}</h3>
              <button className="text-yellow-400 hover:text-white" onClick={() => { setFormOpen(false); }}>{'✕'}</button>
            </div>
            <div className="p-6">
              <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
              <input className="border rounded-lg px-3 py-2 w-full" placeholder="e.g., Great mentor support" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Student Name</label>
              <input className="border rounded-lg px-3 py-2 w-full" placeholder="e.g., John Doe" value={studentName} onChange={(e) => setStudentName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Course</label>
              <input className="border rounded-lg px-3 py-2 w-full" placeholder="e.g., CMA Intermediate" value={course} onChange={(e) => setCourse(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Rating (1-5)</label>
              <input className="border rounded-lg px-3 py-2 w-full" placeholder="4" type="number" min={1} max={5} value={rating} onChange={(e) => setRating(Number(e.target.value))} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Media Type</label>
              <select className="border rounded-lg px-3 py-2 w-full" value={mediaType} onChange={(e) => setMediaType(e.target.value)}>
                <option value="video">video</option>
                <option value="image">image</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
              <textarea className="border rounded-lg px-3 py-2 w-full h-24" placeholder="Write a detailed feedback..." value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>
            {!editing && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Upload Media</label>
                <input className="border rounded-lg px-3 py-2 w-full" type="file" accept="video/*,image/*" onChange={(e) => setMediaFile(e.target.files?.[0] || null)} required />
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Student Image (optional)</label>
              <input className="border rounded-lg px-3 py-2 w-full" type="file" accept="image/*" onChange={(e) => setStudentImage(e.target.files?.[0] || null)} />
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
        {filtered.map((it) => {
          const mediaUrl = ApiService.fileUrl(it.media_url);
          const studentImg = ApiService.fileUrl(it.student_image || undefined);
          const isImage = (it.media_type || '').toLowerCase().startsWith('image');
          return (
            <div key={it._id} className="rounded-2xl overflow-hidden shadow-lg border border-blue-100 bg-white flex flex-col">
              <div className="relative w-full h-52 bg-gray-100 flex items-center justify-center">
                {mediaUrl ? (
                  isImage ? (
                    <img src={mediaUrl} alt={it.title} className="w-full h-52 object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <div className="relative w-full h-52 bg-gray-900 flex items-center justify-center">
                      <video 
                        className="w-full h-52 object-cover" 
                        controls
                        preload="metadata"
                        onLoadedMetadata={(e) => {
                          // Seek to 2 seconds to show a frame instead of black screen
                          if (e.currentTarget.duration > 2) {
                            e.currentTarget.currentTime = 2;
                          } else if (e.currentTarget.duration > 0) {
                            e.currentTarget.currentTime = e.currentTarget.duration / 2;
                          }
                        }}
                        onError={(e) => {
                          console.error('Video load error:', e);
                        }}
                      >
                        <source src={mediaUrl || ''} type="video/mp4" />
                        <source src={mediaUrl || ''} type="video/webm" />
                        <source src={mediaUrl || ''} type="video/ogg" />
                        Your browser does not support the video tag.
                      </video>
                      {/* Video play overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 pointer-events-none">
                        <div className="w-16 h-16 bg-white bg-opacity-80 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="text-gray-500">Media not available</div>
                )}
                {studentImg && (
                  <img src={studentImg} alt={it.student_name} className="absolute -bottom-6 left-5 w-12 h-12 rounded-full border-2 border-white object-cover bg-white" />
                )}
              </div>
              <div className="p-5 pt-8">
                <h3 className="text-lg font-bold text-gray-900">{it.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{it.description}</p>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-blue-50 rounded-lg p-2"><span className="font-semibold text-blue-900">Student:</span> {it.student_name}</div>
                  <div className="bg-yellow-50 rounded-lg p-2"><span className="font-semibold text-yellow-700">Course:</span> {it.course}</div>
                  <div className="bg-blue-50 rounded-lg p-2"><span className="font-semibold text-blue-900">Rating:</span> {it.rating}</div>
                  <div className="bg-yellow-50 rounded-lg p-2"><span className="font-semibold text-yellow-700">Updated:</span> {new Date(it.updated_at).toLocaleString()}</div>
                </div>
                <div className="mt-4 flex items-center justify-end gap-2">
                  {/* <button onClick={() => openEdit(it)} className="px-4 py-2 rounded-lg border border-blue-900 text-blue-900 hover:bg-yellow-400 hover:border-yellow-400">Edit</button> */}
                  <button onClick={() => onDelete(it._id)} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Delete</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TestimonialsPage;


