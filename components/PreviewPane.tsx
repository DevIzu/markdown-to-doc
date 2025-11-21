import React, { useState } from 'react';
import { DocFile, ProcessingStatus } from '../types';
import { Copy, Check, ExternalLink, AlertTriangle, Loader2, Download } from 'lucide-react';
import { asBlob } from 'html-docx-js-typescript';
import { saveAs } from 'file-saver';

interface PreviewPaneProps {
  file: DocFile | null;
}

export const PreviewPane: React.FC<PreviewPaneProps> = ({ file }) => {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!file) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400 p-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <ExternalLink size={32} className="opacity-50" />
        </div>
        <p>Select a file to preview conversion</p>
      </div>
    );
  }

  const handleCopyToClipboard = async () => {
    if (!file.convertedHtml) return;

    try {
      const blob = new Blob([file.convertedHtml], { type: 'text/html' });
      const textBlob = new Blob([file.convertedHtml], { type: 'text/plain' });
      
      const data = [new ClipboardItem({ 
        "text/html": blob,
        "text/plain": textBlob 
      })];
      
      await navigator.clipboard.write(data);
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
      alert("Failed to copy to clipboard. Please try again or check permissions.");
    }
  };

  const handleDownloadDocx = async () => {
    if (!file.convertedHtml) return;
    
    setIsDownloading(true);
    try {
      // IMPORTANT: We explicitly structure the HTML with MS Office namespaces.
      // This is crucial for Google Drive and Word to interpret the styles correctly.
      const htmlContent = `
        <!DOCTYPE html>
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta charset="utf-8">
            <title>${file.name}</title>
            <style>
               /* Global Resets */
               body { font-family: Arial, sans-serif; line-height: 1.5; }
               
               /* Table Enforcement */
               table { border-collapse: collapse; width: 100%; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
               th, td { border: 1px solid black !important; padding: 8px; }
               
               /* Heading Reset - Double enforcement along with inline styles */
               h1, h2, h3, h4, h5, h6 { 
                 font-weight: normal !important; 
                 mso-ansi-font-weight: normal !important;
                 b { font-weight: normal !important; } 
                 strong { font-weight: normal !important; }
               }

               /* Horizontal Line Removal */
               hr { display: none !important; height: 0 !important; border: 0 !important; visibility: hidden !important; }
            </style>
        </head>
        <body>
            ${file.convertedHtml}
        </body>
        </html>
      `;

      // Convert to Blob
      const buffer = await asBlob(htmlContent);
      
      const fileName = file.name.replace(/\.[^/.]+$/, "") + ".docx";
      saveAs(buffer as Blob, fileName);
      
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to generate DOCX file.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 flex items-center justify-between bg-white z-10">
        <div>
          <h2 className="text-xl font-bold text-gray-800 truncate max-w-md" title={file.name}>
            {file.name}
          </h2>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            file.status === ProcessingStatus.COMPLETED ? 'bg-green-100 text-green-700' :
            file.status === ProcessingStatus.ERROR ? 'bg-red-100 text-red-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {file.status}
          </span>
        </div>
        
        {file.status === ProcessingStatus.COMPLETED && (
          <div className="flex gap-2">
            <button
              onClick={handleDownloadDocx}
              disabled={isDownloading}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border border-gray-300
                hover:bg-gray-50 text-gray-700 shadow-sm
                ${isDownloading ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              Download DOCX
            </button>

            <button
              onClick={handleCopyToClipboard}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${copied 
                  ? 'bg-green-600 text-white shadow-green-200 shadow-lg transform scale-105' 
                  : 'bg-gray-900 text-white hover:bg-gray-800 shadow-gray-300 shadow-md'}
              `}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy for GDocs'}
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto bg-white shadow-sm border border-gray-200 min-h-[calc(100%-2rem)] p-10 rounded-xl">
          {file.status === ProcessingStatus.COMPLETED && file.convertedHtml ? (
             <div 
                className="prose max-w-none prose-p:text-gray-700 prose-td:border prose-td:border-gray-300 prose-th:bg-gray-50 prose-th:border prose-th:border-gray-300"
                // Inline styles for display within the app to match the output
                style={{
                  '--tw-prose-headings': 'font-weight: normal',
                  '--tw-prose-hr': 'display: none',
                } as React.CSSProperties}
                dangerouslySetInnerHTML={{ __html: file.convertedHtml }} 
             />
          ) : file.status === ProcessingStatus.ERROR ? (
            <div className="flex flex-col items-center justify-center h-64 text-red-500 text-center">
              <AlertTriangle size={48} className="mb-4 opacity-80" />
              <h3 className="text-lg font-semibold">Conversion Failed</h3>
              <p className="text-sm mt-2 max-w-md text-gray-600">{file.errorMessage || "An unknown error occurred."}</p>
            </div>
          ) : file.status === ProcessingStatus.PROCESSING ? (
            <div className="flex flex-col items-center justify-center h-64 text-blue-600">
              <Loader2 size={48} className="animate-spin mb-4 opacity-80" />
              <h3 className="text-lg font-medium">Converting Document...</h3>
              <p className="text-sm text-gray-400 mt-2">Analyzing structure and formatting tables</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <div className="prose max-w-none opacity-50">
                <h1 className="text-gray-300 font-normal">Original Markdown Preview</h1>
                <pre className="bg-gray-50 p-4 rounded text-xs overflow-auto max-h-64 text-left">
                  {file.originalContent.slice(0, 500)}
                  {file.originalContent.length > 500 && '...'}
                </pre>
              </div>
              <p className="mt-8 text-sm font-medium text-gray-500">Ready to convert. Click "Convert Pending" in the sidebar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};