import React, { useEffect, useMemo, useState } from 'react';
import ApiService, { type NotificationItem } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const NotificationsPage: React.FC = () => {
  const { token } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<NotificationItem | null>(null);
  const [payload, setPayload] = useState({
    title: '',
    message: '',
    type: '',
    target_audience: '',
    priority: '',
  });
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Filter options
  const notificationTypes = ['Info', 'Warning', 'Success', 'Error', 'Update', 'Reminder'];
  const priorities = ['Low', 'Medium', 'High', 'Critical'];
  const targetAudiences = ['All Users', 'Students', 'Instructors', 'Admins', 'Specific Groups'];

  const loadAll = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiService.getNotifications();
      setItems((res.notifications || []).slice().reverse());
    } catch (e: any) {
      setError(e?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadAll(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      const matchesSearch = !q || [it.title, it.message, it.type, it.target_audience].some((v) => v.toLowerCase().includes(q));
      const matchesType = !filterType || it.type === filterType;
      const matchesPriority = !filterPriority || it.priority === filterPriority;
      const matchesStatus = !filterStatus || (filterStatus === 'active' ? it.is_active : !it.is_active);
      
      return matchesSearch && matchesType && matchesPriority && matchesStatus;
    });
  }, [items, query, filterType, filterPriority, filterStatus]);

  const resetForm = (): void => {
    setEditing(null);
    setPayload({
      title: '',
      message: '',
      type: '',
      target_audience: '',
      priority: '',
    });
  };

  const openCreate = (): void => { resetForm(); setFormOpen(true); };
  const openEdit = (it: NotificationItem): void => {
    setEditing(it);
    setPayload({
      title: it.title,
      message: it.message,
      type: it.type,
      target_audience: it.target_audience,
      priority: it.priority,
    });
    setFormOpen(true);
  };

  const onSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!token) { setError('Not authorized'); return; }
    setSubmitting(true);
    setError(null);
    try {
      if (editing) {
        await ApiService.updateNotification(editing._id, payload as any, token);
      } else {
        await ApiService.createNotification(payload as any, token);
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
    if (!confirm('Delete this notification?')) return;
    try {
      await ApiService.deleteNotification(id, token);
      await loadAll();
    } catch (e: any) { setError(e?.message || 'Delete failed'); }
  };

  const clearFilters = () => {
    setQuery('');
    setFilterType('');
    setFilterPriority('');
    setFilterStatus('');
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'success': return 'bg-green-100 text-green-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'update': return 'bg-purple-100 text-purple-800';
      case 'reminder': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="text-gray-600">Loading notifications...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
            <p className="text-gray-600">Total: {items.length} | Filtered: {filtered.length}</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input className="border rounded-lg px-3 py-2 w-full md:w-80" placeholder="Search notifications" value={query} onChange={(e) => setQuery(e.target.value)} />
            <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Add Notification</button>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl p-6 shadow">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="flex flex-col md:flex-row gap-2">
              <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Filter by Type:</label>
              <select 
                className="border rounded-lg px-3 py-2 min-w-[150px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">All Types</option>
                {notificationTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col md:flex-row gap-2">
              <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Filter by Priority:</label>
              <select 
                className="border rounded-lg px-3 py-2 min-w-[150px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                value={filterPriority} 
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <option value="">All Priorities</option>
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b flex items-center justify-between bg-blue-900">
              <h3 className="text-xl font-bold text-white">{editing ? 'Edit Notification' : 'Create Notification'}</h3>
              <button className="text-yellow-400 hover:text-white" onClick={() => { setFormOpen(false); }}>{'✕'}</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                  <input 
                    className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="Notification title" 
                    value={payload.title} 
                    onChange={(e) => setPayload({ ...payload, title: e.target.value })} 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
                  <textarea 
                    className="border rounded-lg px-3 py-2 w-full h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="Notification message" 
                    value={payload.message} 
                    onChange={(e) => setPayload({ ...payload, message: e.target.value })} 
                    required 
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
                    <select 
                      className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      value={payload.type} 
                      onChange={(e) => setPayload({ ...payload, type: e.target.value })}
                      required
                    >
                      <option value="">Select Type</option>
                      {notificationTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Priority</label>
                    <select 
                      className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      value={payload.priority} 
                      onChange={(e) => setPayload({ ...payload, priority: e.target.value })}
                      required
                    >
                      <option value="">Select Priority</option>
                      {priorities.map((priority) => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Target Audience</label>
                  <select 
                    className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    value={payload.target_audience} 
                    onChange={(e) => setPayload({ ...payload, target_audience: e.target.value })}
                    required
                  >
                    <option value="">Select Target Audience</option>
                    {targetAudiences.map((audience) => (
                      <option key={audience} value={audience}>{audience}</option>
                    ))}
                  </select>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notification Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type & Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target Audience</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Read By</th> */}
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
                    <div className="text-sm text-gray-500 mt-1 line-clamp-2">{it.message}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(it.type)}`}>
                      {it.type}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(it.priority)}`}>
                      {it.priority}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{it.target_audience}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${it.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {it.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{it.read_by.length} users</td> */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(it.updated_at).toLocaleString()}</td>
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

export default NotificationsPage;

