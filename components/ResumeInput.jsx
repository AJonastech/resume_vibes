'use client'
import React, { useRef, useState } from 'react';

const ResumeInput = ({ resumeText, setResumeText, onSubmit, isAnalyzing }) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [uploadTime, setUploadTime] = useState(null);
  const [file, setFile] = useState(null);
  
  const handleFileChange = async (uploadedFile) => {
    if (!uploadedFile) return;
    
    // Check if file is PDF
    if (uploadedFile.type !== 'application/pdf' && !uploadedFile.name.toLowerCase().endsWith('.pdf')) {
      alert("Please upload a PDF file only.");
      return;
    }
    
    try {
      // Store file metadata and the file itself
      setFileName(uploadedFile.name);
      setFileSize(formatFileSize(uploadedFile.size));
      setFileType('pdf'); // Always PDF now
      setUploadTime(new Date().toLocaleTimeString());
      setFile(uploadedFile);
      setResumeText(''); // Clear any text since we're only using PDF files
    } catch (error) {
      console.error("Error reading file:", error);
      alert("Sorry, we couldn't read your file. Please try again.");
    }
  };
  
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  // Modified getFileTypeIcon to always return PDF icon
  const getFileTypeIcon = () => 'pdf';
  
  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 items-center">
  
      
      {/* File Upload / Drag & Drop Zone */}
      <div 
        className={`w-full bg-[rgba(16,185,129,0.1)] border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
          dragActive ? "border-primary bg-[rgba(16,185,129,0.2)]" : fileName ? "border-primary" : "border-secondary/40"
        }`}
        onClick={() => fileInputRef.current.click()}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,application/pdf" // Only allow PDF files
          onChange={(e) => handleFileChange(e.target.files[0])}
          disabled={isAnalyzing}
        />
        
        {fileName ? (
          <div className="flex flex-col items-center gap-4 text-center p-6 w-full max-w-md">
            {/* File uploaded state - PDF icon only */}
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-2">
              <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 18H17V16H7V18Z" fill="currentColor"/>
                <path d="M17 14H7V12H17V14Z" fill="currentColor"/>
                <path d="M7 10H11V8H7V10Z" fill="currentColor"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M6 2C4.34315 2 3 3.34315 3 5V19C3 20.6569 4.34315 22 6 22H18C19.6569 22 21 20.6569 21 19V9C21 5.13401 17.866 2 14 2H6ZM6 4H13V9H19V19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V5C5 4.44772 5.44772 4 6 4ZM15 4.10002C16.6113 4.4271 17.9413 5.52906 18.584 7H15V4.10002Z" fill="currentColor"/>
              </svg>
            </div>
            
            <div className="bg-white/30 backdrop-blur-sm rounded-lg p-4 w-full border border-primary/10">
              <p className="subhead text-primary mb-1 truncate">{fileName}</p>
              
              <div className="flex items-center justify-between mt-2 text-sm text-secondary">
                <div>Size: {fileSize}</div>
                <div>Uploaded at {uploadTime}</div>
              </div>
              
              <div className="mt-3 flex items-center justify-between">
                <div className="h-2 bg-primary/20 rounded-full overflow-hidden w-full">
                  <div className="h-full bg-primary rounded-full" style={{ width: '100%' }}></div>
                </div>
                <span className="ml-2 text-xs text-primary">100%</span>
              </div>
            </div>
            
            <p className="tag text-secondary mt-2 cursor-pointer hover:text-primary">
              Click or drag to replace file
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center p-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            
            <p className="subhead text-primary mb-1">Upload your resume</p>
            <p className="body-text text-secondary">Drag and drop your resume PDF or click to browse</p>
            <p className="tag text-secondary mt-2">Supports PDF files only</p>
          </div>
        )}
      </div>
      
      {/* Submit Button */}
      <button
        className={`px-8 py-3 rounded-lg font-medium transition-all w-full max-w-xs ${
          isAnalyzing || !fileName
            ? 'bg-secondary/20 text-secondary cursor-not-allowed'
            : 'bg-primary text-white hover:bg-primary/90'
        }`}
        onClick={() => onSubmit(resumeText, file)}
        disabled={isAnalyzing || !fileName}
      >
        {isAnalyzing ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin"></span>
            Analyzing Resume...
          </span>
        ) : (
          'Analyze My Resume'
        )}
      </button>
    </div>
  );
};

export default ResumeInput;
