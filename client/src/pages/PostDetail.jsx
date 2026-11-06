import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  Calendar,
  User,
  ArrowLeft,
  Edit3,
  Trash2,
  MessageSquare,
  Send,
  AlertCircle
} from 'lucide-react';

export const PostDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { socket } = useSocket();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [error, setError] = useState('');

  const fetchPostAndComments = async () => {
    setLoading(true);
    try {
      const { data: postRes } = await api.get(`/posts/slug/${slug}`);
      setPost(postRes.data);

      const { data: commentsRes } = await api.get(`/comments/post/${postRes.data._id}`);
      setComments(commentsRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostAndComments();
  }, [slug]);

  // Listen for real-time comment additions
  useEffect(() => {
    if (!socket || !post?._id) return;

    const handleRealtimeComment = (data) => {
      if (data.post?.id === post._id) {
        setComments((prev) => [data.comment, ...prev]);
      }
    };

    socket.on('new_comment_notification', handleRealtimeComment);
    return () => socket.off('new_comment_notification', handleRealtimeComment);
  }, [socket, post?._id]);

  const handlePostDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post? (Soft delete)')) return;
    try {
      await api.delete(`/posts/${post._id}`);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete post');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const { data } = await api.post(`/comments/post/${post._id}`, {
        content: newComment.trim()
      });
      setComments((prev) => [...prev, data.data]);
      setNewComment('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleUpdateComment = async (commentId) => {
    if (!editingCommentContent.trim()) return;
    try {
      const { data } = await api.put(`/comments/${commentId}`, {
        content: editingCommentContent.trim()
      });
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? { ...c, content: data.data.content } : c))
      );
      setEditingCommentId(null);
      setEditingCommentContent('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete comment');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Article Not Found</h2>
        <p className="text-slate-600 mb-6">{error || 'This post may have been removed.'}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Return to Articles
        </Link>
      </div>
    );
  }

  const isAuthor = user && post.author && (user.id === post.author._id || user.id === post.author);
  const canManagePost = isAuthor || isAdmin;

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-600 transition mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to all articles
      </Link>

      <article className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-10 mb-10">
        {/* Cover image */}
        {post.coverImage && (
          <div className="rounded-2xl overflow-hidden mb-8 max-h-96">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
          {post.title}
        </h1>

        {/* Metadata row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100 mb-8">
          <div className="flex items-center gap-3">
            {post.author?.avatar ? (
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-500/20"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
            )}
            <div>
              <p className="text-sm font-bold text-slate-800">{post.author?.name || 'Author'}</p>
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Calendar className="h-3 w-3" />
                <span>Published on {formattedDate}</span>
              </div>
            </div>
          </div>

          {/* Action buttons for Author or Admin */}
          {canManagePost && (
            <div className="flex items-center gap-2">
              <Link
                to={`/edit-post/${post._id}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
              >
                <Edit3 className="h-3.5 w-3.5" /> Edit
              </Link>
              <button
                onClick={handlePostDelete}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          )}
        </div>

        {/* Article Body */}
        <div className="prose prose-slate max-w-none text-slate-700 text-base sm:text-lg leading-relaxed whitespace-pre-line">
          {post.content}
        </div>
      </article>

      {/* Comments Section */}
      <section className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-10">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="h-5 w-5 text-emerald-600" />
          <h2 className="text-2xl font-bold text-slate-900">
            Discussion ({comments.length})
          </h2>
        </div>

        {/* New comment input */}
        {isAuthenticated ? (
          <form onSubmit={handleAddComment} className="mb-8">
            <div className="relative">
              <textarea
                rows="3"
                placeholder="Share your thoughts on this article..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full p-4 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition resize-none"
              ></textarea>
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-sm transition"
                >
                  <Send className="h-3.5 w-3.5" />
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="p-4 mb-8 bg-slate-50 border border-slate-200 rounded-2xl text-center">
            <p className="text-sm text-slate-600 mb-2">
              Join the conversation by signing in.
            </p>
            <Link
              to="/login"
              className="inline-block text-xs font-bold text-emerald-600 hover:underline"
            >
              Sign In to Comment &rarr;
            </Link>
          </div>
        )}

        {/* Comments list */}
        {comments.length === 0 ? (
          <p className="text-center py-6 text-slate-600 text-sm">
            Be the first to share a thought on this post!
          </p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => {
              const commentAuthorId = comment.author?._id || comment.author;
              const isCommentAuthor = user && user.id === commentAuthorId;
              const canDeleteComment = isCommentAuthor || isAdmin;

              return (
                <div
                  key={comment._id}
                  className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {comment.author?.avatar ? (
                        <img
                          src={comment.author.avatar}
                          alt={comment.author.name}
                          className="h-7 w-7 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center">
                          {comment.author?.name?.[0] || 'U'}
                        </div>
                      )}
                      <div>
                        <span className="text-xs font-bold text-slate-800">
                          {comment.author?.name || 'User'}
                        </span>
                        <span className="text-[10px] text-slate-600 ml-2">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                      {isCommentAuthor && editingCommentId !== comment._id && (
                        <button
                          onClick={() => {
                            setEditingCommentId(comment._id);
                            setEditingCommentContent(comment.content);
                          }}
                          className="text-slate-600 hover:text-slate-700 p-1 text-xs"
                          title="Edit Comment"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {canDeleteComment && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="text-slate-600 hover:text-red-600 p-1 text-xs"
                          title="Delete Comment"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {editingCommentId === comment._id ? (
                    <div className="mt-2">
                      <textarea
                        rows="2"
                        value={editingCommentContent}
                        onChange={(e) => setEditingCommentContent(e.target.value)}
                        className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => handleUpdateComment(comment._id)}
                          className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingCommentId(null)}
                          className="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs hover:bg-slate-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-700 whitespace-pre-line pl-9">
                      {comment.content}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
