import React, { useState, useCallback, useEffect } from 'react';
import { DocFile, ProcessingStatus } from './types';
import { FileSidebar } from './components/FileSidebar';
import { PreviewPane } from './components/PreviewPane';
import { Dropzone } from './components/Dropzone';
import { convertMarkdownToHtml } from './services/geminiService';
import { Sparkles, Settings } from 'lucide-react';
import { ConfirmationModal } from './components/ConfirmationModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';

// Simple ID generator
const generateId = () => Math.random().toString(36).substring(2, 9);

const App: React.FC = () => {
  const [files, setFiles] = useState<DocFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [showKeyModal, setShowKeyModal] = useState(false);

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

  // --- API Key Logic ---

  useEffect(() => {
    // 1. Check Local Storage immediately
    const storedKey = localStorage.getItem('GEMINI_API_KEY');
    if (storedKey) {
      setApiKey(storedKey);
    } else {
      // 2. If no key, set timeout to show modal after 3 seconds
      const timer = setTimeout(() => {
        setShowKeyModal(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    localStorage.setItem('GEMINI_API_KEY', key);
    setApiKey(key);
    setShowKeyModal(false);
  };

  // --- Processing Logic ---

  const processFiles = async (fileList: DocFile[]) => {
    if (!apiKey) {
      setShowKeyModal(true);
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
        const html = await convertMarkdownToHtml(file.originalContent, apiKey);
        
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
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 via-gray-50 to-white font-sans flex flex-col">
      {/* API Key Modal */}
      <ApiKeyModal 
        isOpen={showKeyModal}
        onSave={handleSaveApiKey}
        onClose={() => setShowKeyModal(false)}
        hasExistingKey={!!apiKey}
      />

      {/* Confirmation Modal */}
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
      <header className="w-full bg-white border-b border-gray-200/80 sticky top-0 z-30 backdrop-blur-md bg-white/80">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white p-1.5 rounded-lg shadow-lg shadow-blue-200">
              <Sparkles size={20} />
            </div>
            <h1 className="text-lg font-bold text-gray-800 tracking-tight">Markdown Converter</h1>
          </div>
          <button 
            onClick={() => setShowKeyModal(true)}
            className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Settings size={16} />
            API Settings
          </button>
        </div>
      </header>

      {/* Main Working Area */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-6">
        <div className="flex w-full h-[800px] shadow-2xl shadow-gray-200/50 bg-white rounded-2xl overflow-hidden border border-gray-200/60">
          
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
          <div className="flex-1 flex flex-col h-full relative bg-gray-50/50">
            {files.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="text-center max-w-xl animate-in fade-in zoom-in duration-500">
                  <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                    Convert Markdown to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Google Docs</span>
                  </h2>
                  <p className="text-gray-500 text-lg mb-10 leading-relaxed">
                    Preserve your tables, clean up formatting, and get ready-to-paste HTML or DOCX files in seconds.
                  </p>
                  <div className="bg-white p-1.5 rounded-2xl shadow-xl border border-gray-100 transform transition-transform hover:scale-[1.01] duration-300">
                     <Dropzone onFilesAdded={handleFilesAdded} />
                  </div>
                  <div className="mt-8 flex items-center justify-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1.5"><Sparkles size={14} className="text-yellow-500" /> AI Powered</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span>Secure & Private</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span>Fast Processing</span>
                  </div>
                </div>
              </div>
            ) : (
              <PreviewPane file={selectedFile} />
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <FAQSection />
        </div>
      </main>

      {/* Footer */}
      <Footer />
      
      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/30 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-100/30 blur-[100px]"></div>
      </div>
    </div>
  );
};

export default App;