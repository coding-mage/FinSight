import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pie, Line } from 'react-chartjs-2';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/decodemystatement.css';
import 'chart.js/auto'; // Automatically register all Chart.js components

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

const DecodeMyStatement = () => {
  const [file, setFile] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [selectedUpload, setSelectedUpload] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [filters, setFilters] = useState({ type: '', category: '', vendor: '' });
  const [chartParam, setChartParam] = useState('category');
  
  // New States for Tab Interface and Features
  const [activeTab, setActiveTab] = useState('summary');
  
  // Chat feature states
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Cash flow projection states
  const [cashFlowData, setCashFlowData] = useState(null);
  const [cashFlowLoading, setCashFlowLoading] = useState(false);

  // Smart Budget Planner states
  const [budgetData, setBudgetData] = useState(null);
  const [budgetLoading, setBudgetLoading] = useState(false);

  const token = localStorage.getItem('token'); 

  useEffect(() => {
    fetchUploads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch data on tab changes
  useEffect(() => {
    if (selectedUpload) {
      if (activeTab === 'cashflow' && !cashFlowData) {
        fetchCashFlow(selectedUpload);
      } else if (activeTab === 'budget' && !budgetData) {
        fetchBudget(selectedUpload);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedUpload]);

  const fetchUploads = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/statements`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUploads(res.data);
    } catch (err) {
      console.error('Error fetching uploads list:', err);
    }
  };

  const handleFileChange = e => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('statement', file);
    
    try {
      const res = await axios.post(`${API_URL}/api/statements/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      setSelectedUpload(res.data.statementId);
      fetchStatement(res.data.statementId);
      fetchUploads(); // Refresh list
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to parse statement.');
    }
  };

  const fetchStatement = async id => {
    try {
      const res = await axios.get(`${API_URL}/api/statements/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setTransactions(res.data.transactions);
      setSummary(res.data.summary);
      setSuggestions(res.data.suggestions);
      
      // Reset additional features tabs
      setActiveTab('summary');
      setChatMessages([
        { sender: 'ai', text: `Hello! I'm your personal financial advisor. Ask me anything about your statement "${res.data.fileName}".` }
      ]);
      setCashFlowData(null);
      setBudgetData(null);
    } catch (err) {
      console.error('Error fetching statement details:', err);
    }
  };

  const fetchCashFlow = async id => {
    setCashFlowLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/statements/${id}/cashflow`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCashFlowData(res.data);
    } catch (err) {
      console.error('Error fetching cash flow data:', err);
    } finally {
      setCashFlowLoading(false);
    }
  };

  const fetchBudget = async id => {
    setBudgetLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/statements/${id}/budget`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setBudgetData(res.data);
    } catch (err) {
      console.error('Error fetching budget recommendation:', err);
    } finally {
      setBudgetLoading(false);
    }
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { sender: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/statements/${selectedUpload}/chat`, {
        message: chatInput
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setChatMessages(prev => [...prev, { sender: 'ai', text: res.data.reply }]);
    } catch (err) {
      console.error('Chat error:', err);
      setChatMessages(prev => [...prev, { sender: 'ai', text: 'Error: Failed to fetch advisor reply.' }]);
    } finally {
      setChatLoading(false);
    }
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

  // eslint-disable-next-line no-unused-vars
  const renderStyledText = (text) => {
    if (!text) return '';
    const parts = text.split(/(\*\*.*?\*\*)/); // split by **...**
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const content = part.slice(2, -2); // remove **
        return (
          <span key={idx} style={{ color: "#00ffe7", fontWeight: "bold" }}>
            {content}
          </span>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center header-title">Bank Statement Analyzer</h2>

      {/* Upload Section */}
      <div className="mb-4 card p-4 borderrounded select-card">
        <label className="form-label font-weight-bold">Upload New Bank Statement (PDF):</label>
        <div className="input-group">
          <input type="file" onChange={handleFileChange} className="form-control" />
          <button onClick={handleUpload} className="custom-upload-btn btn btn-primary" disabled={!file}>Upload and Analyze</button>
        </div>
      </div>

      {/* Dropdown Section */}
      <div className="mb-4 card p-4 borderrounded select-card">
        <label className="form-label font-weight-bold">Select Previous Upload:</label>
        <select
          className="form-select"
          onChange={e => {
            setSelectedUpload(e.target.value);
            if (e.target.value) {
              fetchStatement(e.target.value);
            } else {
              setTransactions([]);
            }
          }}
          value={selectedUpload}
        >
          <option value=''>-- Select Upload --</option>
          {uploads.map(u => (
            <option key={u._id} value={u._id}>{u.fileName}</option>
          ))}
        </select>
      </div>

      {/* Tab Interface */}
      {transactions.length > 0 && (
        <>
          <ul className="nav nav-tabs mb-4 custom-tabs">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'summary' ? 'active' : ''}`} 
                onClick={() => setActiveTab('summary')}
              >
                📊 Summary & Details
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'chat' ? 'active' : ''}`} 
                onClick={() => setActiveTab('chat')}
              >
                💬 Ask Advisor
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'cashflow' ? 'active' : ''}`} 
                onClick={() => setActiveTab('cashflow')}
              >
                📈 Cash Flow Projection
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'budget' ? 'active' : ''}`} 
                onClick={() => setActiveTab('budget')}
              >
                🎯 Smart Budget Planner
              </button>
            </li>
          </ul>

          {/* TAB CONTENT: SUMMARY & DETAILS */}
          {activeTab === 'summary' && (
            <div className="tab-pane-content fade-in">
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

              <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
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
              </div>

              <div className="my-4">
                <label className="form-label font-weight-bold">Chart Category By:</label>
                <select className="form-select w-25" onChange={e => setChartParam(e.target.value)} value={chartParam}>
                  <option value="category">Category</option>
                  <option value="vendor">Vendor</option>
                  <option value="type">Type</option>
                </select>
                <div className="chart-container mt-3 d-flex justify-content-center">
                  <div style={{ width: '300px', height: '300px' }}>
                    <Pie data={chartData} />
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 border rounded insight-card bg-dark text-white">
                <h5>Summary Insights</h5>
                <p className="summary-text">{summary}</p>
                <h5 className="mt-3">Suggestions for Improvement</h5>
                {suggestions ? (
                  <ul>
                    {suggestions.split('\n').map((line, idx) => {
                      const cleanLine = line.replace(/[*#\-\d.]/g, '').trim();
                      return cleanLine ? <li key={idx} className="mb-2">{cleanLine}</li> : null;
                    })}
                  </ul>
                ) : (
                  <p>No suggestions available.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB CONTENT: ADVISOR CHAT */}
          {activeTab === 'chat' && (
            <div className="tab-pane-content fade-in chat-section p-4 border rounded mb-4" style={{ backgroundColor: '#1e1e2f', color: '#fff' }}>
              <h4 className="mb-3">💬 Chat with Your Bank Statement</h4>
              <div className="chat-window mb-3 p-3" style={{ height: '350px', overflowY: 'auto', border: '1px solid #3e3e56', borderRadius: '5px', backgroundColor: '#12121d' }}>
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`d-flex mb-3 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                    <div className="p-3 rounded shadow-sm" style={{ 
                      maxWidth: '75%', 
                      backgroundColor: msg.sender === 'user' ? '#007bff' : '#282a36', 
                      color: '#fff',
                      whiteSpace: 'pre-wrap',
                      borderRadius: '12px'
                    }}>
                      <div className="small text-muted mb-1">{msg.sender === 'user' ? 'You' : 'Advisor'}</div>
                      <div>{msg.text}</div>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="text-start mb-2">
                    <div className="p-3 rounded d-inline-block" style={{ backgroundColor: '#282a36', color: '#888', borderRadius: '12px' }}>
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                      Advisor is reading transactions...
                    </div>
                  </div>
                )}
              </div>
              <div className="input-group">
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Ask a question (e.g., 'What are my top 3 recurring expenses?', 'Identify any utilities bills')" 
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSendChatMessage()}
                  style={{ backgroundColor: '#2b2b3d', color: '#fff', borderColor: '#3e3e56' }}
                />
                <button className="btn btn-primary" onClick={handleSendChatMessage} disabled={chatLoading}>Send Message</button>
              </div>
            </div>
          )}

          {/* TAB CONTENT: CASH FLOW PROJECTION */}
          {activeTab === 'cashflow' && (
            <div className="tab-pane-content fade-in">
              {cashFlowLoading ? (
                <div className="text-center my-5">
                  <div className="spinner-border text-primary" role="status"></div>
                  <p className="mt-2">Simulating weekly balance projections based on transaction trends...</p>
                </div>
              ) : cashFlowData ? (
                <div className="cashflow-tab p-4 border rounded bg-dark text-white">
                  <h4 className="mb-3">📈 3-Month Weekly Cash Flow Projections</h4>
                  <p className="text-muted small">Based on income frequency, fixed expenses, and spending habits.</p>
                  
                  <div className="chart-container my-4" style={{ height: '350px', position: 'relative' }}>
                    <Line 
                      data={{
                        labels: cashFlowData.weeklyData.map(d => d.week),
                        datasets: [
                          {
                            label: 'Projected Cash Balance (₹)',
                            data: cashFlowData.weeklyData.map(d => d.projectedBalance),
                            borderColor: '#00ffe7',
                            backgroundColor: 'rgba(0, 255, 231, 0.1)',
                            fill: true,
                            tension: 0.3
                          },
                          {
                            label: 'Expected Income (₹)',
                            data: cashFlowData.weeklyData.map(d => d.income),
                            borderColor: '#28a745',
                            borderDash: [5, 5],
                            fill: false,
                            tension: 0.1
                          },
                          {
                            label: 'Expected Expenses (₹)',
                            data: cashFlowData.weeklyData.map(d => d.expenses),
                            borderColor: '#dc3545',
                            borderDash: [5, 5],
                            fill: false,
                            tension: 0.1
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: 'bottom', labels: { color: '#fff' } }
                        },
                        scales: {
                          x: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#fff' } },
                          y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#fff' } }
                        }
                      }}
                    />
                  </div>
                  
                  <div className="mt-4 pt-3 border-top">
                    <h5>AI Analysis</h5>
                    <p className="summary-text">{cashFlowData.summary}</p>
                    
                    <div className="row mt-4">
                      <div className="col-md-6 mb-3">
                        <div className="p-3 border rounded border-danger h-100" style={{ backgroundColor: '#2d1c22' }}>
                          <h6 className="text-danger font-weight-bold">⚠️ Cash Flow Risks</h6>
                          <ul className="mb-0">
                            {cashFlowData.risks.map((risk, i) => <li key={i} className="small mb-1">{risk}</li>)}
                          </ul>
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <div className="p-3 border rounded border-success h-100" style={{ backgroundColor: '#1c2d22' }}>
                          <h6 className="text-success font-weight-bold">💡 Optimization Opportunities</h6>
                          <ul className="mb-0">
                            {cashFlowData.opportunities.map((opp, i) => <li key={i} className="small mb-1">{opp}</li>)}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center my-4 text-muted">Select a bank statement to generate projections.</div>
              )}
            </div>
          )}

          {/* TAB CONTENT: SMART BUDGET PLANNER */}
          {activeTab === 'budget' && (
            <div className="tab-pane-content fade-in">
              {budgetLoading ? (
                <div className="text-center my-5">
                  <div className="spinner-border text-primary" role="status"></div>
                  <p className="mt-2">Analyzing expenditures and recommending category budget limits...</p>
                </div>
              ) : budgetData ? (
                <div className="budget-tab p-4 border rounded bg-dark text-white">
                  <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
                    <div>
                      <h4 className="mb-1">🎯 AI-Recommended Category Budgets</h4>
                      <p className="text-muted small mb-0">Recommended category targets based on historical monthly spending patterns.</p>
                    </div>
                    <div className="p-3 bg-secondary rounded text-end shadow mt-2 mt-md-0">
                      <span className="small text-muted text-uppercase font-weight-bold">Target Monthly Cap:</span>
                      <h3 className="mb-0 text-info">₹{budgetData.totalBudgetLimit.toFixed(2)}</h3>
                    </div>
                  </div>
                  
                  <div className="row">
                    {budgetData.categories.map((cat, i) => {
                      const percentage = cat.limit > 0 ? Math.min(100, Math.round((cat.actual / cat.limit) * 100)) : 0;
                      let progressColor = 'bg-success';
                      if (percentage > 95) progressColor = 'bg-danger';
                      else if (percentage > 75) progressColor = 'bg-warning';
                      
                      return (
                        <div key={i} className="col-md-6 mb-4">
                          <div className="card p-3 h-100" style={{ backgroundColor: '#1e1e2f', color: '#fff', border: '1px solid #3e3e56' }}>
                            <div className="d-flex justify-content-between mb-2">
                              <strong className="text-capitalize text-info">{cat.category}</strong>
                              <span className="font-weight-bold">₹{cat.actual.toFixed(2)} <span className="text-muted">/ ₹{cat.limit.toFixed(2)}</span></span>
                            </div>
                            <div className="progress mb-2" style={{ height: '10px', backgroundColor: '#3e3e56' }}>
                              <div 
                                className={`progress-bar ${progressColor}`} 
                                role="progressbar" 
                                style={{ width: `${percentage}%` }} 
                                aria-valuenow={percentage} 
                                aria-valuemin="0" 
                                aria-valuemax="100"
                              ></div>
                            </div>
                            <div className="d-flex justify-content-between small text-muted">
                              <span>{percentage}% of recommended limit used</span>
                              <span>Target limit: ₹{cat.limit}</span>
                            </div>
                            <p className="small mt-2 mb-0 border-top pt-2" style={{ color: '#ccc', fontStyle: 'italic' }}>
                              💡 {cat.reason}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center my-4 text-muted">Select a bank statement to fetch recommended budgets.</div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DecodeMyStatement;
