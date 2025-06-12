'use client'

import { useState, useRef, useEffect } from 'react';

export default function BuzzwordPopover({ word, count, buzzwords, suggestions = {} }) {
  const [showPopover, setShowPopover] = useState(false);
  const popoverRef = useRef(null);
  const pillRef = useRef(null);
  const timeoutRef = useRef(null);
  
  // Find all instances of this buzzword in the resume
  const getBuzzwordInstances = () => {
    if (!buzzwords || !buzzwords[word]) return [];
    return buzzwords[word];
  };

  // Get suggestions specific to this buzzword
  const getBuzzwordSuggestions = () => {
    // Default suggestions if none provided by API
    const defaultSuggestions = [
      `Replace "${word}" with more specific achievements`,
      `Quantify results related to "${word}"`,
      `Use stronger action verbs instead of "${word}"`
    ];
    
    return suggestions[word] || defaultSuggestions;
  };
  
  // Handle mouse events with delay to prevent flickering
  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowPopover(true);
  };
  
  const handleMouseLeave = (e) => {
    // Check if we're moving from pill to popover or vice versa
    const relatedTarget = e.relatedTarget;
    const isPill = pillRef.current && pillRef.current.contains(relatedTarget);
    const isPopover = popoverRef.current && popoverRef.current.contains(relatedTarget);
    
    // If moving between pill and popover, don't hide
    if (isPill || isPopover) return;
    
    // Otherwise set a small delay before hiding
    timeoutRef.current = setTimeout(() => {
      setShowPopover(false);
    }, 300);
  };
  
  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if ((popoverRef.current && !popoverRef.current.contains(event.target)) && 
          (pillRef.current && !pillRef.current.contains(event.target))) {
        setShowPopover(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="relative inline-block">
      <span 
        ref={pillRef}
        className="bg-secondary/20 text-primary px-3 py-1 rounded-full inline-flex items-center cursor-pointer transition-all hover:bg-secondary/30"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {word}
        <span className="ml-1 text-xs bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center">
          {count}
        </span>
      </span>
      
      {/* Animated Popover with improved visibility */}
      <div 
        ref={popoverRef}
        className={`absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-4 min-w-[280px] z-10 border border-primary/10
          transition-all duration-200 ease-out
          ${showPopover 
            ? 'opacity-100 scale-100 translate-y-0 popover-enter' 
            : 'opacity-0 scale-95 translate-y-2 pointer-events-none popover-exit'
          }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="text-sm font-bold text-primary mb-3">
          "{word}" appears {count} times
        </div>
        
        <div className="max-h-60 overflow-y-auto">
          {/* Buzzword-specific suggestions with improved visibility */}
          <div className="mb-3">
            <div className="font-medium text-gray-800 text-xs mb-2">IMPROVEMENT SUGGESTIONS:</div>
            <ul className="list-disc list-inside space-y-2">
              {getBuzzwordSuggestions().map((suggestion, i) => (
                <li key={i} className="text-sm text-gray-800 bg-secondary/10 p-2 rounded">
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
          
          {getBuzzwordInstances().length > 0 && (
            <div className="mt-4">
              <div className="font-medium text-gray-800 text-xs mb-2">CONTEXT EXAMPLES:</div>
              <ul className="space-y-2">
                {getBuzzwordInstances().slice(0, 3).map((instance, i) => (
                  <li key={i} className="text-xs bg-primary/10 p-2 rounded text-gray-800">
                    "...{instance}..."
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Arrow pointer with animation */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-primary/10 -mt-1.5 rotate-45"></div>
      </div>
    </div>
  );
}
