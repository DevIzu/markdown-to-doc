import React, { useState, useCallback } from 'react';
import { DocFile, ProcessingStatus } from './types';
import { FileSidebar } from './components/FileSidebar';
import { PreviewPane } from './components/PreviewPane';
import { Dropzone } from './components/Dropzone';
import { convertMarkdownToHtml } from './services/geminiService';
import { Sparkles, Wand2 } from 'lucide-react';
import { ConfirmationModal } from './components/ConfirmationModal';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';
import { ApiKeyModal } from './components/ApiKeyModal';
import { convertMarkdownToHtml as convertService } from './services/geminiService';

// Simple ID generator
const generateId = () => Math.random().toString(36).substring(2, 9);

const App: React.FC = () => {
  const [files, setFiles] = useState<DocFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  // Modal States
  const [confirmationState, setConfirmationState] = useState<{
    isOpen: boolean;
    type: 'upload' | 'clear' | 'paste';
    pendingFiles?: File[];
    pendingText?: string;
  }>({
    isOpen: false,
    type: 'clear'
  });

  // Check for API key on mount and show modal after 3s if missing
  React.useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
      setApiKey(storedKey);
    } else {
      const timer = setTimeout(() => {
        setShowApiKeyModal(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    localStorage.setItem('gemini_api_key', key);
    setApiKey(key);
    setShowApiKeyModal(false);
  };

  // --- Processing Logic ---

  const processFiles = async (fileList: DocFile[]) => {
    if (!apiKey) {
      setShowApiKeyModal(true);
      return;
    }

    setIsProcessing(true);
    
    const currentFiles = fileList.length > 0 ? fileList : files;
    const filesToProcess = currentFiles.filter(
      f => f.status === ProcessingStatus.IDLE || f.status === ProcessingStatus.PENDING || f.status === ProcessingStatus.ERROR
    );

    // Update UI to show processing
    setFiles(prev => prev.map(f => 
      filesToProcess.find(p => p.id === f.id) 
        ? { ...f, status: ProcessingStatus.PROCESSING } 
        : f
    ));

    for (const file of filesToProcess) {
      try {
        const html = await convertService(file.originalContent, apiKey);
        
        setFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { ...f, convertedHtml: html, status: ProcessingStatus.COMPLETED } 
            : f
        ));
      } catch (error) {
        setFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { ...f, status: ProcessingStatus.ERROR, errorMessage: (error as Error).message } 
            : f
        ));
      }
    }

    setIsProcessing(false);
  };

  // --- Handlers ---

  const handleFilesAdded = useCallback((uploadedFiles: File[]) => {
    if (files.length > 0) {
      setConfirmationState({
        isOpen: true,
        type: 'upload',
        pendingFiles: uploadedFiles
      });
    } else {
      addFiles(uploadedFiles);
    }
  }, [files.length]);

  const handlePasteConvert = useCallback((text: string) => {
    if (files.length > 0) {
      setConfirmationState({
        isOpen: true,
        type: 'paste',
        pendingText: text
      });
    } else {
      processPastedText(text);
    }
  }, [files.length]);

  const handleClearAllRequest = () => {
    if (files.length === 0) return;
    setConfirmationState({
      isOpen: true,
      type: 'clear'
    });
  };

  // --- Action Executors ---

  const addFiles = async (uploadedFiles: File[]) => {
    const newFilesPromises = uploadedFiles.map(async (file) => {
      const text = await file.text();
      return {
        id: generateId(),
        name: file.name,
        originalContent: text,
        convertedHtml: null,
        status: ProcessingStatus.IDLE,
      } as DocFile;
    });

    const newDocFiles = await Promise.all(newFilesPromises);
    
    setFiles(newDocFiles);
    if (newDocFiles.length > 0) {
      setSelectedFileId(newDocFiles[0].id);
    }
  };

  const processPastedText = (text: string) => {
    const newFile: DocFile = {
      id: generateId(),
      name: `Pasted Content ${new Date().toLocaleTimeString()}`,
      originalContent: text,
      convertedHtml: null,
      status: ProcessingStatus.IDLE
    };

    setFiles([newFile]);
    setSelectedFileId(newFile.id);
    setTimeout(() => processFiles([newFile]), 0);
  };

  const confirmAction = () => {
    const { type, pendingFiles, pendingText } = confirmationState;
    
    if (type === 'clear') {
      setFiles([]);
      setSelectedFileId(null);
    } else if (type === 'upload' && pendingFiles) {
      addFiles(pendingFiles);
    } else if (type === 'paste' && pendingText) {
      processPastedText(pendingText);
    }

    setConfirmationState({ isOpen: false, type: 'clear' });
  };

  // --- Render ---

  const selectedFile = files.find(f => f.id === selectedFileId) || null;

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] font-sans flex flex-col relative overflow-x-hidden">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-200/30 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-200/30 blur-[120px]"></div>
      </div>

      <ApiKeyModal 
        isOpen={showApiKeyModal}
        onSave={handleSaveApiKey}
        onClose={() => setShowApiKeyModal(false)}
        hasExistingKey={!!apiKey}
      />

      <ConfirmationModal
        isOpen={confirmationState.isOpen}
        title={confirmationState.type === 'clear' ? "Clear Queue?" : "Replace Existing Files?"}
        message={
          confirmationState.type === 'clear' 
            ? "Are you sure you want to clear all files? This action cannot be undone."
            : "Have you saved the converted files? They will be removed once you upload new. Are you sure you want to continue?"
        }
        onConfirm={confirmAction}
        onCancel={() => setConfirmationState({ isOpen: false, type: 'clear' })}
        confirmLabel={confirmationState.type === 'clear' ? "Clear All" : "Yes, Replace"}
      />

      {/* Header */}
      <header className="w-full sticky top-0 z-40 glass border-b border-slate-200/60">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-2 rounded-xl shadow-lg shadow-blue-500/20">
              <Wand2 size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 tracking-tight leading-none">MD to Doc</h1>
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">AI Converter</span>
            </div>
          </div>
          
          <button 
            onClick={() => setShowApiKeyModal(true)}
            className="text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full"
          >
            {apiKey ? 'API Key Configured' : 'Setup API Key'}
          </button>
        </div>
      </header>

      {/* Main Working Area */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 z-10 relative">
        {/* 
            Responsive Height Calculation:
            - h-[calc(100vh-9rem)]: Calculates height based on viewport minus header/padding.
            - min-h-[600px]: Prevents it from getting too small on mobile.
        */}
        <div className="flex flex-col md:flex-row w-full h-[calc(100vh-9rem)] min-h-[600px] bg-white rounded-2xl overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-200/60 ring-1 ring-slate-900/5">
          
          {/* Sidebar */}
          <FileSidebar 
            files={files}
            selectedFileId={selectedFileId}
            onSelectFile={setSelectedFileId}
            onProcessAll={() => processFiles(files)}
            isProcessing={isProcessing}
            onFilesAdded={handleFilesAdded}
            onClearAll={handleClearAllRequest}
            onPasteConvert={handlePasteConvert}
          />

          {/* Main Content */}
          <div className="flex-1 flex flex-col h-full relative bg-slate-50/50">
            {files.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 animate-fade-in">
                <div className="text-center max-w-xl">
                  <div className="inline-flex items-center justify-center p-2 bg-blue-50 rounded-full mb-6 ring-1 ring-blue-100">
                     <Sparkles size={16} className="text-blue-600 mr-2" />
                     <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">AI-Powered Formatting</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                    Markdown to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Google Docs</span>
                  </h2>
                  <p className="text-slate-500 text-lg mb-10 leading-relaxed">
                    Transform your raw markdown into perfectly formatted documents. Tables, headers, and lists—handled instantly.
                  </p>
                  
                  <div className="bg-white p-2 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 transform transition-all hover:scale-[1.01] duration-300">
                     <Dropzone onFilesAdded={handleFilesAdded} />
                  </div>
                  
                  <div className="mt-10 grid grid-cols-3 gap-8 text-center">
                    <div>
                      <div className="text-2xl font-bold text-slate-800 mb-1">100%</div>
                      <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Client Side</div>
                    </div>
                    <div>
                       <div className="text-2xl font-bold text-slate-800 mb-1">0s</div>
                       <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Wait Time</div>
                    </div>
                    <div>
                       <div className="text-2xl font-bold text-slate-800 mb-1">Free</div>
                       <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Unlimited</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <PreviewPane file={selectedFile} />
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 mb-12">
          <FAQSection />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default App;