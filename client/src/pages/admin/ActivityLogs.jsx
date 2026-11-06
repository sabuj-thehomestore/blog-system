import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { Pagination } from '../../components/Pagination';
import { Activity, Clock, Shield, Globe } from 'lucide-react';

export const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [actionFilter, setActionFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async (page = 1, action = '') => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (action) params.action = action;

      const { data } = await api.get('/admin/logs', { params });
      setLogs(data.data || []);
      if (data.meta) setMeta(data.meta);
    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(meta.page, actionFilter);
  }, [meta.page, actionFilter]);

  const actionColors = {
    LOGIN: 'bg-blue-50 text-blue-700 border-blue-200',
    LOGOUT: 'bg-slate-50 text-slate-700 border-slate-200',
    REGISTER: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    POST_CREATE: 'bg-teal-50 text-teal-700 border-teal-200',
    POST_UPDATE: 'bg-amber-50 text-amber-700 border-amber-200',
    POST_DELETE: 'bg-red-50 text-red-700 border-red-200',
    POST_RESTORE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    POST_HARD_DELETE: 'bg-rose-100 text-rose-800 border-rose-300',
    COMMENT_CREATE: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    COMMENT_UPDATE: 'bg-purple-50 text-purple-700 border-purple-200',
    COMMENT_DELETE: 'bg-pink-50 text-pink-700 border-pink-200',
    USER_ROLE_CHANGE: 'bg-violet-100 text-violet-800 border-violet-300',
    USER_STATUS_CHANGE: 'bg-orange-50 text-orange-700 border-orange-200'
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Activity Audit Trail</h2>
          <p className="text-xs text-slate-500">
            Immutable log of system events, authentication, and content mutations
          </p>
        </div>

        {/* Filter */}
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setMeta((prev) => ({ ...prev, page: 1 }));
          }}
          className="text-xs py-2 px-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
        >
          <option value="">All Actions</option>
          <option value="LOGIN">LOGIN</option>
          <option value="REGISTER">REGISTER</option>
          <option value="POST_CREATE">POST_CREATE</option>
          <option value="POST_UPDATE">POST_UPDATE</option>
          <option value="POST_DELETE">POST_DELETE</option>
          <option value="POST_RESTORE">POST_RESTORE</option>
          <option value="COMMENT_CREATE">COMMENT_CREATE</option>
          <option value="USER_ROLE_CHANGE">USER_ROLE_CHANGE</option>
          <option value="USER_STATUS_CHANGE">USER_STATUS_CHANGE</option>
        </select>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : logs.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
          <p className="text-slate-500 text-sm">No activity logs recorded yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-6">Timestamp</th>
                  <th className="py-4 px-6">Action</th>
                  <th className="py-4 px-6">User / Actor</th>
                  <th className="py-4 px-6">Resource</th>
                  <th className="py-4 px-6">IP / Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-6 text-xs text-slate-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-slate-600" />
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3 px-6">
                      <span
                        className={`inline-block text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                          actionColors[log.action] || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      {log.user ? (
                        <div>
                          <div className="text-xs font-bold text-slate-800">
                            {log.user.name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {log.user.email}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-600 italic">System / Anonymous</span>
                      )}
                    </td>
                    <td className="py-3 px-6 text-xs font-mono text-slate-600">
                      <span className="text-slate-700 font-bold">{log.resourceType}</span>
                      {log.resourceId && (
                        <span className="block text-[10px] text-slate-600 truncate max-w-[140px]">
                          {log.resourceId}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-6 text-xs text-slate-500">
                      <div className="flex items-center gap-1 font-mono text-[11px]">
                        <Globe className="h-3 w-3 text-slate-600" />
                        {log.ipAddress || '127.0.0.1'}
                      </div>
                      {log.details?.path && (
                        <div className="text-[10px] text-slate-600 truncate max-w-xs">
                          {log.details.method} {log.details.path}
                        </div>
                      )}
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
