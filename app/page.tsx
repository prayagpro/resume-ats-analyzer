'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiUpload, FiFile, FiCheck, FiAlertCircle, FiInfo } from 'react-icons/fi';

// Maximum file size in bytes (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file size
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError(`File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
        setFile(null);
        return;
      }
      
      const fileType = selectedFile.type;
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      
      if (!allowedTypes.includes(fileType)) {
        setError('Please upload a PDF or Word document.');
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      
      // Check file size
      if (droppedFile.size > MAX_FILE_SIZE) {
        setError(`File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
        setFile(null);
        return;
      }
      
      const fileType = droppedFile.type;
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      
      if (!allowedTypes.includes(fileType)) {
        setError('Please upload a PDF or Word document.');
        setFile(null);
        return;
      }
      
      setFile(droppedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze resume');
      }

      // Store the analysis result in localStorage
      localStorage.setItem('resumeAnalysis', JSON.stringify(data));
      
      // Redirect to results page
      router.push('/results');
    } catch (error) {
      console.error('Error analyzing resume:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Format file size for display
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Resume ATS Analyzer
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get instant feedback on your resume's ATS compatibility and improve your chances of landing interviews
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm bg-opacity-90">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div
              className={`border-2 border-dashed rounded-xl p-8 transition-all duration-200 ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="text-center">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="resume-upload"
                />
                <label
                  htmlFor="resume-upload"
                  className="cursor-pointer inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  {file ? (
                    <>
                      <FiCheck className="mr-2" />
                      {file.name}
                    </>
                  ) : (
                    <>
                      <FiUpload className="mr-2" />
                      Choose Resume File
                    </>
                  )}
                </label>
                <p className="mt-4 text-sm text-gray-500 flex items-center justify-center">
                  <FiFile className="mr-2" />
                  Supported formats: PDF, DOC, DOCX
                </p>
                <p className="mt-2 text-sm text-gray-400">
                  or drag and drop your file here
                </p>
                <div className="mt-4 text-xs text-gray-400 flex items-center justify-center">
                  <FiInfo className="mr-1" />
                  <span>Maximum file size: {formatFileSize(MAX_FILE_SIZE)}</span>
                </div>
                {file && (
                  <div className="mt-2 text-xs text-gray-500">
                    File size: {formatFileSize(file.size)}
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center text-red-700">
                  <FiAlertCircle className="mr-2" />
                  <p>{error}</p>
                </div>
                {error.includes('Virtual environment Python not found') && (
                  <div className="mt-2 text-sm text-red-600">
                    <p>Please run the following commands in your terminal:</p>
                    <pre className="mt-1 p-2 bg-red-100 rounded">
                      python3 -m venv venv
                      source venv/bin/activate
                      pip install -r requirements.txt
                    </pre>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={!file || loading}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-base font-medium text-white transition-all duration-200 ${
                !file || loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </>
              ) : (
                'Check ATS Score'
              )}
            </button>
          </form>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Analysis</h3>
            <p className="text-gray-600">Get immediate feedback on your resume's ATS compatibility</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Detailed Insights</h3>
            <p className="text-gray-600">Receive comprehensive analysis of your resume's strengths and areas for improvement</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Improvement Tips</h3>
            <p className="text-gray-600">Get actionable recommendations to enhance your resume's effectiveness</p>
          </div>
        </div>
      </div>
    </main>
  );
} 