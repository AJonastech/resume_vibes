'use client'
import React, { useState, useEffect } from 'react';
import BuzzwordPopover from './BuzzwordPopover';

const SectionAnalysis = ({ sections, buzzwords = [], buzzwordCounts = {}, buzzwordSuggestions = {} }) => {
  const [expandedSection, setExpandedSection] = useState(null);
  const [activeSuggestionTab, setActiveSuggestionTab] = useState('rewrite');
  const [copiedSection, setCopiedSection] = useState(null);
  const [sectionBuzzwords, setSectionBuzzwords] = useState({});
  
  // Process buzzwords by section
  useEffect(() => {
    if (!buzzwords || !sections) return;
    
    const sectionSpecificBuzzwords = {};
    
    sections.forEach((section, index) => {
      const sectionWords = {};
      
      buzzwords.forEach(word => {
        if (!section.originalText) return;
        
        const regex = new RegExp(word, 'gi');
        const matches = section.originalText.match(regex);
        
        if (matches && matches.length > 0) {
          sectionWords[word] = matches.length;
        }
      });
      
      sectionSpecificBuzzwords[index] = sectionWords;
    });
    
    setSectionBuzzwords(sectionSpecificBuzzwords);
  }, [sections, buzzwords]);
  
  const copyToClipboard = (text, sectionId, tab) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedSection(`${sectionId}-${tab}`);
      setTimeout(() => setCopiedSection(null), 2000);
    });
  };

  // Check if sections exist and have content
  if (!sections || sections.length === 0) {
    return (
      <div className="w-full p-8 bg-white/20 backdrop-blur-sm rounded-xl border border-primary/20">
        <h3 className="subhead text-primary mb-4">Section Analysis</h3>
        <p className="text-secondary">No sections were detected in your resume. Please try uploading a different file.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="subhead text-primary mb-6">Section Analysis</h3>
      <p className="text-secondary mb-8">
        We found {sections?.length || 0} sections in your resume. Click on each section to view AI-generated improvement suggestions.
      </p>
      
      <div className="flex flex-col gap-4">
        {sections?.map((section, index) => (
          <div key={index} className="border border-secondary/20 rounded-xl overflow-hidden transition-all bg-white/30 backdrop-blur-sm">
            <button
              className={`w-full flex justify-between items-center p-5 text-left transition-all 
                ${expandedSection === index ? 'bg-primary/10' : 'hover:bg-secondary/10'}`}
              onClick={() => setExpandedSection(expandedSection === index ? null : index)}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center
                  ${section.improvement === 'High' ? 'bg-negative/20 text-negative' : 
                    section.improvement === 'Medium' ? 'bg-accent-warning/20 text-accent-warning' :
                    'bg-positive/20 text-positive'}`}>
                  {section.improvement === 'High' ? '!' : 
                   section.improvement === 'Medium' ? '•' : '✓'}
                </div>
                <div>
                  <h4 className="font-medium text-lg">{section.title || 'Untitled Section'}</h4>
                  <p className="text-sm text-secondary">{section.wordCount || 0} words</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium
                  ${section.improvement === 'High' ? 'bg-negative/20 text-negative' :
                    section.improvement === 'Medium' ? 'bg-accent-warning/20 text-accent-warning' :
                    'bg-positive/20 text-positive'}`}>
                  {section.improvement} Priority
                </span>
                <svg 
                  className={`w-5 h-5 text-secondary transition-transform ${expandedSection === index ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            
            {expandedSection === index && (
              <div className="p-5 bg-white/50 backdrop-blur-sm animate-fadeIn">
                {/* Original Text */}
                <div className="mb-5">
                  <h5 className="text-sm font-medium text-secondary mb-2">ORIGINAL TEXT</h5>
                  <div className="bg-white p-4 rounded-lg border border-secondary/10 shadow-sm">
                    <pre className="whitespace-pre-wrap text-black text-sm font-mono break-words">
                      {section.originalText || "No original text available"}
                    </pre>
                  </div>
                </div>
                
                {/* Buzzwords in Section */}
                {Object.keys(sectionBuzzwords[index] || {}).length > 0 && (
                  <div className="mb-5">
                    <h5 className="text-sm font-medium text-secondary mb-2">BUZZWORDS IN THIS SECTION</h5>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(sectionBuzzwords[index] || {}).map(([word, count], i) => {
                        // Extract contexts for this specific section and word
                        const contexts = {};
                        if (section.originalText) {
                          const regex = new RegExp(`(.{0,20}${word}.{0,20})`, 'gi');
                          const matches = section.originalText.match(regex) || [];
                          contexts[word] = matches.map(match => match.replace(/\s+/g, ' ').trim());
                        }
                        
                        return (
                          <BuzzwordPopover
                            key={i}
                            word={word}
                            count={count}
                            buzzwords={contexts}
                            suggestions={buzzwordSuggestions}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Tab Navigation */}
                <div className="flex border-b mb-4">
                  <button
                    className={`px-4 py-2 -mb-px font-medium ${activeSuggestionTab === 'rewrite' ? 'border-b-2 border-primary text-primary' : 'text-secondary'}`}
                    onClick={() => setActiveSuggestionTab('rewrite')}
                  >
                    Rewrite
                  </button>
                  <button
                    className={`px-4 py-2 -mb-px font-medium ${activeSuggestionTab === 'examples' ? 'border-b-2 border-primary text-primary' : 'text-secondary'}`}
                    onClick={() => setActiveSuggestionTab('examples')}
                  >
                    Examples
                  </button>
                  <button
                    className={`px-4 py-2 -mb-px font-medium ${activeSuggestionTab === 'questions' ? 'border-b-2 border-primary text-primary' : 'text-secondary'}`}
                    onClick={() => setActiveSuggestionTab('questions')}
                  >
                    Questions
                  </button>
                </div>
                
                {/* Tab Content */}
                <div className="p-1">
                  {activeSuggestionTab === 'rewrite' && (
                    <div>
                      <div className="flex justify-between items-start">
                        <p className="text-sm text-secondary mb-3">Suggested improvement:</p>
                        <button 
                          className={`flex items-center gap-1 text-sm ${copiedSection === `${index}-rewrite` ? 'text-positive' : 'text-primary'}`}
                          onClick={() => copyToClipboard(section.rewrite || '', index, 'rewrite')}
                        >
                          {copiedSection === `${index}-rewrite` ? (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Copied!
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              Copy suggestion
                            </>
                          )}
                        </button>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-primary/10 shadow-sm">
                        <pre className="whitespace-pre-wrap text-black text-sm font-mono break-words">
                          {section.rewrite || "No rewrite suggestion available"}
                        </pre>
                      </div>
                    </div>
                  )}
                  
                  {activeSuggestionTab === 'examples' && (
                    <div>
                      <p className="text-sm text-secondary mb-3">Strong examples from similar resumes:</p>
                      {section.examples && section.examples.length > 0 ? (
                        section.examples.map((example, i) => (
                          <div key={i} className="mb-3">
                            <div className="flex justify-between items-start">
                              <p className="text-sm font-medium mb-1 text-primary">{example.title || `Example ${i+1}`}</p>
                              <button 
                                className={`flex items-center gap-1 text-sm ${copiedSection === `${index}-example-${i}` ? 'text-positive' : 'text-primary'}`}
                                onClick={() => copyToClipboard(example.text || '', index, `example-${i}`)}
                              >
                                {copiedSection === `${index}-example-${i}` ? "Copied!" : "Copy"}
                              </button>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-secondary/10 shadow-sm">
                              <p className="text-sm text-black whitespace-pre-wrap font-mono">
                                {example.text || "No example text available"}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="bg-white p-3 rounded-lg border border-secondary/10 text-center text-secondary">
                          No examples available for this section
                        </div>
                      )}
                    </div>
                  )}
                  
                  {activeSuggestionTab === 'questions' && (
                    <div>
                      <p className="text-sm text-secondary mb-3">Questions to improve clarity:</p>
                      {section.questions && section.questions.length > 0 ? (
                        <ul className="space-y-3">
                          {section.questions.map((question, i) => (
                            <li key={i} className="bg-white p-3 rounded-lg border border-secondary/10 shadow-sm">
                              <div className="flex items-start gap-2">
                                <span className="text-primary mt-0.5">•</span>
                                <span className="text-sm flex-1 text-black">{question}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="bg-white p-3 rounded-lg border border-secondary/10 text-center text-secondary">
                          No questions available for this section
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectionAnalysis;
