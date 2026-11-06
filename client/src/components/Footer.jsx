import React from 'react';
import { BookOpen } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-500">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-emerald-600" />
          <span className="font-bold text-slate-800">Antigravity MERN Blog System</span>
        </div>
        <p className="text-xs text-slate-600">
          Built with React 18, Vite, Tailwind CSS, Node.js, Express, and MongoDB.
        </p>
      </div>
    </footer>
  );
};
