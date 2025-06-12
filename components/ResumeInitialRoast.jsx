'use client'
import React, { useState, useEffect } from 'react';
import BuzzwordPopover from './BuzzwordPopover';

const ResumeInitialRoast = ({ results, onContinue }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [sectionStats, setSectionStats] = useState({
    total: 0,
    needsImprovement: 0
  });
  
  // Process buzzwords to extract context
  const [processedBuzzwords, setProcessedBuzzwords] = useState({});
  
  useEffect(() => {
    setIsVisible(true);
    
    // Calculate section stats
    if (results.sections) {
      const total = results.sections.length;
      const needsImprovement = results.sections.filter(
        s => s.improvement === 'High' || s.improvement === 'Medium'
      ).length;
      
      setSectionStats({ total, needsImprovement });
    }
    
    // Process buzzwords to extract context
    if (results.buzzwords && results.sections) {
      const buzzwordContexts = {};
      
      results.buzzwords.forEach(word => {
        buzzwordContexts[word] = extractBuzzwordContexts(word, results.sections);
      });
      
      setProcessedBuzzwords(buzzwordContexts);
    }
  }, [results]);
  
  // Extract context for a buzzword from sections
  const extractBuzzwordContexts = (buzzword, sections) => {
    const contexts = [];
    const regex = new RegExp(`(.{0,20}${buzzword}.{0,20})`, 'gi');
    
    sections.forEach(section => {
      if (!section.originalText) return;
      
      const matches = section.originalText.match(regex);
      if (matches) {
        matches.forEach(match => {
          contexts.push(match.replace(/\s+/g, ' ').trim());
        });
      }
    });
    
    return contexts;
  };
  
  const getVibeEmoji = (score) => {
    if (score >= 90) return '🔥';
    if (score >= 70) return '✨';
    if (score >= 50) return '👀';
    if (score >= 30) return '😬';
    return '💀';
  };

  return (
    <div className={`w-full transform transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
      <div className="bg-gradient-to-br from-[rgba(16,185,129,0.1)] to-[rgba(5,150,105,0.15)] border border-primary/20 rounded-xl overflow-hidden shadow-lg">
        {/* Header Banner */}
        <div className="bg-gradient-spike text-white p-6 flex justify-between items-center">
          <h2 className="subhead font-bold">Your Resume Vibe Check</h2>
          <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">Quick Analysis</span>
        </div>
        
        {/* Results Content */}
        <div className="p-8">
          {/* Vibe Score */}
          <div className="flex items-center justify-between gap-4 mb-8 bg-white/5 rounded-xl p-6 border border-primary/10">
            <div>
              <h3 className="tag text-secondary mb-2">VIBE SCORE</h3>
              <div className="flex items-center gap-3">
                <div className="text-6xl font-bold bg-gradient-spike text-transparent bg-clip-text">
                  {results.vibeScore}
                </div>
                <div className="text-5xl">
                  {getVibeEmoji(results.vibeScore)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-medium">{results.personalityLabel}</div>
              <div className="text-secondary text-sm mt-1">Resume Archetype</div>
            </div>
          </div>
          
          {/* Resume Section Stats */}
          <div className="mb-8 bg-white/5 rounded-xl p-6 border border-primary/10">
            <h3 className="tag text-secondary mb-4">RESUME SECTIONS DETECTED</h3>
            
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span>Total Sections</span>
                <span className="font-medium">{sectionStats.total}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Sections Needing Improvement</span>
                <span className={`font-medium ${sectionStats.needsImprovement > 0 ? 'text-accent-alert' : 'text-positive'}`}>
                  {sectionStats.needsImprovement}
                </span>
              </div>
              
              <div className="h-2 bg-secondary/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-1000" 
                  style={{ width: `${((sectionStats.total - sectionStats.needsImprovement) / sectionStats.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Buzzwords Section with Enhanced Hover Functionality */}
          <div className="mb-8 bg-white/5 rounded-xl p-6 border border-primary/10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="tag text-secondary">BUZZWORDS DETECTED</h3>
              <span className="text-sm font-medium bg-accent-alert/20 text-accent-alert px-3 py-1 rounded-full">
                {results.buzzwords?.length === 0 ? 'None' : 
                 results.buzzwords?.length <= 2 ? 'Few' : 
                 results.buzzwords?.length <= 5 ? 'Several' : 'Many'}
              </span>
            </div>
            
            {results.buzzwords && results.buzzwords.length > 0 ? (
              <>
                <div className="flex flex-wrap gap-2 mb-4">
                  {results.buzzwords.map((word, index) => (
                    <BuzzwordPopover 
                      key={index} 
                      word={word} 
                      count={results.buzzwordCounts[word]} 
                      buzzwords={processedBuzzwords}
                      suggestions={results.buzzwordSuggestions || {}}
                    />
                  ))}
                </div>
                
                <p className="text-secondary italic">
                  {results.buzzwords.length > 5 
                    ? "Wow, that's a lot of corporate speak! Is your resume applying for the job or are you?" 
                    : results.buzzwords.length > 0 
                      ? "A few buzzwords detected. At least you're not speaking entirely in corporate code." 
                      : "Impressive! You've avoided the corporate jargon trap."}
                </p>
              </>
            ) : (
              <p className="text-secondary italic">
                No common buzzwords detected. Impressive clarity!
              </p>
            )}
          </div>
          
          {/* Hot Take Section */}
          <div className="mb-8 bg-white/5 rounded-xl p-6 border border-primary/10">
            <h3 className="tag text-secondary mb-2">HOT TAKE</h3>
            <div className="italic text-xl border-l-4 border-accent-alert pl-4 py-2">
              "{results.hotTake}"
            </div>
          </div>
          
          {/* Continue Button */}
          <button 
            onClick={onContinue}
            className="w-full bg-primary hover:bg-primary/90 text-white px-6 py-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
          >
            Continue to Section Analysis
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeInitialRoast;
