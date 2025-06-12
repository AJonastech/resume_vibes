import { GlobalWorkerOptions } from 'pdfjs-dist';
import * as pdfjsLib from 'pdfjs-dist';
// Configure the worker for PDF.js
export function configurePdfWorker() {
  // Check if window is defined (browser environment)
  if (typeof window !== 'undefined' && typeof window.navigator !== 'undefined') {
  
    GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }
}
