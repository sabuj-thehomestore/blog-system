import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { Pagination } from '../../components/Pagination';
import { RotateCcw, Trash2, ExternalLink, Filter, Search, AlertCircle } from 'lucide-react';

export const ManagePosts = () => {
  const [posts, setPosts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [filterDeleted, setFilterDeleted] = useState('');
  const [search, setSearch] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAdminPosts = async (page = 1, isDeletedFilter = '', searchQuery = '') => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (isDeletedFilter !== '') params.isDeleted = isDeletedFilter;
      if (searchQuery) params.search = searchQuery;

      const { data } = await api.get('/admin/posts', { params });
      setPosts(data.data || []);
      if (data.meta) setMeta(data.meta);
    } catch (err) {
      console.error('Failed to fetch admin posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminPosts(meta.page, filterDeleted, activeSearch);
  }, [meta.page, filterDeleted, activeSearch]);

  const handleSearch = (e) => {
    e.preventDefault();
    setActiveSearch(search);
    setMeta((prev) => ({ ...prev, page: 1 }));
  };

  const handleRestore = async (postId) => {
    if (!window.confirm('Restore this soft-deleted post back to public visibility?')) return;
    try {
      await api.patch(`/posts/${postId}/restore`);
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, isDeleted: false, deletedAt: null } : p))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to restore post');
    }
  };

  const handlePermanentDelete = async (postId) => {
    if (
      !window.confirm(
        'PERMANENT DELETE WARNING: This action cannot be undone. All comments associated with this post will also be deleted. Proceed?'
      )
    )
      return;

    try {
      await api.delete(`/posts/${postId}/permanent`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to permanently delete post');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Post Moderation Directory</h2>
          <p className="text-xs text-slate-500">
            Manage all platform posts, recover soft-deleted items, or purge permanently
          </p>
        </div>

        {/* Filter and Search */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={filterDeleted}
            onChange={(e) => {
              setFilterDeleted(e.target.value);
              setMeta((prev) => ({ ...prev, page: 1 }));
            }}
            className="text-xs py-2 px-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
          >
            <option value="">All Posts (Active & Soft-deleted)</option>
            <option value="false">Only Active Posts</option>
            <option value="true">Only Soft-Deleted Posts</option>
          </select>

          <form onSubmit={handleSearch} className="flex items-center gap-1.5">
            <input
              type="text"
              placeholder="Search by keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-xs py-2 px-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-purple-600 text-white rounded-xl text-xs font-semibold hover:bg-purple-700 transition"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
          <p className="text-slate-500 text-sm">No posts found matching the filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-6">Title & Slug</th>
                  <th className="py-4 px-6">Author</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Created Date</th>
                  <th className="py-4 px-6 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {posts.map((post) => (
                  <tr key={post._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-6 max-w-sm">
                      <div className="font-semibold text-slate-900 truncate">
                        {post.title}
                      </div>
                      <div className="text-xs text-slate-600 font-mono truncate">
                        {post.slug}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-xs font-bold text-slate-800">
                        {post.author?.name || 'Unknown'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {post.author?.email}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {post.isDeleted ? (
                        <span className="inline-flex items-center text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
                          Soft Deleted
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          Active Public
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-2">
                        {!post.isDeleted && (
                          <Link
                            to={`/post/${post.slug}`}
                            className="p-1.5 text-slate-600 hover:text-emerald-600 rounded-lg hover:bg-slate-100 transition"
                            title="Preview Post"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        )}

                        {post.isDeleted ? (
                          <button
                            onClick={() => handleRestore(post._id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition"
                            title="Restore Post"
                          >
                            <RotateCcw className="h-3.5 w-3.5" /> Restore
                          </button>
                        ) : (
                          <Link
                            to={`/edit-post/${post._id}`}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
                          >
                            Edit
                          </Link>
                        )}

                        <button
                          onClick={() => handlePermanentDelete(post._id)}
                          className="p-1.5 text-slate-600 hover:text-red-700 rounded-lg hover:bg-red-50 transition"
                          title="Purge Permanently"
                        >
                          <Trash2 className="h-4 w-4" />
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
