'use client'
import React, { useState } from 'react';

const ExportOptions = ({ originalResume, improvedResume, suggestions }) => {
  const [exportFormat, setExportFormat] = useState('improved');
  const [copySuccess, setCopySuccess] = useState(false);
  
  const handleDownload = () => {
    const content = exportFormat === 'improved' ? improvedResume : 
      exportFormat === 'original' ? originalResume : 
      JSON.stringify(suggestions, null, 2);
      
    const extension = exportFormat === 'suggestions' ? '.json' : '.txt';
    const filename = `resume_${exportFormat}${extension}`;
    
    // Create blob and trigger download
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleCopy = () => {
    const content = exportFormat === 'improved' ? improvedResume : 
      exportFormat === 'original' ? originalResume : 
      JSON.stringify(suggestions, null, 2);
      
    navigator.clipboard.writeText(content).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  return (
    <div className="bg-white/30 backdrop-blur-sm rounded-xl p-6 border border-secondary/20 shadow-md">
      <h3 className="subhead text-primary mb-4">Export Options</h3>
      
      <div className="flex flex-col gap-6">
        {/* Format Selection */}
        <div className="flex flex-col">
          <label className="text-sm text-secondary mb-2">Export Format:</label>
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-4 py-2 rounded-md ${exportFormat === 'improved' ? 'bg-primary text-white' : 'bg-secondary/10 hover:bg-secondary/20'}`}
              onClick={() => setExportFormat('improved')}
            >
              Improved Resume
            </button>
            <button
              className={`px-4 py-2 rounded-md ${exportFormat === 'original' ? 'bg-primary text-white' : 'bg-secondary/10 hover:bg-secondary/20'}`}
              onClick={() => setExportFormat('original')}
            >
              Original Resume
            </button>
            <button
              className={`px-4 py-2 rounded-md ${exportFormat === 'suggestions' ? 'bg-primary text-white' : 'bg-secondary/10 hover:bg-secondary/20'}`}
              onClick={() => setExportFormat('suggestions')}
            >
              Suggestions (JSON)
            </button>
          </div>
        </div>
        
        {/* Preview */}
        <div>
          <label className="text-sm text-secondary mb-2">Preview:</label>
          <div className="bg-secondary/5 rounded-lg p-4 max-h-40 overflow-auto border border-secondary/10">
            <pre className="text-sm whitespace-pre-wrap">
              {exportFormat === 'improved' ? 
                (improvedResume?.slice(0, 300) + (improvedResume?.length > 300 ? '...' : '')) : 
               exportFormat === 'original' ? 
                (originalResume?.slice(0, 300) + (originalResume?.length > 300 ? '...' : '')) : 
               JSON.stringify(suggestions, null, 2).slice(0, 300) + '...'}
            </pre>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-all"
            onClick={handleDownload}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
          <button
            className="flex items-center gap-2 bg-secondary/20 hover:bg-secondary/30 text-secondary hover:text-primary px-6 py-3 rounded-lg font-medium transition-all"
            onClick={handleCopy}
          >
            {copySuccess ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy to Clipboard
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportOptions;
