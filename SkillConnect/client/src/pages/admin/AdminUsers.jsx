import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Search } from 'lucide-react';
import api from '../../services/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    return api.get('/admin/users', { params: { search: search || undefined, role: role || undefined } })
      .then((res) => setUsers(res.data.data))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [search, role]);

  async function toggleActive(user) {
    try {
      await api.put(`/admin/users/${user.id}/status`, { is_active: user.is_active ? 0 : 1 });
      toast.success(`User ${user.is_active ? 'disabled' : 'enabled'}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update user');
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Users</h1>

      <div className="mt-4 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 rounded-full border border-ink-100 bg-white px-4 py-2">
          <Search size={16} className="text-ink-400" />
          <input className="border-0 bg-transparent text-sm outline-none" placeholder="Search name or email"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input w-40" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All roles</option>
          <option value="student">Student</option>
          <option value="recruiter">Recruiter</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {loading ? (
        <p className="mt-6 text-ink-400">Loading...</p>
      ) : (
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-100 text-ink-400">
              <tr>
                <th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Role</th>
                <th className="p-4">Status</th><th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-ink-50 last:border-0">
                  <td className="p-4 font-medium text-ink-900">{u.name}</td>
                  <td className="p-4 text-ink-600">{u.email}</td>
                  <td className="p-4 capitalize text-ink-600">{u.role}</td>
                  <td className="p-4">
                    <span className={`badge ${u.is_active ? 'bg-teal/10 text-teal' : 'bg-red-50 text-red-600'}`}>
                      {u.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="p-4">
                    <button onClick={() => toggleActive(u)} className="btn-secondary">
                      {u.is_active ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
