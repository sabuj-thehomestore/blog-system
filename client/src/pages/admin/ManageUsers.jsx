import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { Pagination } from '../../components/Pagination';
import { Search, Shield, User, UserCheck, UserX, AlertCircle } from 'lucide-react';

export const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [search, setSearch] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async (page = 1, searchQuery = '') => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (searchQuery) params.search = searchQuery;

      const { data } = await api.get('/admin/users', { params });
      setUsers(data.data || []);
      if (data.meta) setMeta(data.meta);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(meta.page, activeSearch);
  }, [meta.page, activeSearch]);

  const handleSearch = (e) => {
    e.preventDefault();
    setActiveSearch(search);
    setMeta((prev) => ({ ...prev, page: 1 }));
  };

  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole.toUpperCase()}?`)) return;

    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const toggleStatus = async (userId, currentStatus) => {
    const newStatus = !currentStatus;
    const actionWord = newStatus ? 'activate' : 'deactivate';
    if (!window.confirm(`Are you sure you want to ${actionWord} this user account?`)) return;

    try {
      await api.patch(`/admin/users/${userId}/status`, { isActive: newStatus });
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive: newStatus } : u))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">User Accounts Directory</h2>
          <p className="text-xs text-slate-500">
            {meta.totalItems} total users registered in the system
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-grow sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-semibold hover:bg-purple-700 transition"
          >
            Filter
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" /> {error}
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-6">User</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Role (RBAC)</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Joined Date</th>
                  <th className="py-4 px-6 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {u.avatar ? (
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center">
                            {u.name?.[0] || 'U'}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-slate-900">{u.name}</div>
                          <div className="text-[10px] text-slate-600 capitalize">
                            Provider: {u.provider || 'local'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs font-mono text-slate-600">
                      {u.email}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {u.role === 'admin' ? (
                          <Shield className="h-3 w-3" />
                        ) : (
                          <User className="h-3 w-3" />
                        )}
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {u.isActive ? (
                        <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[11px] font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                          Deactivated
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => toggleRole(u._id, u.role)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-purple-200 text-purple-700 hover:bg-purple-50 transition"
                          title="Toggle Admin/User Role"
                        >
                          Make {u.role === 'admin' ? 'User' : 'Admin'}
                        </button>

                        <button
                          onClick={() => toggleStatus(u._id, u.isActive)}
                          className={`p-1.5 rounded-lg border transition ${
                            u.isActive
                              ? 'border-amber-200 text-amber-600 hover:bg-amber-50'
                              : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={u.isActive ? 'Deactivate User' : 'Activate User'}
                        >
                          {u.isActive ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination
        page={meta.page}
        totalPages={meta.totalPages}
        onPageChange={(p) => setMeta((prev) => ({ ...prev, page: p }))}
      />
    </div>
  );
};
