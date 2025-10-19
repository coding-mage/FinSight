import React from "react";
import { Routes, Route } from "react-router-dom";
import AuthPage from "./components/AuthPage";
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import Login from './components/login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ExpenseEvaluator from './components/ExpenseEvaluator';
import StatementDecoder from './components/DecodeMyStatement';
import WhatIfSimulator from './components/WhatIfSimulator';
import NewsWithImpact from './components/NewsWithImpact';
import QuizMainPage from './components/QuizMainPage';
import ChallengesMainPage from './components/ChallengesMainPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<div className="text-white text-center mt-5">404 - Page Not Found</div>} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/expense-evaluator" element={
        <ProtectedRoute>
          <ExpenseEvaluator />
        </ProtectedRoute>} />
      <Route path="/statement-decoder" element={
        <ProtectedRoute>
          <StatementDecoder />
        </ProtectedRoute>} />
      <Route path="/simulators" element={
        <ProtectedRoute>
          <WhatIfSimulator />
        </ProtectedRoute>} />
      <Route path="/daily-digest" element={
        <ProtectedRoute>
          <NewsWithImpact />
        </ProtectedRoute>} />
      <Route path="/quiz" element={
        <ProtectedRoute>
          <QuizMainPage />
        </ProtectedRoute>} />
      <Route path="/challenges" element={
        <ProtectedRoute>
          <ChallengesMainPage />
        </ProtectedRoute>} />
    </Routes>
  );
}

export default App;
