import React, { useState } from 'react';
import Login from './login';
import Register from './Register';
import '../css/AuthPage.css'; // Ensure path is correct if App.css is in src/

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <div className="text-center mb-4">
          <span className="text-gradient" style={{ fontSize: '2rem' }}>💸 FinSight </span>
          <p className="lead">Learn and manage your finances effortlessly</p>
        </div>

        <div className="d-flex justify-content-center mb-3">
          <button
            className="btn-primary"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'New here? Register' : 'Already a user? Login'}
          </button>
        </div>

        {isLogin ? <Login /> : <Register />}
      </div>
    </div>
  );
};

export default AuthPage;
