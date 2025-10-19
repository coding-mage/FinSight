import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import Tesseract from 'tesseract.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import { analyzeOCRText } from '../services/geminiService.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/parse', upload.single('file'), async (req, res) => {
  try {
    const { path: filePath, mimetype } = req.file;

    let extractedText = '';

    if (mimetype === 'application/pdf') {
      // Handle PDF
      const pdfBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(pdfBuffer);
      extractedText = pdfData.text;
    } else if (mimetype.startsWith('image/')) {
      // Handle image
      const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
      extractedText = text;
    } else {
      throw new Error('Unsupported file type');
    }

    fs.unlinkSync(filePath); // delete after processing

    const parsed = await analyzeOCRText(extractedText);
    res.json({ parsed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process file', message: err.message });
  }
});

export default router;
