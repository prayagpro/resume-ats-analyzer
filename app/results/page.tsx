'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface ResumeAnalysis {
  personal_info: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  work_experience: Array<{ description: string }>;
  education: Array<{ description: string }>;
  skills: string[];
  keywords: string[];
  raw_text: string;
}

export default function Results() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const score = searchParams.get('score');
  const scoreNum = score ? parseInt(score) : 0;
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [filePath, setFilePath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reanalyzing, setReanalyzing] = useState(false);

  useEffect(() => {
    // Get the analysis data and file path from localStorage
    const storedAnalysis = localStorage.getItem('resumeAnalysis');
    const storedFilePath = localStorage.getItem('resumeFilePath');
    
    if (storedAnalysis) {
      try {
        const parsedAnalysis = JSON.parse(storedAnalysis);
        setAnalysis(parsedAnalysis);
      } catch (error) {
        console.error('Error parsing analysis data:', error);
      }
    }
    
    if (storedFilePath) {
      setFilePath(storedFilePath);
    }
    
    setLoading(false);
  }, []);

  const handleReanalyze = async () => {
    if (!filePath) return;
    
    setReanalyzing(true);
    
    try {
      // Get the file type from the file path
      const fileExtension = filePath.split('.').pop()?.toLowerCase();
      let fileType = 'application/pdf'; // Default to PDF
      
      if (fileExtension === 'doc') {
        fileType = 'application/msword';
      } else if (fileExtension === 'docx') {
        fileType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      }
      
      // Run the Python script to analyze the resume
      const response = await fetch('/api/reanalyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filePath,
          fileType,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reanalyze resume');
      }
      
      // Update the analysis data in localStorage
      localStorage.setItem('resumeAnalysis', JSON.stringify(data.details));
      
      // Navigate to results page with new score
      router.push(`/results?score=${data.score}`);
    } catch (error) {
      console.error('Error reanalyzing resume:', error);
      alert(error instanceof Error ? error.message : 'Failed to reanalyze resume. Please try again.');
    } finally {
      setReanalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 80) return 'Excellent! Your resume is well-optimized for ATS.';
    if (score >= 60) return 'Good, but there\'s room for improvement.';
    return 'Your resume needs significant improvements to be ATS-friendly.';
  };

  const getScoreRecommendations = (score: number) => {
    if (score >= 80) {
      return [
        'Keep maintaining your strong resume structure',
        'Continue to update your skills and experience regularly',
        'Consider adding more quantifiable achievements',
      ];
    } else if (score >= 60) {
      return [
        'Add more specific details to your work experience',
        'Include more relevant keywords from job descriptions',
        'Ensure your contact information is complete and professional',
        'Consider adding a professional summary section',
      ];
    } else {
      return [
        'Restructure your resume with clear section headings',
        'Add missing contact information',
        'Include more detailed work experience with achievements',
        'Add relevant skills and keywords',
        'Ensure proper formatting and consistency',
      ];
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Your ATS Score
            </h1>
            <div className={`text-6xl font-bold ${getScoreColor(scoreNum)} mb-4`}>
              {scoreNum}%
            </div>
            <p className="text-xl text-gray-600">
              {getScoreMessage(scoreNum)}
            </p>
            
            {filePath && (
              <div className="mt-4 text-sm text-gray-500">
                <p>Resume file: {filePath}</p>
                <button
                  onClick={handleReanalyze}
                  disabled={reanalyzing}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {reanalyzing ? 'Reanalyzing...' : 'Reanalyze Resume'}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Recommendations
            </h2>
            <ul className="space-y-4">
              {getScoreRecommendations(scoreNum).map((recommendation, index) => (
                <li key={index} className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Check Another Resume
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Loading detailed analysis...</p>
          </div>
        ) : analysis ? (
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Detailed Resume Analysis
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Personal Information</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p><span className="font-medium">Name:</span> {analysis.personal_info.name || 'Not found'}</p>
                  <p><span className="font-medium">Email:</span> {analysis.personal_info.email || 'Not found'}</p>
                  <p><span className="font-medium">Phone:</span> {analysis.personal_info.phone || 'Not found'}</p>
                  <p><span className="font-medium">Location:</span> {analysis.personal_info.location || 'Not found'}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Work Experience</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  {analysis.work_experience.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-2">
                      {analysis.work_experience.map((exp, index) => (
                        <li key={index}>{exp.description}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No work experience found</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Education</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  {analysis.education.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-2">
                      {analysis.education.map((edu, index) => (
                        <li key={index}>{edu.description}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No education found</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Skills</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  {analysis.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {analysis.skills.map((skill, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p>No skills found</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Keywords Found</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  {analysis.keywords.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {analysis.keywords.map((keyword, index) => (
                        <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p>No keywords found</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-red-600">
            Failed to load analysis data. Please try again.
          </div>
        )}
      </div>
    </main>
  );
} 