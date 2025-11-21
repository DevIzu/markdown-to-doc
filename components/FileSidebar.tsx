import React, { useRef, useState } from 'react';
import { DocFile, ProcessingStatus } from '../types';
import { FileText, CheckCircle, Loader2, AlertCircle, Clock, Plus, Trash2, Clipboard, Upload as UploadIcon, Play } from 'lucide-react';

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
        return <CheckCircle size={16} className="text-green-500" />;
      case ProcessingStatus.PROCESSING:
        return <Loader2 size={16} className="text-blue-500 animate-spin" />;
      case ProcessingStatus.ERROR:
        return <AlertCircle size={16} className="text-red-500" />;
      case ProcessingStatus.PENDING:
        return <Clock size={16} className="text-amber-500" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />;
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
    setActiveTab('upload'); // Switch back to list view to see progress
  };

  const pendingCount = files.filter(f => f.status === ProcessingStatus.IDLE || f.status === ProcessingStatus.PENDING).length;

  return (
    <div className="w-96 bg-white border-r border-gray-200 flex flex-col h-full z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      {/* Header / Tabs */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'upload' 
                ? 'border-blue-600 text-blue-700 bg-white' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <UploadIcon size={16} />
            Upload Files
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'paste' 
                ? 'border-blue-600 text-blue-700 bg-white' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Clipboard size={16} />
            Paste Text
          </button>
        </div>
      </div>

      {activeTab === 'upload' ? (
        <>
          {/* File List Actions */}
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Queue ({files.length})
            </span>
            <div className="flex gap-1">
              {files.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-md text-gray-400 transition-colors"
                  title="Clear all files"
                >
                  <Trash2 size={18} />
                </button>
              )}
              {onFilesAdded && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded-md text-gray-600 transition-colors"
                  title="Add more files"
                >
                    <Plus size={18} />
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
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {files.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 text-gray-400">
                  <UploadIcon size={24} />
                </div>
                <p className="text-gray-500 text-sm font-medium">No files pending</p>
                <p className="text-gray-400 text-xs mt-1">Drag files or paste text</p>
              </div>
            ) : (
              files.map((file) => (
                <button
                  key={file.id}
                  onClick={() => onSelectFile(file.id)}
                  className={`
                    w-full text-left px-3 py-3 rounded-lg flex items-center gap-3 transition-all group
                    ${selectedFileId === file.id ? 'bg-blue-50 ring-1 ring-blue-200 shadow-sm' : 'hover:bg-gray-50 border border-transparent hover:border-gray-100'}
                  `}
                >
                  <div className={`flex-shrink-0 ${selectedFileId === file.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`}>
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium truncate ${selectedFileId === file.id ? 'text-blue-700' : 'text-gray-700'}`}>
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {file.status === ProcessingStatus.ERROR ? 'Failed' : 
                      file.status === ProcessingStatus.COMPLETED ? 'Ready for download' : 
                      file.status === ProcessingStatus.PROCESSING ? 'Converting...' :
                      'Waiting in queue'}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusIcon(file.status)}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Process Button */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onProcessAll}
              disabled={isProcessing || pendingCount === 0}
              className={`
                w-full py-3 px-4 rounded-lg font-medium text-sm shadow-sm flex items-center justify-center gap-2 transition-all
                ${isProcessing || pendingCount === 0 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md shadow-blue-200'}
              `}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Play size={16} fill="currentColor" />
                  Convert Pending ({pendingCount})
                </>
              )}
            </button>
          </div>
        </>
      ) : (
        /* Paste Mode */
        <div className="flex-1 flex flex-col h-full p-4 bg-gray-50">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
            Paste Markdown Content
          </label>
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="# Paste your markdown here&#10;&#10;- Lists&#10;- Tables&#10;- Code blocks"
            className="flex-1 w-full p-4 rounded-xl border-gray-200 border focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none text-sm font-mono text-gray-700 bg-white shadow-sm mb-4"
            spellCheck={false}
          />
          <button
            onClick={handlePasteSubmit}
            disabled={!pastedText.trim() || isProcessing}
            className={`
              w-full py-3 px-4 rounded-lg font-medium text-sm shadow-sm flex items-center justify-center gap-2 transition-all
              ${!pastedText.trim() || isProcessing
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md shadow-blue-200'}
            `}
          >
            <Play size={16} fill="currentColor" />
            Convert Pasted Text
          </button>
        </div>
      )}
    </div>
  );
};
