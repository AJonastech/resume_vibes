'use client'

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function BuzzwordPopover({ word, count, buzzwords, suggestions = {} }) {
  const [showPopover, setShowPopover] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({});
  const [isMounted, setIsMounted] = useState(false);
  const popoverRef = useRef(null);
  const pillRef = useRef(null);
  const timeoutRef = useRef(null);
  
  // Mount effect to handle client-side rendering
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

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
  
  // Calculate position when popover visibility changes - completely rewritten
  useEffect(() => {
    if (!showPopover || !pillRef.current || !isMounted) return;
    
    // Delay position calculation to ensure accurate DOM measurements
    setTimeout(() => {
      // Get measurements
      const pillRect = pillRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Get popover dimensions
      const popoverWidth = popoverRef.current ? popoverRef.current.offsetWidth : 280;
      const popoverHeight = popoverRef.current ? popoverRef.current.offsetHeight : 260;
      
      // Calculate available space in each direction
      const spaceAbove = pillRect.top;
      const spaceBelow = viewportHeight - pillRect.bottom;
      const spaceLeft = pillRect.left;
      const spaceRight = viewportWidth - pillRect.right;
      
      // Determine if mobile view
      const isMobile = viewportWidth < 768;
      
      // Calculate absolute position relative to viewport
      let position = {};
      
      // Determine vertical position
      if (spaceBelow >= popoverHeight || spaceBelow > spaceAbove) {
        // Position below
        position.top = pillRect.bottom + window.scrollY + 8;
        position.bottom = 'auto';
        position.placement = 'bottom';
      } else {
        // Position above
        position.bottom = (window.innerHeight - pillRect.top) + window.scrollY + 8;
        position.top = 'auto';
        position.placement = 'top';
      }
      
      // Determine horizontal position
      const idealLeft = pillRect.left + (pillRect.width / 2) - (popoverWidth / 2);
      
      // Adjust for edge cases
      if (idealLeft < 16) {
        // Too close to left edge - align left with padding
        position.left = 16;
        position.transform = 'none';
      } else if (idealLeft + popoverWidth > viewportWidth - 16) {
        // Too close to right edge - align right with padding
        position.right = 16;
        position.left = 'auto';
        position.transform = 'none';
      } else {
        // Center align with pill
        position.left = idealLeft;
        position.transform = 'none';
      }
      
      // For mobile, use fixed positioning
      if (isMobile) {
        position.position = 'fixed';
        position.maxWidth = `${viewportWidth - 32}px`; // 16px padding on each side
        position.maxHeight = `${viewportHeight * 0.7}px`; // Max 70% of viewport height
      } else {
        position.position = 'absolute';
      }
      
      setPopoverPosition(position);
    }, 10);
  }, [showPopover, isMounted]);
  
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
        onClick={() => setShowPopover(!showPopover)} // Add click handler for mobile
      >
        {word}
        <span className="ml-1 text-xs bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center">
          {count}
        </span>
      </span>
      
      {/* Use Portal to render popover at root level, preventing container clipping */}
      {isMounted && showPopover && createPortal(
        <div 
          ref={popoverRef}
          style={{
            left: popoverPosition.left,
            right: popoverPosition.right,
            top: popoverPosition.top,
            bottom: popoverPosition.bottom,
            transform: popoverPosition.transform,
            position: popoverPosition.position || 'absolute',
            maxWidth: popoverPosition.maxWidth,
            maxHeight: popoverPosition.maxHeight,
            zIndex: 100
          }}
          className={`bg-white rounded-lg shadow-lg p-4 min-w-[280px] border border-primary/10
            transition-all duration-200 ease-out opacity-100 scale-100`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="text-sm font-bold text-primary mb-3">
            "{word}" appears {count} times
          </div>
          
          <div className="overflow-y-auto" style={{ maxHeight: popoverPosition.maxHeight || '60vh' }}>
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
          
          {/* Arrow pointer - adjusted for placement */}
          {!popoverPosition.position === 'fixed' && (
            <div 
              className="absolute w-3 h-3 bg-white border-r border-b border-primary/10 rotate-45"
              style={{
                top: popoverPosition.placement === 'top' ? 'auto' : '-6px',
                bottom: popoverPosition.placement === 'top' ? '-6px' : 'auto',
                left: '50%',
                transform: 'translateX(-50%)',
                display: popoverPosition.left < 20 || popoverPosition.right < 20 ? 'none' : 'block'
              }}
            ></div>
          )}
          
          {/* Close button */}
          <button 
            className="absolute top-2 right-2 text-secondary hover:text-primary" 
            onClick={() => setShowPopover(false)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}
