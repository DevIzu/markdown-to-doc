import React, { useState } from 'react';
import { DocFile, ProcessingStatus } from '../types';
import { Copy, Check, ExternalLink, AlertTriangle, Loader2, Download, FileText, ArrowRight, Sparkles } from 'lucide-react';
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
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 text-slate-400 p-8 h-full">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-6">
              <FileText size={40} className="text-blue-200" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">Select a file to preview</h3>
            <p className="text-slate-500 text-sm">Follow these simple steps to convert your docs</p>
          </div>

          <div className="space-y-4">
            {[
              { num: 1, text: "Upload Markdown files or paste text" },
              { num: 2, text: "Click 'Convert Pending' button" },
              { num: 3, text: "Download as DOCX or Copy HTML" }
            ].map((step, idx) => (
              <div key={idx} className="flex items-center p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm mr-4 flex-shrink-0">
                  {step.num}
                </div>
                <span className="text-slate-600 font-medium text-sm">{step.text}</span>
              </div>
            ))}
          </div>
        </div>
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
      const htmlContent = `
        <!DOCTYPE html>
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta charset="utf-8">
            <title>${file.name}</title>
            <style>
               body { font-family: Arial, sans-serif; line-height: 1.5; }
               table { border-collapse: collapse; width: 100%; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
               th, td { border: 1px solid black !important; padding: 8px; }
               h1, h2, h3, h4, h5, h6 { 
                 font-weight: normal !important; 
                 mso-ansi-font-weight: normal !important;
                 b { font-weight: normal !important; } 
                 strong { font-weight: normal !important; }
               }
               hr { display: none !important; height: 0 !important; border: 0 !important; visibility: hidden !important; }
            </style>
        </head>
        <body>
            ${file.convertedHtml}
        </body>
        </html>
      `;

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
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/30 relative">
      {/* Glass Header */}
      <div className="border-b border-slate-200/60 p-4 flex items-center justify-between glass sticky top-0 z-20">
        <div className="min-w-0 flex-1 mr-4">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-lg font-bold text-slate-800 truncate" title={file.name}>
              {file.name}
            </h2>
            <span className={`flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${
              file.status === ProcessingStatus.COMPLETED ? 'bg-emerald-100 text-emerald-700' :
              file.status === ProcessingStatus.ERROR ? 'bg-red-100 text-red-700' :
              'bg-amber-100 text-amber-700'
            }`}>
              {file.status}
            </span>
          </div>
          <p className="text-xs text-slate-400 truncate">ID: {file.id}</p>
        </div>
        
        {file.status === ProcessingStatus.COMPLETED && (
          <div className="flex gap-2">
            <button
              onClick={handleDownloadDocx}
              disabled={isDownloading}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all border border-slate-200
                hover:bg-white hover:border-slate-300 hover:shadow-sm text-slate-600 bg-white/50
                ${isDownloading ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              <span className="hidden sm:inline">Download DOCX</span>
            </button>

            <button
              onClick={handleCopyToClipboard}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm
                ${copied 
                  ? 'bg-emerald-500 text-white ring-2 ring-emerald-200' 
                  : 'bg-slate-800 text-white hover:bg-slate-900 hover:-translate-y-0.5 hover:shadow-md'}
              `}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy HTML'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto bg-white shadow-lg shadow-slate-200/50 border border-slate-100 min-h-[calc(100%-2rem)] p-8 md:p-12 rounded-xl relative">
          {file.status === ProcessingStatus.COMPLETED && file.convertedHtml ? (
             <div 
                className="prose max-w-none prose-headings:font-normal prose-p:text-slate-700 prose-td:border-slate-300 prose-th:bg-slate-50 prose-th:border-slate-300"
                style={{
                  '--tw-prose-headings': 'font-weight: normal',
                  '--tw-prose-hr': 'display: none',
                } as React.CSSProperties}
                dangerouslySetInnerHTML={{ __html: file.convertedHtml }} 
             />
          ) : file.status === ProcessingStatus.ERROR ? (
            <div className="flex flex-col items-center justify-center h-96 text-red-500 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Conversion Failed</h3>
              <p className="text-slate-500 mt-2 max-w-md">{file.errorMessage || "An unknown error occurred."}</p>
            </div>
          ) : file.status === ProcessingStatus.PROCESSING ? (
            <div className="flex flex-col items-center justify-center h-96 text-blue-600">
              <div className="relative mb-8">
                <div className="w-20 h-20 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles size={24} className="text-blue-500 animate-pulse" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800">Formatting Document...</h3>
              <p className="text-slate-400 mt-2">Analyzing structure, fixing tables, and cleaning styles.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 text-slate-400">
              <div className="prose max-w-none opacity-50 w-full blur-[1px] select-none pointer-events-none">
                <h1>Markdown Preview</h1>
                <p>This is a raw preview of your content before the AI formatting engine takes over.</p>
                <pre className="bg-slate-50 p-4 rounded-lg text-xs border border-slate-100">
                  {file.originalContent.slice(0, 300)}...
                </pre>
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center p-3 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-200 mb-4">
                    <ArrowRight size={24} />
                  </div>
                  <p className="font-medium text-slate-600">Ready to convert</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};