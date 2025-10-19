import React, { useState } from 'react';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import '../css/register.css'; // ✅ Add CSS

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const response = await axios.post('http://localhost:5050/api/auth/register', {
        email,
        password,
        name,
        region
      });
      console.log("Registration Success", response.data);
      localStorage.setItem('token', response.data.token);
      navigate('/login');
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Registration failed. Please try again.';
      setErrorMsg(message);
    }
  };

  return (
    <div className="register-form">
      <h4 className="text-center text-gradient mb-3">Register</h4>

      {errorMsg && (
        <div className="alert alert-danger py-2 text-center" role="alert">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label text-white">Email address</label>
          <input 
            type="email" 
            className="form-control input-dark" 
            id="email" 
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label text-white">Password</label>
          <input 
            type="password" 
            className="form-control input-dark" 
            id="password" 
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="name" className="form-label text-white">Name</label>
          <input 
            type="text" 
            className="form-control input-dark" 
            id="name" 
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="region" className="form-label text-white">Region</label>
          <input 
            type="text" 
            className="form-control input-dark" 
            id="region" 
            placeholder="Enter your region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            required
          />
        </div>

        <div className="d-grid">
          <button type="submit" className="btn btn-primary btn-lg">Register</button>
        </div>
      </form>
    </div>
  );
};

export default Register;
