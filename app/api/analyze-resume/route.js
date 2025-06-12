import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    // Get formData from request
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    let text = '';
    let extractionMethod = 'unknown';

    try {
      // Check if this is a PDF file
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      
      if (isPdf) {
        console.log('PDF detected - using pdf-parse with special options for Canva PDFs');
        
        // Get file as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        try {
          // Use pdf-parse with special options for Canva PDFs
          const pdfOptions = {
            pagerender: renderPage, // Custom page renderer function
            max: 0,                 // No limit on pages processed
            version: 'v2.0.550'     // Use a specific version
          };
          
          const pdfData = await pdfParse(buffer, pdfOptions);
          
          if (pdfData && pdfData.text && pdfData.text.length > 100) {
            text = pdfData.text;
            extractionMethod = 'pdf-parse-enhanced';
            console.log(`Successfully extracted ${text.length} characters from PDF`);
          } else {
            console.log('PDF parse yielded minimal text, trying alternate method');
          }
        } catch (pdfError) {
          console.error('PDF parsing error:', pdfError);
          // Continue to fallback methods
        }
        
        // If no text was extracted, try a simpler approach
        if (!text || text.trim().length < 100 || text.includes('endobj') || text.includes('endstream')) {
          console.log('Standard PDF parsing failed or returned invalid content, trying fallback method');
          
          // Try an alternate approach bypassing problematic PDF structure
          try {
            const alternateText = extractTextFromBuffer(buffer);
            if (alternateText && alternateText.length > text.length) {
              text = alternateText;
              extractionMethod = 'buffer-extraction';
              console.log(`Extracted ${text.length} characters using buffer method`);
            }
          } catch (alternateError) {
            console.error('Buffer extraction failed:', alternateError);
          }
        }
      } else {
        // For non-PDF files, use standard text extraction
        text = await file.text();
        extractionMethod = 'standard-text';
        console.log(`Extracted ${text.length} characters using standard text extraction`);
      }
      
      // If we still don't have usable text, inform the user
      if (!text || text.trim().length < 50 || text.includes('endobj') || text.includes('endstream')) {
        return NextResponse.json(
          { error: 'This PDF appears to contain text as images or in a format that cannot be extracted. Please try uploading a text-based PDF or a plain .txt file instead.' },
          { status: 400 }
        );
      }

    } catch (fileError) {
      console.error('Error reading file:', fileError);
      return NextResponse.json(
        { error: 'Could not read file content. Please try uploading as plain text (.txt) instead.' },
        { status: 400 }
      );
    }
    
    // Clean up text to remove PDF artifacts and non-printable characters
    text = cleanText(text);

    // Log some info about the extracted text
    console.log(`Text extracted via ${extractionMethod}. Length: ${text.length} characters`);
    console.log('First 200 characters:', text.substring(0, 200).replace(/\n/g, ' '));

    // Process the text with OpenAI
    return await processResumeText(text);
  } catch (error) {
    console.error('Error processing resume:', error);
    return NextResponse.json(
      { error: `Failed to process resume: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// Enhanced text cleaning for PDFs
function cleanText(text) {
  return text
    .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '') // Remove control characters
    .replace(/[\uFFF0-\uFFFF]/g, '') // Remove non-characters
    .replace(/\uFEFF/g, '') // Remove BOM
    .replace(/endobj|endstream|obj|stream|xref|trailer|startxref/g, ' ') // Remove PDF structure markers
    .replace(/\s{2,}/g, ' ') // Replace multiple spaces with single space
    .replace(/^\s+/, '') // Trim leading space
    .replace(/\s+$/, '') // Trim trailing space
    .replace(/\r\n/g, '\n') // Normalize newlines
    .replace(/\f/g, '\n\n'); // Replace form feeds with newlines
}

// Specialized function to extract text from buffer for problematic PDFs
function extractTextFromBuffer(buffer) {
  // Simple text extraction from buffer - skip PDF structure elements
  const text = buffer.toString('utf-8');
  
  // Extract meaningful text fragments
  let textFragments = [];
  const textRegex = /\(([\x20-\x7E\s]{3,})\)/g; // Match sequences of printable ASCII in parentheses
  let match;
  
  while ((match = textRegex.exec(text)) !== null) {
    if (match[1] && match[1].trim().length > 3) {
      textFragments.push(match[1].trim());
    }
  }
  
  return textFragments.join(' ');
}

// Custom page renderer for pdf-parse to handle Canva PDFs
function renderPage(pageData) {
  let render_options = {
    normalizeWhitespace: true,
    disableCombineTextItems: false
  };
  
  return pageData.getTextContent(render_options)
    .then(function(textContent) {
      let text = '';
      let lastY = -1;
      
      for (let item of textContent.items) {
        if (lastY !== item.transform[5]) {
          text += '\n';
          lastY = item.transform[5];
        }
        text += item.str;
      }
      
      return text;
    });
}

// Restore the processResumeText function (uncomment and ensure it's operational)
async function processResumeText(text) {
  try {
    // Enhanced system prompt for better section detection and buzzword suggestions
    const systemPrompt = `
      You are an AI resume analyzer specializing in detailed section detection and analysis.

      TASK:
      1. First, carefully analyze the resume text to identify ALL existing sections such as:
         - Summary/Objective/Profile
         - Experience/Work History
         - Education
         - Skills/Technical Skills
         - Projects
         - Certifications/Licenses
         - Awards/Honors
         - Publications
         - Languages
         - Volunteer Work
         - References
         - Any other sections present in the resume

      2. For EACH identified section:
         - Extract the EXACT original text (preserve formatting where possible)
         - Count words in that section
         - Assess improvement priority (High, Medium, Low)
         - Create a concise but detailed rewrite that improves the section
         - Provide 2 example alternatives from strong resumes
         - List 3-5 specific questions to improve clarity and impact

      3. Identify resume-wide issues:
         - List all buzzwords and jargon with their counts
         - For EACH buzzword, provide 3 specific improvement suggestions
         - Calculate a "vibe score" from 1-100
         - Assign a personality label that captures the resume style
         - Write a witty "hot take" comment about the resume

      RESPONSE FORMAT:
      Return a JSON with these exact keys:
      - vibeScore (number)
      - personalityLabel (string)
      - hotTake (string)
      - buzzwords (array of strings)
      - buzzwordCounts (object mapping buzzwords to counts)
      - buzzwordSuggestions (object mapping each buzzword to an array of 3 specific improvement suggestions)
      - sections (array of section objects)

      For each section object include:
      - title (string - the section name)
      - originalText (string - the exact text from that section)
      - wordCount (number)
      - improvement (string: "High", "Medium", or "Low")
      - rewrite (string)
      - examples (array of {title, text} objects)
      - questions (array of strings)

      Keep your response strictly JSON-formatted with no additional text or explanation outside the JSON structure.
      IMPORTANT: Make sure your response includes ALL the sections you can identify from the resume, not just predetermined categories.
    `;

    // Limit text length more aggressively to avoid token issues
    const maxTextLength = 7000;
    const truncatedText = text.length > maxTextLength 
      ? text.substring(0, maxTextLength) + "... [content truncated due to length]"
      : text;

    console.log(`Text length for OpenAI: ${truncatedText.length} characters`);

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-16k',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Here's the resume text to analyze in detail:\n\n${truncatedText}` }
      ],
      temperature: 0.5,
      max_tokens: 4000,
    });

    const aiResponseText = response.choices[0].message.content.trim();
    console.log('OpenAI response received. Starting JSON parsing...');
    
    // Improved JSON extraction and parsing with better error handling
    try {
      // First try direct JSON parsing
      try {
        const analysisResult = JSON.parse(aiResponseText);
        analysisResult.hashtags = generateHashtags(analysisResult.personalityLabel);
        console.log('Successfully parsed JSON directly');
        return NextResponse.json(analysisResult);
      } catch (directParseError) {
        console.log('Direct JSON parsing failed, attempting extraction:', directParseError.message);
        
        // Log a sample of the text to help debugging
        console.log('Response sample:', aiResponseText.substring(0, 200) + '...');
      }

      // Try to find and extract valid JSON using a better regex
      // This looks for the outermost balanced JSON object
      const jsonStartPos = aiResponseText.indexOf('{');
      const jsonEndPos = aiResponseText.lastIndexOf('}');
      
      if (jsonStartPos >= 0 && jsonEndPos > jsonStartPos) {
        const extractedJson = aiResponseText.substring(jsonStartPos, jsonEndPos + 1);
        console.log(`Found JSON object from pos ${jsonStartPos} to ${jsonEndPos}`);
        
        // More extensive JSON cleaning
        let sanitizedJson = extractedJson
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remove control characters
          .replace(/\\'/g, "'")        // Fix single quotes
          .replace(/\\"/g, '"')        // Fix double quotes
          .replace(/\n/g, '\\n')       // Handle newlines
          .replace(/\r/g, '\\r')       // Handle carriage returns
          .replace(/\t/g, '\\t')       // Handle tabs
          .replace(/\\([^"'\\\/bfnrt])/g, '$1'); // Remove invalid escapes
        
        // Add additional validation to check JSON structure
        if (sanitizedJson.startsWith('{') && sanitizedJson.endsWith('}')) {
          try {
            const analysisResult = JSON.parse(sanitizedJson);
            
            // Validate that we have the expected fields
            if (!analysisResult.vibeScore) analysisResult.vibeScore = 60;
            if (!analysisResult.personalityLabel) analysisResult.personalityLabel = "Resume Submitter";
            if (!analysisResult.sections) analysisResult.sections = [];
            if (!analysisResult.buzzwords) analysisResult.buzzwords = [];
            if (!analysisResult.buzzwordCounts) analysisResult.buzzwordCounts = {};
            
            analysisResult.hashtags = generateHashtags(analysisResult.personalityLabel);
            console.log('Successfully parsed extracted JSON');
            return NextResponse.json(analysisResult);
          } catch (extractionError) {
            console.error('Failed to parse extracted JSON:', extractionError.message);
            // Continue to fallback instead of throwing
          }
        }
      }
      
      // If all parsing attempts fail, use a structured fallback response
      console.log('All JSON parsing attempts failed, using fallback response');
      return createFallbackResponse(text);
      
    } catch (jsonError) {
      console.error('JSON handling error:', jsonError);
      return createFallbackResponse(text);
    }
  } catch (error) {
    console.error('Error in OpenAI analysis:', error);
    return NextResponse.json(
      { error: 'Failed to analyze resume: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}

// Helper function to create a fallback response
function createFallbackResponse(text) {
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  
  const fallbackResult = {
    vibeScore: 65,
    personalityLabel: "Resume Enthusiast",
    hotTake: "Your resume has potential, but could use more polish and precision.",
    buzzwords: [],
    buzzwordCounts: {},
    buzzwordSuggestions: {},
    sections: [
      {
        title: "Resume Content",
        originalText: text.substring(0, 300) + "...",
        wordCount,
        improvement: "Medium",
        rewrite: "We couldn't fully analyze your resume structure, but we can see it has approximately " + 
                wordCount + " words. Consider organizing it into clear sections with strong action verbs.",
        examples: [
          {title: "Professional Format", text: "Use clear headings like 'Experience', 'Education', and 'Skills' with consistent formatting."}
        ],
        questions: [
          "Is your resume organized with clear section headings?",
          "Have you used quantifiable achievements where possible?",
          "Is your contact information prominently displayed?"
        ]
      }
    ],
    hashtags: ["#ResumeVibes", "#CareerAura", "#ProfessionalEnergy"]
  };
  
  return NextResponse.json(fallbackResult);
}
