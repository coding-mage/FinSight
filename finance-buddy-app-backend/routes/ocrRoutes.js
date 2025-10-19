import express from 'express';
import Tesseract from 'tesseract.js';
import multer from 'multer';
import fs from 'fs';
import { analyzeOCRText } from '../services/geminiService.js';  // <--- Import this
import { extractTextFromFile } from '../services/extractTextFromFile.js';
import { analyzeBankStatementText } from '../services/analyzeBankStatementText.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/ocr', upload.single('image'), async (req, res) => {
  try {
    const { path } = req.file;

    const { data: { text: ocrText } } = await Tesseract.recognize(
      path,
      'eng'
    );

    fs.unlinkSync(path); // delete temp file

    // Send OCR text to Gemini for structured parsing
    console.log(ocrText);
    const structuredData = await analyzeOCRText(ocrText);

    res.json({ ocrText, structuredData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to process OCR', error: error.message });
  }
});


router.post('/bank-ocr', upload.single('file'), async (req, res) => {
  try {
    console.log(req.path);
    const { path } = req.file;
    let extractedText = await extractTextFromFile(path);
    // Add pipe after every date (dd/mm/yy)
    extractedText = extractedText.replace(/(\d{2}\/\d{2}\/\d{2})/g, '$1|');

    // Add pipe after every amount (number.number pattern)
    extractedText = extractedText.replace(/(\d{1,3}(?:,\d{3})*\.\d{2})/g, '$1|');

    const expenses = await analyzeBankStatementText(extractedText);

    res.json({ success: true, expenses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;