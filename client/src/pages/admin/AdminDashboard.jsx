import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { Users, FileText, MessageSquare, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/stats');
        setStats(data.data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Registered Users',
      value: stats?.totalUsers || 0,
      description: 'Active administrators and readers',
      icon: Users,
      color: 'bg-blue-50 text-blue-600 border-blue-100',
      link: '/admin/users'
    },
    {
      title: 'Total Blog Posts',
      value: stats?.totalPosts || 0,
      description: `${stats?.activePosts || 0} active, ${stats?.deletedPosts || 0} soft-deleted`,
      icon: FileText,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      link: '/admin/posts'
    },
    {
      title: 'Total Active Comments',
      value: stats?.totalComments || 0,
      description: 'Community interactions across posts',
      icon: MessageSquare,
      color: 'bg-amber-50 text-amber-600 border-amber-100',
      link: '/admin/posts'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {card.title}
                  </span>
                  <div className={`p-2.5 rounded-2xl border ${card.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-4xl font-black text-slate-900 tracking-tight mb-1">
                  {card.value}
                </div>
                <p className="text-xs text-slate-500">{card.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link
                  to={card.link}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-800 transition"
                >
                  Manage <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* System Status Banner */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-3xl p-8 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-800/80 text-xs font-bold uppercase tracking-wider text-purple-200 mb-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> System Healthy
            </div>
            <h3 className="text-xl font-bold">Role-Based Access Control Active</h3>
            <p className="text-xs text-purple-200 mt-1 max-w-xl">
              All routes are protected via JWT verification, rate limiting, and RBAC middleware. User actions are logged into the audit trail.
            </p>
          </div>
          <Link
            to="/admin/logs"
            className="px-5 py-2.5 bg-white text-purple-900 font-bold text-xs rounded-xl hover:bg-purple-50 transition shadow-sm whitespace-nowrap"
          >
            Inspect Audit Trail &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};
