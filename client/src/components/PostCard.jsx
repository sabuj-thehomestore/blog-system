import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, Tag } from 'lucide-react';

export const PostCard = ({ post }) => {
  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <article className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col overflow-hidden">
      {post.coverImage && (
        <div className="h-48 overflow-hidden bg-slate-100">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="p-6 flex flex-col flex-grow">
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full"
              >
                <Tag className="h-2.5 w-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}

        <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition line-clamp-2 mb-2">
          <Link to={`/post/${post.slug}`}>{post.title}</Link>
        </h3>

        <p className="text-sm text-slate-600 line-clamp-3 mb-6 flex-grow">
          {post.excerpt || post.content.substring(0, 150) + '...'}
        </p>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            {post.author?.avatar ? (
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="h-6 w-6 rounded-full object-cover"
              />
            ) : (
              <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                <User className="h-3.5 w-3.5" />
              </div>
            )}
            <span className="font-medium text-slate-700">{post.author?.name || 'Anonymous'}</span>
          </div>

          <div className="flex items-center gap-1 text-slate-600">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formattedDate}</span>
          </div>
        </div>

        <div className="mt-4 pt-2">
          <Link
            to={`/post/${post.slug}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 group-hover:translate-x-1 transition"
          >
            Read Article <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
};
