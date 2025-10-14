import React, { useEffect, useMemo, useState } from 'react';
import ApiService, { type User } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');
  const [selected, setSelected] = useState<User | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async (): Promise<void> => {
      try {
        const res = await ApiService.getAllUsers();
        if (isMounted) setUsers((res.users || []).slice().reverse());
      } catch (e: any) {
        if (isMounted) setError(e?.message || 'Failed to load users');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.name, u.email, u.provider || 'Custom Email']
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [users, query]);

  if (loading) {
    return <div className="text-gray-600">Loading users...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Users</h2>
            <p className="text-gray-600">Total: {users.length}</p>
          </div>
          <input
            className="border rounded-lg px-3 py-2 w-full md:w-80"
            placeholder="Search by name, email, provider"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map((u) => (
              <tr key={u._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelected(u)}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{u.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{(u.provider && u.provider.trim().length > 0) ? u.provider : 'Custom Email'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(u.created_at).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && (
        <UserDetailModal user={selected} onClose={() => setSelected(null)} onDeleted={(id) => { setUsers((prev) => prev.filter((u) => u._id !== id)); setSelected(null); }} />
      )}
    </div>
  );
};

const UserDetailModal: React.FC<{ user: User; onClose: () => void; onDeleted: (id: string) => void }> = ({ user, onClose, onDeleted }) => {
  const { token } = useAuth();
  const handleDelete = async (): Promise<void> => {
    if (!token) return;
    if (!confirm('Delete this user profile?')) return;
    try {
      await ApiService.deleteUser(user._id, token);
      onDeleted(user._id);
    } catch (e) {
      alert('Failed to delete user');
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b flex items-center justify-between bg-blue-900">
          <h3 className="text-xl font-bold text-white">User Details</h3>
          <button className="text-yellow-400 hover:text-white" onClick={onClose}>✕</button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-900 text-white rounded-xl p-5 shadow">
            <h4 className="font-bold text-lg mb-3 text-yellow-400">Basic Information</h4>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between"><span className="text-yellow-300">Name</span><span>{user.name}</span></div>
              <div className="flex justify-between"><span className="text-yellow-300">Email</span><span>{user.email}</span></div>
              <div className="flex justify-between"><span className="text-yellow-300">Provider</span><span>{user.provider || 'Custom Email'}</span></div>
              <div className="flex justify-between"><span className="text-yellow-300">Contact</span><span>{user.contact_no}</span></div>
            </div>
          </div>
          <div className="bg-blue-900 text-white rounded-xl p-5 shadow">
            <h4 className="font-bold text-lg mb-3 text-yellow-400">Academic</h4>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between"><span className="text-yellow-300">Gender</span><span>{user.gender}</span></div>
              <div className="flex justify-between"><span className="text-yellow-300">Education</span><span>{user.education}</span></div>
              <div className="flex justify-between"><span className="text-yellow-300">Course</span><span>{user.course}</span></div>
              <div className="flex justify-between"><span className="text-yellow-300">Created</span><span>{new Date(user.created_at).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-yellow-300">Last Login</span><span>{new Date(user.last_login).toLocaleString()}</span></div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t flex items-center justify-between bg-blue-900">
          <button className="px-4 py-2 rounded-lg bg-white text-blue-900 hover:bg-yellow-400 hover:text-blue-900" onClick={onClose}>Close</button>
          <button className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700" onClick={handleDelete}>Delete Profile</button>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;


