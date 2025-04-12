'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiDownload, FiShare2, FiCheck } from 'react-icons/fi';

interface ExperienceItem {
  description: string;
}

interface EducationItem {
  description: string;
}

interface ResumeAnalysis {
  score: number;
  details: {
    skills: string[];
    experience: ExperienceItem[];
    education: EducationItem[];
    recommendations: string[];
  };
  filePath: string;
}

const defaultAnalysis: ResumeAnalysis = {
  score: 0,
  details: {
    skills: [],
    experience: [],
    education: [],
    recommendations: []
  },
  filePath: ''
};

export default function ResultsPage() {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<ResumeAnalysis>(defaultAnalysis);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAnalysis = localStorage.getItem('resumeAnalysis');
    if (storedAnalysis) {
      try {
        const parsedAnalysis = JSON.parse(storedAnalysis);
        // Ensure all required fields exist with default values
        setAnalysis({
          score: parsedAnalysis.score || 0,
          details: {
            skills: parsedAnalysis.details?.skills || [],
            experience: parsedAnalysis.details?.experience || [],
            education: parsedAnalysis.details?.education || [],
            recommendations: parsedAnalysis.details?.recommendations || []
          },
          filePath: parsedAnalysis.filePath || ''
        });
      } catch (error) {
        console.error('Error parsing stored analysis:', error);
        setAnalysis(defaultAnalysis);
      }
    }
    setLoading(false);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return {
      text: 'text-blue-600',
      stroke: '#3B82F6',
      background: '#EFF6FF'
    };
    if (score >= 60) return {
      text: 'text-orange-500',
      stroke: '#F97316',
      background: '#FFF7ED'
    };
    return {
      text: 'text-red-500',
      stroke: '#EF4444',
      background: '#FEF2F2'
    };
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!analysis || analysis.score === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">No Analysis Found</h1>
        <p className="text-gray-600 mb-6">Please upload a resume to get started.</p>
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FiArrowLeft className="mr-2" />
          Back to Upload
        </button>
      </div>
    );
  }

  const scoreColor = getScoreColor(analysis.score);
  const scoreMessage = getScoreMessage(analysis.score);
  const scoreRecommendations = getScoreRecommendations(analysis.score);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <style jsx global>{`
        @keyframes progress-animation {
          0% {
            stroke-dasharray: 0 283;
          }
          100% {
            stroke-dasharray: ${analysis.score * 2.83} 283;
          }
        }
        
        @keyframes fade-in {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .progress-circle circle {
          transition: all 0.3s ease;
        }
      `}</style>
      
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiArrowLeft className="mr-2" />
            Back
          </button>
          <div className="flex space-x-4">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiDownload className="mr-2" />
              Download Report
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiShare2 className="mr-2" />
              Share
            </button>
          </div>
        </div>

        <div className="bg-white shadow-xl rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Your ATS Score
            </h1>
            
            <div className="flex justify-center mb-6">
              <div className="relative w-48 h-48">
                <svg 
                  className="w-full h-full -rotate-90 transform"
                  viewBox="0 0 100 100"
                >
                  {/* Background circle */}
                  <circle
                    className="transition-all duration-300"
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="8"
                  />
                  
                  {/* Progress circle */}
                  <circle
                    className="transition-all duration-300"
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={scoreColor.stroke}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${analysis.score * 2.83} 283`}
                    style={{
                      animation: 'progress-animation 1.5s ease-out forwards',
                    }}
                  />
                </svg>
                {/* Score text */}
                <div 
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    animation: 'fade-in 0.5s ease-out 0.5s forwards',
                    opacity: 0
                  }}
                >
                  <span className={`text-4xl font-bold ${scoreColor.text}`}>
                    {analysis.score}%
                  </span>
                </div>
              </div>
            </div>
            
            <p 
              className={`text-2xl ${scoreColor.text} font-semibold mb-6`}
              style={{
                animation: 'fade-in 0.5s ease-out 0.7s forwards',
                opacity: 0
              }}
            >
              {scoreMessage}
            </p>
            
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Recommendations to Improve Your Score
              </h2>
              <ul className="space-y-3 text-left">
                {scoreRecommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start">
                    <FiCheck className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Detailed Resume Analysis</h3>
            <p className="mt-1 text-sm text-gray-500">Comprehensive breakdown of your resume content</p>
          </div>
          <div className="divide-y divide-gray-200">
            <div className="px-6 py-5">
              <h4 className="text-lg font-medium text-gray-900 mb-3">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.details.skills.length > 0 ? (
                  analysis.details.skills.map((skill, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No skills found</p>
                )}
              </div>
            </div>

            <div className="px-6 py-5">
              <h4 className="text-lg font-medium text-gray-900 mb-3">Experience</h4>
              <ul className="space-y-2">
                {analysis.details.experience.length > 0 ? (
                  analysis.details.experience.map((exp, index) => (
                    <li key={index} className="flex items-start">
                      <span className="h-5 w-5 rounded-full bg-green-100 text-green-800 flex items-center justify-center mr-2 mt-0.5 text-xs">✓</span>
                      <span>{exp.description}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">No experience found</li>
                )}
              </ul>
            </div>

            <div className="px-6 py-5">
              <h4 className="text-lg font-medium text-gray-900 mb-3">Education</h4>
              <ul className="space-y-2">
                {analysis.details.education.length > 0 ? (
                  analysis.details.education.map((edu, index) => (
                    <li key={index} className="flex items-start">
                      <span className="h-5 w-5 rounded-full bg-green-100 text-green-800 flex items-center justify-center mr-2 mt-0.5 text-xs">✓</span>
                      <span>{edu.description}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">No education found</li>
                )}
              </ul>
            </div>

            <div className="px-6 py-5">
              <h4 className="text-lg font-medium text-gray-900 mb-3">AI Recommendations</h4>
              <ul className="space-y-2">
                {analysis.details.recommendations.length > 0 ? (
                  analysis.details.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <span className="h-5 w-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center mr-2 mt-0.5 text-xs">i</span>
                      <span>{rec}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">No recommendations available</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 