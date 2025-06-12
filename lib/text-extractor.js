/**
 * Simple text extraction utility
 * This is a fallback for server-side environments where browser APIs aren't available
 */

/**
 * Clean text to remove problematic characters
 * @param {string} text - Text to clean
 * @returns {string} Cleaned text
 */
export function cleanText(text) {
  if (!text) return '';
  
  return text
    .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '') // Remove control characters
    .replace(/[\uFFF0-\uFFFF]/g, '') // Remove non-characters
    .replace(/\uFEFF/g, '') // Remove BOM
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\t/g, '    '); // Replace tabs with spaces
}

/**
 * Extract readable text from a buffer
 * @param {Buffer} buffer - Buffer containing file data
 * @returns {string} Extracted text
 */
export function extractTextFromBuffer(buffer) {
  try {
    // Try UTF-8 first
    const text = buffer.toString('utf-8');
    return cleanText(text);
  } catch (error) {
    console.error('Error extracting text from buffer:', error);
    return '';
  }
}
