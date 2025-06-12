'use client'
import React, { useState } from 'react';

const SectionSuggestions = ({ sections }) => {
  const [expandedSection, setExpandedSection] = useState(null);
  const [activeSuggestionTab, setActiveSuggestionTab] = useState('rewrite');
  
  const toggleSection = (index) => {
    setExpandedSection(expandedSection === index ? null : index);
    setActiveSuggestionTab('rewrite');
  };

  return (
    <div className="w-full">
      <h3 className="subhead text-primary mb-4">Section Analysis</h3>
      
      <div className="flex flex-col gap-4">
        {sections.map((section, index) => (
          <div 
            key={index}
            className="border border-secondary/20 rounded-xl overflow-hidden transition-all"
          >
            <button
              className={`w-full flex justify-between items-center p-4 text-left ${expandedSection === index ? 'bg-primary/10' : 'bg-white/50 hover:bg-secondary/10'}`}
              onClick={() => toggleSection(index)}
            >
              <div>
                <h4 className="font-medium">{section.title}</h4>
                <p className="text-sm text-secondary">{section.wordCount} words</p>
              </div>
              <div className="flex items-center gap-2">
                {section.improvement && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium
                    ${section.improvement === 'High' ? 'bg-negative/20 text-negative' :
                      section.improvement === 'Medium' ? 'bg-accent-warning/20 text-accent-warning' :
                        'bg-positive/20 text-positive'}`}>
                    {section.improvement} Priority
                  </span>
                )}
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
              <div className="p-4 bg-gradient-to-br from-white to-secondary/5 animate-fadeIn">
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
                <div className="p-2">
                  {activeSuggestionTab === 'rewrite' && (
                    <div>
                      <p className="text-sm text-secondary mb-3">Suggested improvement:</p>
                      <div className="bg-white p-4 rounded-lg border border-primary/10">
                        <pre className="whitespace-pre-wrap text-foreground-light">{section.rewrite}</pre>
                      </div>
                      <button className="mt-3 flex items-center gap-1 text-primary text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy suggested text
                      </button>
                    </div>
                  )}
                  
                  {activeSuggestionTab === 'examples' && (
                    <div>
                      <p className="text-sm text-secondary mb-3">Strong examples from similar resumes:</p>
                      {section.examples.map((example, i) => (
                        <div key={i} className="mb-3 bg-white p-3 rounded-lg border border-secondary/10">
                          <p className="text-sm font-medium mb-1 text-primary">{example.title}</p>
                          <p className="text-sm">{example.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {activeSuggestionTab === 'questions' && (
                    <div>
                      <p className="text-sm text-secondary mb-3">Questions to improve clarity:</p>
                      <ul className="space-y-2">
                        {section.questions.map((question, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>{question}</span>
                          </li>
                        ))}
                      </ul>
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

export default SectionSuggestions;
