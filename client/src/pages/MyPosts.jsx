import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { PenSquare, Edit, Trash2, ExternalLink, Plus, BookOpen } from 'lucide-react';

export const MyPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyPosts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/posts/user/my-posts');
      setPosts(data.data || []);
    } catch (err) {
      console.error('Failed to load my posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete post');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Articles</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your published stories and contributions
          </p>
        </div>
        <Link
          to="/create-post"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-500/20 transition self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> New Article
        </Link>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center">
          <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">No articles yet</h3>
          <p className="text-sm text-slate-500 mb-6">
            You haven't written any posts yet. Start sharing your ideas!
          </p>
          <Link
            to="/create-post"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-semibold text-sm rounded-xl hover:bg-emerald-700 transition"
          >
            <PenSquare className="h-4 w-4" /> Write First Article
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-6">Title</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Published Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {posts.map((post) => (
                  <tr key={post._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-6 font-semibold text-slate-900 max-w-md">
                      <div className="truncate">{post.title}</div>
                      <div className="text-xs text-slate-600 font-mono truncate">
                        /post/{post.slug}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {post.isDeleted ? (
                        <span className="inline-flex items-center text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
                          Soft Deleted
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          Published
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          to={`/post/${post.slug}`}
                          className="p-1.5 text-slate-600 hover:text-emerald-600 rounded-lg hover:bg-slate-100 transition"
                          title="View"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        {!post.isDeleted && (
                          <>
                            <Link
                              to={`/edit-post/${post._id}`}
                              className="p-1.5 text-slate-600 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(post._id)}
                              className="p-1.5 text-slate-600 hover:text-red-600 rounded-lg hover:bg-slate-100 transition"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
