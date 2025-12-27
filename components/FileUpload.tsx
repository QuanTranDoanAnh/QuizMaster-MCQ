import React, { useRef, useState } from 'react';
import { parseMarkdown } from '../utils';
import { Question } from '../types';

interface FileUploadProps {
  onUpload: (questions: Question[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    try {
      const text = await file.text();
      const questions = parseMarkdown(text);
      
      if (questions.length === 0) {
        setError("No valid questions found in the file. Please check the format.");
        return;
      }
      
      onUpload(questions);
    } catch (err) {
      setError("Error reading file.");
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full text-center border border-gray-100">
        <div className="mb-6">
            <svg className="w-16 h-16 text-blue-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload Question Bank</h2>
        <p className="text-gray-500 mb-6">Import a Markdown (.md) file to start your quiz session.</p>
        
        <input
          type="file"
          accept=".md,.txt"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 inline-block w-full sm:w-auto"
        >
          Select File
        </label>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}

        <div className="mt-8 text-left text-xs text-gray-400 bg-gray-50 p-4 rounded-lg">
          <p className="font-semibold mb-1">Format Example:</p>
          <pre className="whitespace-pre-wrap font-mono">
{`**Question 1:** Question Text here...
a. Wrong answer
**b. Correct answer**
c. Wrong answer`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;