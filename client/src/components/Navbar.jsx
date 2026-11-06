import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  PenSquare,
  Shield,
  LogOut,
  User,
  Bell,
  Menu,
  X,
  BookOpen
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { notifications, clearNotification } = useSocket();
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                Antigravity<span className="text-emerald-600">Blog</span>
              </span>
              <span className="block text-[10px] uppercase font-bold text-slate-600 tracking-wider -mt-1">
                MERN Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition"
            >
              Explore Posts
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/create-post"
                  className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100/70 px-3.5 py-2 rounded-xl transition"
                >
                  <PenSquare className="h-4 w-4" />
                  Write Post
                </Link>

                <Link
                  to="/my-posts"
                  className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition"
                >
                  My Articles
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-lg transition"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    Admin Panel
                  </Link>
                )}

                {/* Real-time Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
                    title="Real-time Notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                      <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
                    )}
                  </button>

                  {/* Dropdown Notifications */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Real-time Alerts ({notifications.length})
                        </span>
                      </div>
                      {notifications.length === 0 ? (
                        <p className="text-sm text-slate-600 py-4 text-center">
                          No notifications yet.
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {notifications.map((item, idx) => (
                            <div
                              key={idx}
                              className="text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start justify-between gap-2"
                            >
                              <div>
                                <p className="font-semibold text-slate-800">
                                  {item.comment?.author?.name || 'Someone'} commented:
                                </p>
                                <p className="text-slate-600 line-clamp-2 italic">
                                  "{item.comment?.content}"
                                </p>
                                <span className="text-[10px] text-emerald-600 font-medium">
                                  on {item.post?.title}
                                </span>
                              </div>
                              <button
                                onClick={() => clearNotification(idx)}
                                className="text-slate-600 hover:text-slate-600 p-1"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* User Info & Logout */}
                <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                  <div className="flex items-center gap-2">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-8 w-8 rounded-full object-cover ring-2 ring-slate-100"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs">
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <span className="text-xs font-semibold text-slate-800 hidden lg:inline-block max-w-[120px] truncate">
                      {user?.name}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                    title="Log Out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-emerald-600 px-3 py-2 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl shadow-sm transition"
                >
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-700 font-medium"
          >
            Explore Posts
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/create-post"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-emerald-600 font-semibold"
              >
                Write Post
              </Link>
              <Link
                to="/my-posts"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-slate-700 font-medium"
              >
                My Articles
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-purple-700 font-bold"
                >
                  Admin Panel
                </Link>
              )}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800">{user?.name}</span>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="text-sm text-red-600 font-semibold flex items-center gap-1"
                >
                  <LogOut className="h-4 w-4" /> Log out
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-slate-700 font-medium border border-slate-200 rounded-xl"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-white bg-emerald-600 font-semibold rounded-xl"
              >
                Sign Up Free
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
