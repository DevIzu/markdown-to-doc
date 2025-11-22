import React, { useCallback, useState } from 'react';
import { UploadCloud, FileText, Sparkles } from 'lucide-react';

interface DropzoneProps {
  onFilesAdded: (files: File[]) => void;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFilesAdded }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      
      const droppedFiles = Array.from<File>(e.dataTransfer.files).filter(
        (file) => file.name.endsWith('.md') || file.name.endsWith('.txt') || file.name.endsWith('.markdown')
      );
      
      if (droppedFiles.length > 0) {
        onFilesAdded(droppedFiles);
      } else {
        alert("Please drop Markdown (.md) files only.");
      }
    },
    [onFilesAdded]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const selectedFiles = Array.from<File>(e.target.files).filter(
           (file) => file.name.endsWith('.md') || file.name.endsWith('.txt') || file.name.endsWith('.markdown')
        );
         if (selectedFiles.length > 0) {
            onFilesAdded(selectedFiles);
         }
      }
    },
    [onFilesAdded]
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer
        flex flex-col items-center justify-center h-64 group overflow-hidden
        ${isDragging 
          ? 'border-blue-500 bg-blue-50/50 scale-[1.02]' 
          : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50 hover:shadow-md'}
      `}
    >
      <input
        type="file"
        multiple
        accept=".md,.txt,.markdown"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      
      {/* Background decorative icon */}
      <UploadCloud 
        className={`absolute opacity-5 transition-transform duration-700 ${isDragging ? 'scale-150 rotate-12' : 'scale-100'}`} 
        size={200} 
      />

      <div className={`
        bg-blue-50 p-4 rounded-2xl mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3
        ${isDragging ? 'bg-blue-100' : ''}
      `}>
        <UploadCloud className="w-10 h-10 text-blue-600" />
      </div>
      
      <h3 className="text-xl font-bold text-slate-700 mb-2 group-hover:text-blue-700 transition-colors">
        Drop files here
      </h3>
      <p className="text-slate-500 mb-6 max-w-xs mx-auto leading-relaxed">
        Drag & drop markdown files or click to browse from your computer
      </p>
      
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
        <FileText size={14} />
        <span>Supports .md, .markdown, .txt</span>
      </div>
    </div>
  );
};