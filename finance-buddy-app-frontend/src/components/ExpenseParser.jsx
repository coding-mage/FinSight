// components/ExpenseParser.jsx
import React, { useState } from 'react';

const ExpenseParser = () => {
  const [file, setFile] = useState(null);
  const [parsedResult, setParsedResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return alert('Please select a file');

    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/ocr', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setParsedResult(data.parsed);
    } catch (err) {
      alert('Error uploading file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>🧾 Parse Expense from PDF</h2>
      <input type="file" accept=".pdf" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? 'Parsing...' : 'Upload & Parse'}
      </button>

      {parsedResult && (
        <div>
          <h4>Extracted Data:</h4>
          <pre>{JSON.stringify(parsedResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default ExpenseParser;
