import React, { useState, useEffect } from 'react';
import { Key, Lock, CheckCircle, ExternalLink } from 'lucide-react';

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
              <Key size={24} className="text-white" />
            </div>
            <h2 className="text-xl font-bold">Setup Gemini API</h2>
          </div>
          <p className="text-blue-100 text-sm">
            This tool runs entirely in your browser. Your API key is stored locally and never sent to our servers.
          </p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter your Google Gemini API Key
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={16} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="AIzaSy..."
                  autoFocus
                />
              </div>
              {error && <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>}
            </div>

            <div className="flex gap-3">
              {hasExistingKey && (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all transform active:scale-95"
              >
                Save API Key
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Don't have a key?
            </h4>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:border-blue-200">
                  <img src="https://www.gstatic.com/lamda/images/gemini_favicon_f069958c85030456e93de685481c559f160ea06b.png" alt="Gemini" className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Get free API Key</span>
              </div>
              <ExternalLink size={16} className="text-gray-400 group-hover:text-blue-500" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};