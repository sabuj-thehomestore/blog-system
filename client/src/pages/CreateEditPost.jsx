import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { PenSquare, Sparkles, Image, Tag, AlertCircle } from 'lucide-react';

export const CreateEditPost = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    tags: '',
    coverImage: ''
  });
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) {
      const fetchPost = async () => {
        try {
          const { data } = await api.get(`/posts/${id}`);
          const post = data.data;
          setFormData({
            title: post.title,
            content: post.content,
            excerpt: post.excerpt || '',
            tags: post.tags?.join(', ') || '',
            coverImage: post.coverImage || ''
          });
        } catch (err) {
          setError('Failed to load post for editing');
        } finally {
          setLoading(false);
        }
      };
      fetchPost();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const payload = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      excerpt: formData.excerpt.trim(),
      tags: formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      coverImage: formData.coverImage.trim()
    };

    try {
      if (isEditing) {
        const { data } = await api.put(`/posts/${id}`, payload);
        navigate(`/post/${data.data.slug}`);
      } else {
        const { data } = await api.post('/posts', payload);
        navigate(`/post/${data.data.slug}`);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (err.response?.data?.errors?.[0]?.message) ||
          'Failed to save post'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-10">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-100 mb-8">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <PenSquare className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              {isEditing ? 'Edit Article' : 'Write a New Article'}
            </h1>
            <p className="text-xs text-slate-500">
              Share knowledge with the community with clean markdown or rich text
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-700 font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Article Title *
            </label>
            <input
              type="text"
              name="title"
              required
              minLength={3}
              maxLength={200}
              placeholder="e.g. Exploring Modern Web Development with MERN Stack"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 text-lg font-bold bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Cover Image URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Image className="h-3.5 w-3.5 text-slate-600" /> Cover Image URL (Optional)
            </label>
            <input
              type="url"
              name="coverImage"
              placeholder="https://images.unsplash.com/photo-..."
              value={formData.coverImage}
              onChange={handleChange}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-slate-600" /> Tags (Comma separated)
            </label>
            <input
              type="text"
              name="tags"
              placeholder="React, Architecture, Node.js, MERN"
              value={formData.tags}
              onChange={handleChange}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Short Summary / Excerpt (Optional)
            </label>
            <input
              type="text"
              name="excerpt"
              maxLength={300}
              placeholder="A brief one or two sentence teaser..."
              value={formData.excerpt}
              onChange={handleChange}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Content Body *
            </label>
            <textarea
              name="content"
              required
              minLength={10}
              rows="12"
              placeholder="Write your article body here..."
              value={formData.content}
              onChange={handleChange}
              className="w-full p-4 text-base bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-normal leading-relaxed"
            ></textarea>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-500/20 transition disabled:opacity-50"
            >
              {submitting ? 'Publishing...' : isEditing ? 'Update Post' : 'Publish Article'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
