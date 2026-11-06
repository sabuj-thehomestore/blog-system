import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Activity, Shield } from 'lucide-react';

export const AdminLayout = () => {
  const navItems = [
    { name: 'Dashboard Overview', path: '/admin', icon: LayoutDashboard, end: true },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Post Moderation', path: '/admin/posts', icon: FileText },
    { name: 'Activity Audit Logs', path: '/admin/logs', icon: Activity }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 pb-6 border-b border-slate-200 mb-8">
        <div className="h-10 w-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-sm">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Control Center</h1>
          <p className="text-xs text-slate-500 font-medium">
            System administration, RBAC policy enforcement, and audit observability
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-slate-200 pb-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </NavLink>
          );
        })}
      </div>

      <Outlet />
    </div>
  );
};
