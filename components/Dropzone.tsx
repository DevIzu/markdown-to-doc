import React, { useCallback, useState } from 'react';
import { Upload, FileText } from 'lucide-react';

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
        relative border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-200 cursor-pointer
        flex flex-col items-center justify-center h-64 bg-white
        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
      `}
    >
      <input
        type="file"
        multiple
        accept=".md,.txt,.markdown"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="bg-blue-100 p-4 rounded-full mb-4">
        <Upload className="w-8 h-8 text-blue-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-1">
        Drag & Drop Markdown Files
      </h3>
      <p className="text-sm text-gray-500">
        or click to browse (Bulk upload supported)
      </p>
      <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
        <FileText size={14} />
        <span>Supports .md, .markdown, .txt</span>
      </div>
    </div>
  );
};