'use client'
import React, { useState, useEffect } from 'react';

const VibeResults = ({ results, onReset }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  // Animation effect when results come in
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  const getVibeEmoji = (score) => {
    if (score >= 90) return '🔥';
    if (score >= 70) return '✨';
    if (score >= 50) return '👀';
    if (score >= 30) return '😬';
    return '💀';
  };
  
  const getVibeDescription = (score) => {
    if (score >= 90) return "Legendary";
    if (score >= 80) return "Outstanding";
    if (score >= 70) return "Impressive";
    if (score >= 60) return "Solid";
    if (score >= 50) return "Decent";
    if (score >= 40) return "Needs Work";
    if (score >= 30) return "Concerning";
    return "Critical";
  };
  
  const shareToTwitter = () => {
    const text = `My resume has a vibe score of ${results.vibeScore}/100 ${getVibeEmoji(results.vibeScore)} and I'm a "${results.personalityLabel}" ${results.hashtags.join(' ')}`;
    const url = 'https://resumevibescheck.com';  // Replace with your actual URL
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };
  
  const copyToClipboard = () => {
    const text = `Resume Vibes Check Results:
Vibe Score: ${results.vibeScore}/100 ${getVibeEmoji(results.vibeScore)} - ${getVibeDescription(results.vibeScore)}
Personality: ${results.personalityLabel}
Hot Take: "${results.hotTake}"
${results.hashtags.join(' ')}
https://resumevibescheck.com`;  // Replace with your actual URL
    
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className={`w-full transform transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
      <div className="relative overflow-hidden w-full bg-gradient-to-br from-[rgba(16,185,129,0.1)] to-[rgba(5,150,105,0.15)] border border-primary/20 rounded-xl p-0 shadow-lg transition-all">
        {/* Header Banner */}
        <div className="bg-gradient-spike text-white px-8 py-6 flex justify-between items-center">
          <h2 className="subhead font-bold">Your Resume Vibe Results</h2>
          <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">Analysis Complete</span>
        </div>
        
        {/* Results Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Vibe Score */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-primary/10">
              <h3 className="tag text-secondary mb-2">VIBE SCORE</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="text-6xl font-bold bg-gradient-spike text-transparent bg-clip-text">
                  {results.vibeScore}
                </div>
                <div className="text-5xl">{getVibeEmoji(results.vibeScore)}</div>
              </div>
              <div className="w-full bg-secondary/20 h-3 rounded-full overflow-hidden mt-2">
                <div 
                  className="h-full bg-gradient-spike rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${results.vibeScore}%` }}
                ></div>
              </div>
              <div className="text-lg font-medium mt-3">{getVibeDescription(results.vibeScore)}</div>
            </div>
            
            {/* Right Column - Personality */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-primary/10">
              <h3 className="tag text-secondary mb-2">PERSONALITY</h3>
              <div className="text-2xl font-bold mb-2">{results.personalityLabel}</div>
              <div className="flex flex-wrap gap-2 my-3">
                {results.hashtags.map((tag, index) => (
                  <span key={index} className="bg-primary/15 text-primary px-3 py-1 rounded-full tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Hot Take Section */}
          <div className="mt-8 bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-primary/10">
            <h3 className="tag text-secondary mb-2">HOT TAKE</h3>
            <div className="italic text-xl border-l-4 border-accent-alert pl-4 py-2">
              "{results.hotTake}"
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap gap-4">
            <button 
              onClick={shareToTwitter}
              className="flex items-center gap-2 bg-[#1DA1F2] hover:bg-[#1DA1F2]/80 text-white px-6 py-3 rounded-lg font-medium transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 5.89c-.8.36-1.65.6-2.53.71a4.4 4.4 0 0 0 1.95-2.45c-.85.5-1.8.88-2.8 1.08A4.4 4.4 0 0 0 11.77 9c0 .34.04.68.11 1A12.54 12.54 0 0 1 3 4.97a4.4 4.4 0 0 0 1.36 5.87 4.4 4.4 0 0 1-2-.55v.05a4.4 4.4 0 0 0 3.53 4.32 4.4 4.4 0 0 1-2 .08 4.4 4.4 0 0 0 4.1 3.06 8.82 8.82 0 0 1-5.46 1.88c-.35 0-.7-.02-1.05-.06a12.48 12.48 0 0 0 6.75 1.98c8.09 0 12.52-6.7 12.52-12.52l-.01-.57A8.93 8.93 0 0 0 22 5.9Z" />
              </svg>
              Share on Twitter
            </button>
            
            <button 
              onClick={copyToClipboard}
              className="flex items-center gap-2 bg-accent-alert hover:bg-accent-alert/80 text-white px-6 py-3 rounded-lg font-medium transition-all"
            >
              {isCopied ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Copy Results
                </>
              )}
            </button>
            
            <button 
              onClick={onReset}
              className="flex items-center gap-2 bg-transparent hover:bg-primary/10 border border-primary text-primary px-6 py-3 rounded-lg font-medium transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Check Another Resume
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VibeResults;
