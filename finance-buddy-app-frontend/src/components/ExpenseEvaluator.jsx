import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ExpenseEvaluator = () => {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [expenseFormVisible, setExpenseFormVisible] = useState(false);
  const [incomeFormVisible, setIncomeFormVisible] = useState(false);
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [expenseData, setExpenseData] = useState({ vendor: '', amount: '', date: '', category: '' });
  const [incomeData, setIncomeData] = useState({ source: '', amount: '', date: '', category: '' });

  useEffect(() => {
    // Load existing expenses/incomes (use your actual API endpoints)
    axios.get('/api/expenses').then(res => setExpenses(res.data)).catch(() => {});
    axios.get('/api/incomes').then(res => setIncomes(res.data)).catch(() => {});
  }, []);

  const handleInvoiceUpload = async () => {
    if (!invoiceFile) return;

    const formData = new FormData();
    formData.append('file', invoiceFile);

    const res = await axios.post('/api/expense/parse', formData);
    setExpenseData(res.data.parsed); // parsed = {vendor, amount, date, category}
  };

  const handleSubmitExpense = async () => {
    await axios.post('/api/expenses', expenseData);
    setExpenses([...expenses, expenseData]);
    setExpenseFormVisible(false);
    setExpenseData({ vendor: '', amount: '', date: '', category: '' });
  };

  const handleSubmitIncome = async () => {
    const res = await axios.post('/api/incomes/autocomplete', incomeData);
    await axios.post('/api/incomes', res.data.completed);
    setIncomes([...incomes, res.data.completed]);
    setIncomeFormVisible(false);
    setIncomeData({ source: '', amount: '', date: '', category: '' });
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-4">Expense Evaluator</h3>

      <div className="mb-3">
        <button className="btn btn-primary me-2" onClick={() => setExpenseFormVisible(!expenseFormVisible)}>➕ Add Expense</button>
        <button className="btn btn-success" onClick={() => setIncomeFormVisible(!incomeFormVisible)}>➕ Add Income</button>
      </div>

      {/* Expense Form */}
      {expenseFormVisible && (
        <div className="card p-3 mb-4">
          <h5>Upload Invoice</h5>
          <input type="file" accept=".pdf,image/*" onChange={(e) => setInvoiceFile(e.target.files[0])} className="form-control my-2" />
          <button className="btn btn-secondary mb-3" onClick={handleInvoiceUpload}>Parse Invoice</button>

          <h5>Or enter details manually</h5>
          {['vendor', 'amount', 'date', 'category'].map((field) => (
            <input
              key={field}
              className="form-control mb-2"
              placeholder={field}
              value={expenseData[field]}
              onChange={(e) => setExpenseData({ ...expenseData, [field]: e.target.value })}
            />
          ))}
          <button className="btn btn-primary" onClick={handleSubmitExpense}>Submit Expense</button>
        </div>
      )}

      {/* Income Form */}
      {incomeFormVisible && (
        <div className="card p-3 mb-4">
          <h5>Enter Income Details</h5>
          <input
            className="form-control mb-2"
            placeholder="Source"
            value={incomeData.source}
            onChange={(e) => setIncomeData({ ...incomeData, source: e.target.value })}
          />
          <input
            className="form-control mb-2"
            placeholder="Amount"
            value={incomeData.amount}
            onChange={(e) => setIncomeData({ ...incomeData, amount: e.target.value })}
          />
          <button className="btn btn-success" onClick={handleSubmitIncome}>Submit Income</button>
        </div>
      )}

      {/* Expenses List */}
      <h5>Expenses</h5>
      <ul className="list-group mb-4">
        {expenses.map((e, i) => (
          <li className="list-group-item" key={i}>
            {e.vendor} - ₹{e.amount} on {e.date} ({e.category})
          </li>
        ))}
      </ul>

      {/* Incomes List */}
      <h5>Incomes</h5>
      <ul className="list-group">
        {incomes.map((i, idx) => (
          <li className="list-group-item" key={idx}>
            {i.source} - ₹{i.amount} on {i.date} ({i.category})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExpenseEvaluator;
