import React from 'react';
import { Github, Twitter, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white border-t border-gray-200 py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-sm text-gray-500">
          © {new Date().getFullYear()} Markdown Converter. All rights reserved.
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <span>Built with</span>
            <Heart size={14} className="text-red-500 fill-red-500" />
            <span>using Gemini 2.5 Flash</span>
          </div>
          
          <div className="flex gap-4">
            <a href="#" className="text-gray-400 hover:text-gray-900 transition-colors">
              <Github size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
              <Twitter size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};