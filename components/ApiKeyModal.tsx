import React, { useState, useEffect } from 'react';
import { Key, Lock, ExternalLink, ShieldCheck } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onSave: (key: string) => void;
  onClose: () => void;
  hasExistingKey: boolean;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSave, onClose, hasExistingKey }) => {
  const [inputKey, setInputKey] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setInputKey('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputKey.trim().length < 20) {
      setError('Invalid API Key format. It should be a long string.');
      return;
    }
    onSave(inputKey.trim());
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-white/20 ring-1 ring-black/5">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/3 -translate-y-1/3">
            <Key size={140} />
          </div>
          <div className="flex items-center gap-3 mb-3 relative z-10">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
              <Key size={24} className="text-blue-200" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Gemini API Setup</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed relative z-10">
            Enter your API key to enable the AI formatting engine. Your key is stored locally in your browser.
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Google API Key
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="password"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-slate-800 placeholder:text-slate-400 font-mono text-sm"
                  placeholder="AIzaSy..."
                  autoFocus
                />
              </div>
              {error && <p className="text-red-500 text-xs mt-2 font-medium flex items-center gap-1"><span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>{error}</p>}
            </div>

            <div className="flex gap-3">
              {hasExistingKey && (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <ShieldCheck size={18} />
                Save Key
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-xl bg-blue-50/50 hover:bg-blue-50 border border-blue-100 hover:border-blue-200 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white border border-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-lg">G</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700 group-hover:text-blue-700">Get free API Key</p>
                  <p className="text-xs text-slate-500">Google AI Studio</p>
                </div>
              </div>
              <ExternalLink size={16} className="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};