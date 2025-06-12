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
    // Enhanced system prompt with STRONGER emphasis on section extraction
    const systemPrompt = `
      You are an AI resume analyzer specializing in detailed section detection and analysis.

      TASK:
      1. CRITICAL: First, CAREFULLY analyze the resume text to identify ALL existing sections such as:
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

         Look for section headers, paragraph breaks, formatting patterns. Even if sections don't have clear headers,
         identify logical content groupings and assign appropriate section titles.

      2. For EACH identified section:
         - Preserve the EXACT original text including formatting and whitespace
         - Count words in that section precisely
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

      RESPONSE FORMAT - YOU MUST FOLLOW THIS EXACTLY:
      Return ONLY a JSON object with these exact keys:
      - vibeScore (number)
      - personalityLabel (string)
      - hotTake (string)
      - buzzwords (array of strings)
      - buzzwordCounts (object mapping buzzwords to counts)
      - buzzwordSuggestions (object mapping each buzzword to an array of suggestions)
      - sections (array of section objects)

      For each section object include these exact keys:
      - title (string - the section name)
      - originalText (string - the exact text from that section)
      - wordCount (number)
      - improvement (string: "High", "Medium", or "Low")
      - rewrite (string)
      - examples (array of {title, text} objects)
      - questions (array of strings)

      IMPORTANT REQUIREMENTS:
      1. Your entire response must be valid JSON. Do not include any text before or after the JSON.
      2. Make sure your response includes ALL the sections you identify from the resume, not just predetermined categories.
      3. If a section has subsections, include each subsection as its own section object.
      4. You MUST extract at least 3-4 distinct sections from any resume, even if they aren't clearly labeled.
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
        { role: 'user', content: `Here's the resume text to analyze in detail. Extract ALL sections even if they aren't clearly labeled:\n\n${truncatedText}` }
      ],
      temperature: 0.4, // Lower temperature for more consistent extraction
      max_tokens: 4000,
    });

    const aiResponseText = response.choices[0].message.content.trim();
    console.log('OpenAI response received. Starting JSON parsing...');
    
    // Log a sample of the response for debugging
    console.log('Response sample:', aiResponseText.substring(0, 100) + '...');
    
    // Improved robust JSON parsing with fallback
    try {
      // First try direct JSON parsing
      try {
        const analysisResult = JSON.parse(aiResponseText);
        
        // Validate section extraction
        if (!analysisResult.sections || analysisResult.sections.length < 2) {
          console.log('Insufficient sections detected, trying alternative extraction');
          throw new Error('Insufficient sections');
        }
        
        analysisResult.hashtags = generateHashtags(analysisResult.personalityLabel);
        console.log(`Successfully parsed JSON directly with ${analysisResult.sections.length} sections`);
        return NextResponse.json(analysisResult);
      } catch (directParseError) {
        console.log('Direct JSON parsing failed, attempting extraction:', directParseError.message);
      }

      // Try to find JSON using string indices instead of regex
      const jsonStartPos = aiResponseText.indexOf('{');
      const jsonEndPos = aiResponseText.lastIndexOf('}');
      
      if (jsonStartPos >= 0 && jsonEndPos > jsonStartPos) {
        const extractedJson = aiResponseText.substring(jsonStartPos, jsonEndPos + 1);
        console.log(`Found JSON from position ${jsonStartPos} to ${jsonEndPos}`);
        
        // More thorough JSON cleaning
        let sanitizedJson = extractedJson
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remove control characters
          .replace(/\\'/g, "'")        // Fix single quotes
          .replace(/\\"/g, '"')        // Fix double quotes
          .replace(/\n/g, ' ')         // Replace newlines with spaces
          .replace(/\r/g, ' ')         // Replace carriage returns with spaces
          .replace(/\t/g, ' ')         // Replace tabs with spaces
          .replace(/\\/g, '\\\\')      // Escape backslashes
          .replace(/"\s+:/g, '":')     // Fix spaces between quotes and colons
          .replace(/:\s+"/g, ':"');    // Fix spaces between colons and quotes
        
        try {
          const analysisResult = JSON.parse(sanitizedJson);
          
          // Ensure required fields exist
          if (!analysisResult.vibeScore) analysisResult.vibeScore = 65;
          if (!analysisResult.personalityLabel) analysisResult.personalityLabel = "Resume Enthusiast";
          
          // Ensure sections are properly extracted
          if (!analysisResult.sections || analysisResult.sections.length < 2) {
            console.log('Extracted JSON has insufficient sections, attempting forced section extraction');
            analysisResult.sections = forceSectionExtraction(text);
          }
          
          if (!analysisResult.buzzwords) analysisResult.buzzwords = extractBuzzwords(text);
          if (!analysisResult.buzzwordCounts) analysisResult.buzzwordCounts = {};
          if (!analysisResult.buzzwordSuggestions) analysisResult.buzzwordSuggestions = {};
          
          analysisResult.hashtags = generateHashtags(analysisResult.personalityLabel);
          console.log(`Successfully parsed extracted JSON with ${analysisResult.sections.length} sections`);
          return NextResponse.json(analysisResult);
        } catch (extractionError) {
          console.error('Failed to parse extracted JSON:', extractionError.message);
        }
        
        // If we got this far, all parsing attempts failed - use fallback
        return createFallbackResponse(text);
        
      } 
    } catch (error) {
      console.error('Error in OpenAI analysis:', error);
      return NextResponse.json(
        { 
          error: 'Failed to analyze resume. We apologize for the inconvenience.',
          details: error.message 
        },
        { status: 200 } // Return 200 instead of 500 to avoid error display
      );
    }
  } catch (error) {
    console.error('Error in OpenAI analysis:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze resume. We apologize for the inconvenience.',
        details: error.message 
      },
      { status: 200 } // Return 200 instead of 500 to avoid error display
    );
  }
}

// Function to extract sections manually as a fallback
function forceSectionExtraction(text) {
  console.log('Performing manual section extraction');
  
  // Basic pattern matching to find potential sections
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  const sections = [];
  let currentSection = null;
  let currentContent = [];
  
  // Common section headers in resumes
  const sectionPatterns = [
    /education|academic/i,
    /experience|employment|work history/i,
    /skills|proficiencies|competencies/i,
    /summary|profile|objective/i,
    /projects|portfolio/i,
    /certifications|licenses/i,
    /awards|honors|achievements/i,
    /publications|research/i,
    /languages|language proficiency/i,
    /volunteer|community/i,
    /references|recommendations/i,
    /interests|hobbies/i
  ];
  
  // Process lines to extract sections
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Check if this line looks like a section header
    const isHeader = 
      (line.length < 35 && /[A-Z]/.test(line[0]) && line === line.toUpperCase()) || // ALL CAPS headers
      sectionPatterns.some(pattern => pattern.test(line)) ||  // Matches common section names
      (line.length < 30 && line.endsWith(':')) ||            // Lines ending with colon
      (line.length < 30 && !line.includes(' ')); // Single words that might be headers
    
    if (isHeader || i === lines.length - 1) {
      // Save previous section if we have one
      if (currentSection) {
        const content = currentContent.join('\n');
        sections.push({
          title: currentSection,
          originalText: content,
          wordCount: content.split(/\s+/).filter(Boolean).length,
          improvement: "Medium",
          rewrite: `Consider enhancing this section with more specific achievements and metrics.`,
          examples: [
            {title: "Example Format", text: "Use bullet points to highlight key achievements."},
            {title: "Example Content", text: "Quantify results where possible."}
          ],
          questions: [
            "Could you add specific metrics to quantify your achievements?",
            "Have you included relevant keywords for this position?",
            "Can you demonstrate the impact of your work more clearly?"
          ]
        });
      }
      
      // Start a new section
      if (i < lines.length - 1) {
        currentSection = line;
        currentContent = [];
      } else {
        // Last line - add to current content
        currentContent.push(line);
      }
    } else {
      // Add line to current section content
      currentContent.push(line);
      
      // If no section has been identified yet but we have content,
      // create a default section
      if (!currentSection && currentContent.length === 3) {
        currentSection = "Profile/Summary";
      }
    }
  }
  
  // If we have no sections, create at least one
  if (sections.length === 0) {
    sections.push({
      title: "Resume Content",
      originalText: text.substring(0, 500) + (text.length > 500 ? "..." : ""),
      wordCount: text.split(/\s+/).filter(Boolean).length,
      improvement: "Medium",
      rewrite: "Consider organizing your resume into clearly labeled sections.",
      examples: [
        {title: "Standard Format", text: "Include dedicated sections for Experience, Education, and Skills at minimum."},
        {title: "Modern Approach", text: "Consider adding a brief Professional Summary at the top."}
      ],
      questions: [
        "How could you better organize your information into distinct sections?",
        "Are you highlighting your most relevant qualifications?",
        "Have you clearly labeled each section of your resume?"
      ]
    });
  }
  
  return sections;
}

// Function to extract common buzzwords
function extractBuzzwords(text) {
  const commonBuzzwords = [
    'synergy', 'dynamic', 'proactive', 'leverage', 'innovative', 'solution',
    'strategic', 'results-driven', 'detail-oriented', 'team player', 'motivated',
    'passionate', 'excellent communication', 'self-starter', 'creative', 'leadership',
    'responsible for', 'successfully', 'experienced', 'managed', 'developed'
  ];
  
  return commonBuzzwords.filter(word => 
    new RegExp('\\b' + word + '\\b', 'i').test(text)
  );
}

// Helper function to create a fallback response
function createFallbackResponse(text) {
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  
  console.log('Using fallback response mechanism');
  
  const fallbackResult = {
    vibeScore: 65,
    personalityLabel: "Resume Enthusiast",
    hotTake: "Your resume has some great content, but might benefit from a bit more structure and clarity.",
    buzzwords: [],
    buzzwordCounts: {},
    buzzwordSuggestions: {},
    sections: [
      {
        title: "Resume Overview",
        originalText: text.substring(0, 300) + "...",
        wordCount: wordCount,
        improvement: "Medium",
        rewrite: "We've detected approximately " + wordCount + " words in your resume. Consider organizing it into clearly defined sections with strong action verbs and specific achievements.",
        examples: [
          {title: "Professional Format", text: "Use clear headings and consistent formatting with bullets for readability."},
          {title: "Achievement Focus", text: "Quantify your accomplishments with metrics where possible."}
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

function generateHashtags(personalityLabel) {
  const defaultHashtags = ["#ResumeVibes", "#CareerAura", "#ProfessionalEnergy"];
  
  // Generate custom hashtags based on personality label
  if (!personalityLabel) return defaultHashtags;
  
  const customHashtags = [];
  
  // Create hashtag from personality label
  const labelHashtag = "#" + personalityLabel.replace(/\s+/g, "");
  customHashtags.push(labelHashtag);
  
  // Add some context-specific hashtags based on personality types
  if (/creative|innovat|design/i.test(personalityLabel)) {
    customHashtags.push("#CreativeForce", "#InnovationMindset");
  } else if (/tech|engineer|develop/i.test(personalityLabel)) {
    customHashtags.push("#TechTalent", "#CodeCrafted");
  } else if (/leader|manage|execut/i.test(personalityLabel)) {
    customHashtags.push("#LeadershipDNA", "#ExecutivePresence");
  }
  
  // Combine custom hashtags with defaults, ensuring we return at least 3
  return [...new Set([...customHashtags, ...defaultHashtags])].slice(0, 5);
}
