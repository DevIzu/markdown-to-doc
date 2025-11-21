import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Is my data private?",
    answer: "Yes, absolutely. This tool runs entirely on your browser (Client-side). Your files are not uploaded to any server other than Google's Gemini API for the actual processing. We do not store your documents."
  },
  {
    question: "Why do I need an API Key?",
    answer: "To keep this tool free and unlimited for everyone, we utilize your own free tier of the Google Gemini API. This prevents rate-limiting issues and ensures the tool is always available."
  },
  {
    question: "Why does the DOCX file look empty in preview but works in Word?",
    answer: "We use a special XML structure to ensure Google Docs compatibility. Some simple previewers might not render it, but Microsoft Word, LibreOffice, and Google Drive will display it perfectly with tables intact."
  },
  {
    question: "How do I get the tables into Google Docs?",
    answer: "You can either click 'Copy for GDocs' and paste directly, or download the .docx file and upload it to Google Drive. If you upload the file, open it with Google Docs to continue editing."
  }
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="w-full max-w-4xl mx-auto py-16 px-6">
      <div className="flex items-center justify-center gap-2 mb-8">
        <HelpCircle className="text-blue-500" />
        <h2 className="text-2xl font-bold text-gray-800">Frequently Asked Questions</h2>
      </div>
      
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
            >
              <span className="font-medium text-gray-800">{faq.question}</span>
              <ChevronDown 
                size={20} 
                className={`text-gray-400 transition-transform duration-200 ${openIndex === index ? 'rotate-180' : ''}`}
              />
            </button>
            <div 
              className={`
                overflow-hidden transition-all duration-300 ease-in-out
                ${openIndex === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}
              `}
            >
              <p className="p-5 pt-0 text-gray-600 text-sm leading-relaxed border-t border-gray-50">
                {faq.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};