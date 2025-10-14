import React, { useState } from 'react';
import ApiService, { type EnrollmentItem } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const EnrollmentsPage: React.FC = () => {
  const { token } = useAuth();
  const [items, setItems] = useState<EnrollmentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');

  const loadByCourse = async (): Promise<void> => {
    if (!courseId) return;
    setLoading(true); setError(null);
    try {
      const res = await ApiService.getEnrollmentsByCourse(courseId);
      setItems((res.enrollments || []).slice().reverse());
    } catch (e: any) { setError(e?.message || 'Failed to load'); }
    finally { setLoading(false); }
  };

  const loadByUser = async (): Promise<void> => {
    if (!userId) return;
    setLoading(true); setError(null);
    try {
      const res = await ApiService.getEnrollmentsByUser(userId);
      setItems((res.enrollments || []).slice().reverse());
    } catch (e: any) { setError(e?.message || 'Failed to load'); }
    finally { setLoading(false); }
  };

  const onDelete = async (id: string): Promise<void> => {
    if (!token) { setError('Not authorized'); return; }
    if (!confirm('Delete this enrollment?')) return;
    try { await ApiService.deleteEnrollment(id, token); await loadByCourse(); }
    catch (e: any) { setError(e?.message || 'Delete failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Enrollments</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex gap-2">
            <input className="border rounded-lg px-3 py-2 w-full" placeholder="Course ID" value={courseId} onChange={(e) => setCourseId(e.target.value)} />
            <button onClick={loadByCourse} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Load by Course</button>
          </div>
          <div className="flex gap-2">
            <input className="border rounded-lg px-3 py-2 w-full" placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} />
            <button onClick={loadByUser} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Load by User</button>
          </div>
        </div>
      </div>

      {loading && <div className="text-gray-600">Loading enrollments...</div>}
      {error && <div className="text-red-600">{error}</div>}

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((it) => (
              <tr key={it._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{it.user_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{it.course_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{it.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{it.progress}%</td>
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

export default EnrollmentsPage;

