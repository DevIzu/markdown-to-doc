import React from 'react';
import { Github, Twitter, Heart, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white border-t border-slate-200 py-10 mt-auto relative overflow-hidden">
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
      
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col md:flex-row items-center gap-6 text-sm text-slate-500">
          <span className="font-medium text-slate-700">© {new Date().getFullYear()} MD Converter</span>
          <div className="hidden md:block w-1 h-1 rounded-full bg-slate-300"></div>
          <div className="flex items-center gap-1.5">
            <span>Powered by</span>
            <span className="flex items-center gap-1 font-semibold text-blue-600">
              <Sparkles size={12} /> Gemini 2.5 Flash
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <a href="#" className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
            <Github size={20} />
          </a>
          <a href="#" className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-50 rounded-lg transition-all">
            <Twitter size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
};