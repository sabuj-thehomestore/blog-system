import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { PostCard } from '../components/PostCard';
import { Pagination } from '../components/Pagination';
import { Search, Sparkles, Filter } from 'lucide-react';

export const Home = () => {
  const [posts, setPosts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [search, setSearch] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPosts = async (page = 1, searchQuery = '', tag = '') => {
    setLoading(true);
    try {
      const params = { page, limit: 6 };
      if (searchQuery) params.search = searchQuery;
      if (tag) params.tag = tag;

      const { data } = await api.get('/posts', { params });
      setPosts(data.data || []);
      if (data.meta) {
        setMeta(data.meta);
      }
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(meta.page, activeSearch, selectedTag);
  }, [meta.page, activeSearch, selectedTag]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveSearch(search);
    setMeta((prev) => ({ ...prev, page: 1 }));
  };

  const handleTagClick = (tag) => {
    if (selectedTag === tag) {
      setSelectedTag('');
    } else {
      setSelectedTag(tag);
    }
    setMeta((prev) => ({ ...prev, page: 1 }));
  };

  const popularTags = ['MERN', 'Node.js', 'React', 'MongoDB', 'Architecture', 'Security', 'CleanCode'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero Section */}
      <section className="text-center py-12 px-4 rounded-3xl bg-gradient-to-b from-emerald-50/70 to-teal-50/30 border border-emerald-100/60 mb-12 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles className="h-3.5 w-3.5" />
          MERN Clean Architecture & RBAC
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight max-w-3xl mx-auto leading-tight">
          Explore Insights, Code, & Architecture.
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
          A full-stack blog engine featuring JWT token rotation, role-based access control, soft deletes, and real-time alerts.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-8 max-w-xl mx-auto flex items-center gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600" />
            <input
              type="text"
              placeholder="Search articles by title or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-2xl shadow-sm transition"
          >
            Search
          </button>
        </form>

        {/* Tags Pills */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Filter by:
          </span>
          {popularTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium transition ${
                selectedTag === tag
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              #{tag}
            </button>
          ))}
          {selectedTag && (
            <button
              onClick={() => setSelectedTag('')}
              className="text-xs text-red-600 hover:underline font-semibold ml-2"
            >
              Clear filter
            </button>
          )}
        </div>
      </section>

      {/* Main Content Feed */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Latest Articles</h2>
          <p className="text-sm text-slate-500">
            {meta.totalItems} {meta.totalItems === 1 ? 'article' : 'articles'} found
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-slate-200 p-6 h-72 animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <p className="text-slate-500 text-base mb-4">No articles matched your criteria.</p>
          {(activeSearch || selectedTag) && (
            <button
              onClick={() => {
                setSearch('');
                setActiveSearch('');
                setSelectedTag('');
              }}
              className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>

          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            onPageChange={(p) => setMeta((prev) => ({ ...prev, page: p }))}
          />
        </>
      )}
    </div>
  );
};
