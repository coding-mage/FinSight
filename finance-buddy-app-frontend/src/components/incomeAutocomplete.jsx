// components/IncomeAutocomplete.jsx
import React, { useState } from 'react';

const IncomeAutocomplete = () => {
  const [partialData, setPartialData] = useState({
    source: '',
    amount: '',
    date: '',
    category: '',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setPartialData({ ...partialData, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/ai/autocomplete-income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partialData),
      });
      const data = await res.json();
      setResult(data.completed);
    } catch (err) {
      alert('Error completing data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>💰 Autocomplete Income</h2>
      <input name="source" placeholder="Source" onChange={handleChange} />
      <input name="amount" placeholder="Amount" onChange={handleChange} />
      <input name="date" placeholder="Date" onChange={handleChange} />
      <input name="category" placeholder="Category" onChange={handleChange} />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Thinking...' : 'Autocomplete'}
      </button>

      {result && (
        <div>
          <h4>Completed:</h4>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default IncomeAutocomplete;
