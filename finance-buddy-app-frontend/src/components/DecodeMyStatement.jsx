import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/decodemystatement.css';
import 'chart.js/auto'; // Automatically register all components

const DecodeMyStatement = () => {
  const [file, setFile] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [selectedUpload, setSelectedUpload] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [filters, setFilters] = useState({ type: '', category: '', vendor: '' });
  const [chartParam, setChartParam] = useState('category');

  const token = localStorage.getItem('token');  // Or wherever you store the JWT token

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    const res = await axios.get('http://localhost:5050/api/statements', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    setUploads(res.data);
  };

  const handleFileChange = e => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('statement', file);
    const res = await axios.post('http://localhost:5050/api/statements/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      }
    });
    fetchStatement(res.data.statementId);
  };

  const fetchStatement = async id => {
    const res = await axios.get(`http://localhost:5050/api/statements/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    setTransactions(res.data.transactions);
    setSummary(res.data.summary);
    setSuggestions(res.data.suggestions);
  };

  const handleFilterChange = e => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const filteredTransactions = transactions.filter(t =>
    (!filters.type || t.type === filters.type) &&
    (!filters.category || t.category.toLowerCase().includes(filters.category.toLowerCase())) &&
    (!filters.vendor || t.vendor.toLowerCase().includes(filters.vendor.toLowerCase()))
  );

  const chartData = {
    labels: [...new Set(filteredTransactions.map(t => t[chartParam]))],
    datasets: [
      {
        data: [...new Set(filteredTransactions.map(t => t[chartParam]))].map(
          k => filteredTransactions.filter(t => t[chartParam] === k).reduce((sum, t) => sum + t.amount, 0)
        ),
        backgroundColor: ['#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8'],
      }
    ]
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Bank Statement Analyzer</h2>

      <div className="mb-3">
        <input type="file" onChange={handleFileChange} className="form-control" />
        <br />
        <button onClick={handleUpload} className="custom-upload-btn" disabled={!file}>Upload and Analyze</button>
      </div>

      <div className="mb-3">
        <label>Select Previous Upload:</label>
        <select
          className="form-select"
          onChange={e => {
            setSelectedUpload(e.target.value);
            fetchStatement(e.target.value);
          }}
          value={selectedUpload}
        >
          <option value=''>-- Select Upload --</option>
          {uploads.map(u => (
            <option key={u._id} value={u._id}>{u.fileName}</option>
          ))}
        </select>
      </div>

      {transactions.length > 0 && (
        <>
          <div className="filter-section mb-3 p-3 border rounded ">
            <div className="row">
              <div className="col-md-4">
                <label>Type:</label>
                <select name="type" className="form-select" onChange={handleFilterChange}>
                  <option value="">All</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div className="col-md-4">
                <label>Category:</label>
                <input
                  name="category"
                  className="form-control"
                  onChange={handleFilterChange}
                  placeholder="e.g. Food"
                />
              </div>
              <div className="col-md-4">
                <label>Vendor:</label>
                <input
                  name="vendor"
                  className="form-control"
                  onChange={handleFilterChange}
                  placeholder="e.g. Amazon"
                />
              </div>
            </div>
          </div>

          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Date</th>
                <th>Vendor</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(txn => (
                <tr key={txn._id} className={txn.type === 'income' ? 'income-row' : 'expense-row'}>
                  <td>{new Date(txn.date).toLocaleDateString()}</td>
                  <td>{txn.vendor}</td>
                  <td>{txn.category}</td>
                  <td>₹{txn.amount}</td>
                  <td>{txn.type}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="my-4">
            <label>Chart By:</label>
            <select className="form-select w-25" onChange={e => setChartParam(e.target.value)} value={chartParam}>
              <option value="category">Category</option>
              <option value="vendor">Vendor</option>
              <option value="type">Type</option>
            </select>
            <div className="chart-container mt-3">
              <Pie data={chartData} />
            </div>
          </div>

          <div className="mt-4">
            <h5>Summary</h5>
            <p className="summary-text">{summary}</p>
            <h5>Suggestions</h5>
            {suggestions ? (
              <ul>
                {suggestions.split('\n').map((line, idx) => {
                  const cleanLine = line.replace(/\*/g, '').trim();
                  return cleanLine ? <li key={idx}><strong>{cleanLine}</strong></li> : null;
                })}
              </ul>
            ) : (
              <p>No suggestions available.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DecodeMyStatement;
