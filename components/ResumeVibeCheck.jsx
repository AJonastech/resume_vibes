'use client'

import { useState } from 'react';
import ResumeInput from './ResumeInput';
import ResumeInitialRoast from './ResumeInitialRoast';
import SectionAnalysis from './SectionAnalysis';
import ExportOptions from './ExportOptions';

export default function ResumeVibeCheck() {
  const [resumeText, setResumeText] = useState('');
  const [analysisStage, setAnalysisStage] = useState('input'); // 'input', 'roast', 'analysis'
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  
  const analyzeResume = async (text, file) => {
    if (!file) {
      setError("Please upload a resume file first.");
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Create form data for API call
      const formData = new FormData();
      formData.append('file', file);
      
      // Call the API route for resume analysis
      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Set results and move to roast stage
      setResults(data);
      setAnalysisStage('roast');
    } catch (err) {
      console.error("Error analyzing resume:", err);
      setError(err.message || "Failed to analyze resume. Please try again with a simpler file format like .txt");
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const resetAnalysis = () => {
    setAnalysisStage('input');
    setResults(null);
    setResumeText('');
    setError(null);
  };

  return (
    <>
      {analysisStage === 'input' && (
        <div className="w-full flex flex-col gap-4 items-center">
          <ResumeInput 
            resumeText={resumeText} 
            setResumeText={setResumeText}
            onSubmit={analyzeResume}
            isAnalyzing={isAnalyzing}
          />
          
          {error && (
            <div className="mt-4 p-4 bg-negative/10 text-negative rounded-lg text-center border border-negative/20 max-w-lg">
              <p className="font-medium mb-1">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>
      )}
      
      {analysisStage === 'roast' && results && (
        <ResumeInitialRoast 
          results={results}
          onContinue={() => setAnalysisStage('analysis')}
        />
      )}
      
      {analysisStage === 'analysis' && results && (
        <div className="w-full flex flex-col gap-10">
          {/* Navigation Tabs */}
          <div className="flex justify-center">
            <div className="inline-flex bg-secondary/10 rounded-lg p-1">
              <button 
                onClick={() => setAnalysisStage('roast')}
                className={`px-4 py-2 rounded-md ${analysisStage === 'roast' ? 'bg-primary text-white' : 'hover:bg-secondary/10'}`}
              >
                Vibe Check
              </button>
              <button 
                onClick={() => setAnalysisStage('analysis')}
                className={`px-4 py-2 rounded-md ${analysisStage === 'analysis' ? 'bg-primary text-white' : 'hover:bg-secondary/10'}`}
              >
                Detailed Analysis
              </button>
            </div>
          </div>
          
          {/* Section-Based Analysis with Buzzword Data */}
          <SectionAnalysis 
            sections={results.sections}
            buzzwords={results.buzzwords}
            buzzwordCounts={results.buzzwordCounts}
            buzzwordSuggestions={results.buzzwordSuggestions} // Pass the buzzword suggestions
          />
          
          {/* Export Options */}
          <ExportOptions 
            originalResume={resumeText}
            improvedResume={results.sections.map(section => 
              `${section.title.toUpperCase()}\n${section.rewrite}\n\n`
            ).join('')}
            suggestions={{
              sections: results.sections
            }}
          />
          
          {/* Reset Button */}
          <div className="flex justify-center">
            <button
              onClick={resetAnalysis}
              className="px-6 py-3 border border-secondary rounded-lg text-secondary hover:bg-secondary/10 transition-all"
            >
              Start Over with a New Resume
            </button>
          </div>
        </div>
      )}
    </>
  );
}
