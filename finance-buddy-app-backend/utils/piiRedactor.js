// utils/piiRedactor.js

/**
 * Redacts sensitive Personally Identifiable Information (PII) from the given text.
 * @param {string} text The raw input text (e.g. from bank statement OCR)
 * @returns {string} The sanitized text with PII replaced by tokens
 */
export function redactPII(text) {
  if (!text) return text;
  
  let redacted = text;
  
  // 1. Redact Emails
  redacted = redacted.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]');
  
  // 2. Redact Phone Numbers (international and local formats)
  redacted = redacted.replace(/(?:\+?\d{1,3}[- ]?)?\(?\d{3,4}\)?[- ]?\d{3}[- ]?\d{4}\b/g, '[REDACTED_PHONE]');
  
  // 3. Redact UPI IDs / Payment Handles
  redacted = redacted.replace(/\b[a-zA-Z0-9.\-_]+@(okhdfcbank|okaxis|okicici|paytm|ybl|sbi|postbank|upi|axl|ibi|federal|idbi|waaxis|waicici|payzapp)\b/gi, '[REDACTED_UPI]');
  
  // 4. Redact Indian PAN (Tax ID)
  redacted = redacted.replace(/\b[A-Z]{5}[0-9]{4}[A-Z]\b/gi, '[REDACTED_TAX_ID]');

  // 5. Redact US SSN
  redacted = redacted.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED_SSN]');

  // 6. Redact Indian Aadhaar Number (12 digits)
  redacted = redacted.replace(/\b\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, '[REDACTED_NATIONAL_ID]');

  // 7. Redact Bank Account / Card Numbers (9 to 18 digits)
  redacted = redacted.replace(/\b\d{9,18}\b/g, '[REDACTED_ACCOUNT_NO]');
  redacted = redacted.replace(/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, '[REDACTED_CARD_NO]');

  // 8. Redact Visa/MC/Amex/Rupay card references
  redacted = redacted.replace(/\b(visa|mastercard|amex|rupay|maestro)\s*(?:card)?\s*(?:xxxx[- ]*){0,3}\d{4}\b/gi, '[REDACTED_CARD_INFO]');

  // 9. Redact Transaction IDs / UTR / Reference numbers
  redacted = redacted.replace(/\b(?:UTR|Ref|IMPS|NEFT|Refno|Transaction ID|Txn ID|Reference Number)\s*[:.-]?\s*[A-Z0-9_\-/]{6,25}\b/gi, '[REDACTED_TXN_REF]');
  redacted = redacted.replace(/\b\d{12}\b/g, '[REDACTED_12DIGIT_REF]');

  // 10. Redact Names following salutations
  redacted = redacted.replace(/\b(mr|mrs|ms|dr|prof)\.?\s+[a-zA-Z']+(?:\s+[a-zA-Z']+){1,3}\b/gi, '[REDACTED_NAME]');

  // 11. Redact common header blocks that contain names/addresses/DOB
  redacted = redacted.replace(/(Name|Customer Name|Account Holder|Holder Name|Name of User)\s*[:=-]\s*[^\n]+/gi, '$1: [REDACTED_NAME]');
  redacted = redacted.replace(/(Address|Residency|Billing Address|Communication Address|Mailing Address)\s*[:=-]\s*[^\n]+/gi, '$1: [REDACTED_ADDRESS]');
  redacted = redacted.replace(/(?:DOB|Date of Birth|DOB\s*[:=-])\s*[:.-]?\s*\d{2}[-/]\d{2}[-/]\d{4}/gi, 'DOB: [REDACTED_DOB]');

  return redacted;
}
