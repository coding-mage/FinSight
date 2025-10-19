import Tesseract from 'tesseract.js';
import fs from 'fs';
//import pdfParse from 'pdf-parse';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

export async function extractTextFromFile(filePath) {
    console.log(filePath)
  const extension = path.extname(filePath).toLowerCase();
  
//   if (extension === '.jpg' || extension === '.jpeg' || extension === '.png') {
//     // Image file: Use OCR
//     const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
//     return text;
//   } else if (extension === '.pdf') {
    // PDF file: Parse text
    const fileBuffer = fs.readFileSync(filePath); // read YOUR uploaded file
    const data = await pdfParse(fileBuffer);
    console.log(data.text);
    return data.text; 
//   } else {
//     throw new Error('Unsupported file type. Please upload an image or PDF.');
//   }
}
