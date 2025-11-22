import React, { useRef, useState } from 'react';
import { DocFile, ProcessingStatus } from '../types';
import { FileText, CheckCircle2, Loader2, AlertCircle, Clock, Plus, Trash2, ClipboardList, UploadCloud, Play, FileCode } from 'lucide-react';

interface FileSidebarProps {
  files: DocFile[];
  selectedFileId: string | null;
  onSelectFile: (id: string) => void;
  onProcessAll: () => void;
  isProcessing: boolean;
  onFilesAdded?: (files: File[]) => void;
  onClearAll: () => void;
  onPasteConvert: (text: string) => void;
}

export const FileSidebar: React.FC<FileSidebarProps> = ({
  files,
  selectedFileId,
  onSelectFile,
  onProcessAll,
  isProcessing,
  onFilesAdded,
  onClearAll,
  onPasteConvert
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [pastedText, setPastedText] = useState('');

  const getStatusIcon = (status: ProcessingStatus) => {
    switch (status) {
      case ProcessingStatus.COMPLETED:
        return <CheckCircle2 size={18} className="text-emerald-500" />;
      case ProcessingStatus.PROCESSING:
        return <Loader2 size={18} className="text-blue-500 animate-spin" />;
      case ProcessingStatus.ERROR:
        return <AlertCircle size={18} className="text-red-500" />;
      case ProcessingStatus.PENDING:
        return <Clock size={18} className="text-amber-500" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-slate-300" />;
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files && e.target.files.length > 0 && onFilesAdded) {
        const selectedFiles = Array.from<File>(e.target.files).filter(
           (file) => file.name.endsWith('.md') || file.name.endsWith('.txt') || file.name.endsWith('.markdown')
        );
         if (selectedFiles.length > 0) {
            onFilesAdded(selectedFiles);
         }
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePasteSubmit = () => {
    if (!pastedText.trim()) return;
    onPasteConvert(pastedText);
    setPastedText('');
    setActiveTab('upload');
  };

  const pendingCount = files.filter(f => f.status === ProcessingStatus.IDLE || f.status === ProcessingStatus.PENDING).length;

  return (
    <div className="w-full md:w-[400px] bg-white md:border-r border-slate-200 flex flex-col h-full z-20 relative">
      {/* Modern Tabs */}
      <div className="p-4 pb-2 flex-shrink-0">
        <div className="flex p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all duration-200 ${
              activeTab === 'upload' 
                ? 'bg-white text-blue-700 shadow-sm ring-1 ring-black/5' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <UploadCloud size={16} />
            Files
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all duration-200 ${
              activeTab === 'paste' 
                ? 'bg-white text-blue-700 shadow-sm ring-1 ring-black/5' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <ClipboardList size={16} />
            Paste
          </button>
        </div>
      </div>

      {activeTab === 'upload' ? (
        <>
          {/* List Header */}
          <div className="px-6 py-3 flex justify-between items-center flex-shrink-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Queue ({files.length})
            </span>
            <div className="flex gap-1">
              {files.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg text-slate-400 transition-colors group"
                  title="Clear all files"
                >
                  <Trash2 size={16} className="transition-transform group-hover:scale-110" />
                </button>
              )}
              {onFilesAdded && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-slate-600 transition-colors group"
                  title="Add more files"
                >
                    <Plus size={18} className="transition-transform group-hover:scale-110" />
                </button>
              )}
            </div>
            <input 
              type="file" 
              multiple 
              className="hidden" 
              ref={fileInputRef} 
              accept=".md,.txt,.markdown"
              onChange={handleFileInput}
            />
          </div>

          {/* File List */}
          <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-24">
            {files.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center p-6 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50 m-2">
                <div className="w-12 h-12 rounded-full bg-white shadow-sm ring-1 ring-slate-200 flex items-center justify-center mb-3 text-slate-400">
                  <FileCode size={24} />
                </div>
                <p className="text-slate-600 text-sm font-medium">No files in queue</p>
                <p className="text-slate-400 text-xs mt-1">Files you upload will appear here</p>
              </div>
            ) : (
              files.map((file) => (
                <button
                  key={file.id}
                  onClick={() => onSelectFile(file.id)}
                  className={`
                    w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all group border relative overflow-hidden
                    ${selectedFileId === file.id 
                      ? 'bg-blue-50/50 border-blue-200 shadow-sm ring-1 ring-blue-100' 
                      : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-md hover:-translate-y-0.5'}
                  `}
                >
                  {selectedFileId === file.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                  )}
                  <div className={`flex-shrink-0 p-2 rounded-lg ${selectedFileId === file.id ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400 group-hover:text-slate-500'}`}>
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold truncate ${selectedFileId === file.id ? 'text-slate-800' : 'text-slate-700'}`}>
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-400 truncate mt-0.5 flex items-center gap-1">
                       {file.status === ProcessingStatus.PROCESSING ? 'Converting...' : 
                        file.status === ProcessingStatus.COMPLETED ? 'Ready' : 'Waiting'}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusIcon(file.status)}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Primary Action Area - High Visibility */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 backdrop-blur-xl bg-white/90 z-10">
            <button
              onClick={onProcessAll}
              disabled={isProcessing || pendingCount === 0}
              className={`
                w-full py-4 px-6 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-3 transition-all transform duration-200
                ${isProcessing || pendingCount === 0 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-95 animate-pulse-soft'}
              `}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Processing Files...
                </>
              ) : (
                <>
                  <Play size={20} fill="currentColor" />
                  {pendingCount > 0 ? `Convert ${pendingCount} Pending Files` : 'Queue Empty'}
                </>
              )}
            </button>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col h-full p-6 bg-white">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">
            Paste Markdown Content
          </label>
          <div className="flex-1 relative mb-4 group">
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="# Paste your markdown here..."
              className="w-full h-full p-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none resize-none text-sm font-mono text-slate-700 bg-slate-50 transition-all"
              spellCheck={false}
            />
          </div>
          <button
            onClick={handlePasteSubmit}
            disabled={!pastedText.trim() || isProcessing}
            className={`
              w-full py-3.5 px-4 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all
              ${!pastedText.trim() || isProcessing
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:-translate-y-0.5'}
              `}
            >
            <Play size={18} fill="currentColor" />
            Convert Text
          </button>
        </div>
      )}
    </div>
  );
};