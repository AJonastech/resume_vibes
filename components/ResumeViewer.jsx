'use client'
import React, { useState } from 'react';

const ResumeViewer = ({ resumeText, problemAreas, sections }) => {
  const [activeHighlight, setActiveHighlight] = useState(null);
  const [activeTip, setActiveTip] = useState(null);
  
  // Function to highlight problem areas in the resume
  const renderHighlightedText = () => {
    if (!problemAreas || problemAreas.length === 0) {
      return <pre className="whitespace-pre-wrap">{resumeText}</pre>;
    }
    
    // Sort problems by start position to process them in order
    const sortedProblems = [...problemAreas].sort((a, b) => a.startIndex - b.startIndex);
    
    let lastIndex = 0;
    const elements = [];
    
    sortedProblems.forEach((problem, i) => {
      // Add text before the problem
      if (problem.startIndex > lastIndex) {
        elements.push(
          <span key={`text-${i}`}>
            {resumeText.substring(lastIndex, problem.startIndex)}
          </span>
        );
      }
      
      // Add the highlighted problem text
      elements.push(
        <span
          key={`highlight-${i}`}
          className={`bg-accent-alert/20 cursor-pointer hover:bg-accent-alert/30 transition-colors rounded px-0.5 ${activeHighlight === i ? 'bg-accent-alert/40 ring-1 ring-accent-alert' : ''}`}
          onClick={() => {
            setActiveHighlight(activeHighlight === i ? null : i);
            setActiveTip(activeHighlight === i ? null : problem.tipId);
          }}
        >
          {resumeText.substring(problem.startIndex, problem.endIndex)}
        </span>
      );
      
      lastIndex = problem.endIndex;
    });
    
    // Add any remaining text
    if (lastIndex < resumeText.length) {
      elements.push(
        <span key="text-end">
          {resumeText.substring(lastIndex)}
        </span>
      );
    }
    
    return <div className="whitespace-pre-wrap">{elements}</div>;
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Resume Document View */}
      <div className="flex-1 bg-white rounded-xl p-8 shadow-lg min-h-[500px] border border-secondary/20">
        <div className="prose max-w-none text-foreground-light">
          {renderHighlightedText()}
        </div>
      </div>
      
      {/* Sidebar Tips */}
      <div className="w-full md:w-80 flex flex-col gap-4">
        {activeHighlight !== null && (
          <div className="bg-accent-alert/10 border border-accent-alert/30 rounded-xl p-4 animate-fadeIn">
            <h4 className="font-medium text-accent-alert mb-2">Suggestion</h4>
            <p className="text-sm mb-3">{problemAreas[activeHighlight].tip}</p>
            {problemAreas[activeHighlight].suggestion && (
              <>
                <h5 className="text-xs uppercase text-secondary font-medium mt-2 mb-1">Try instead:</h5>
                <p className="text-sm italic bg-white/50 p-2 rounded">
                  {problemAreas[activeHighlight].suggestion}
                </p>
              </>
            )}
          </div>
        )}
        
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
          <h4 className="font-medium text-primary mb-2">Resume Sections</h4>
          <div className="flex flex-col gap-2">
            {sections.map((section, i) => (
              <button
                key={i}
                className="text-left p-2 hover:bg-primary/10 rounded flex justify-between items-center"
                onClick={() => {
                  // Scroll to section
                  document.getElementById(`section-${i}`).scrollIntoView({
                    behavior: 'smooth'
                  });
                }}
              >
                <span>{section.title}</span>
                <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>
        
        <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-4">
          <h4 className="font-medium text-secondary mb-2">How To Use</h4>
          <ul className="text-sm space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-accent-alert mt-0.5">•</span>
              <span>Click on highlighted text to see improvement suggestions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent-alert mt-0.5">•</span>
              <span>Use section links to quickly navigate your resume</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent-alert mt-0.5">•</span>
              <span>Export suggestions or an improved draft when ready</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ResumeViewer;
