import FinanceQuiz from './FinanceQuiz';
import QuizHistory from './QuizHistory';
import React, { useState } from 'react';
import '../css/quizmainpage.css'; // ⬅️ New CSS file

const QuizMainPage = () => {
  const [view, setView] = useState('quiz'); 
  const userId = localStorage.getItem('userId'); 

  return (
    <div className="quiz-main-wrapper">
      <div className="quiz-tabs mb-4">
        <button
          className={`tab-button ${view === 'quiz' ? 'active' : ''}`}
          onClick={() => setView('quiz')}
        >
          🧠 Take Quiz
        </button>
        <button
          className={`tab-button ${view === 'history' ? 'active' : ''}`}
          onClick={() => setView('history')}
        >
          📜 View History
        </button>
      </div>

      <div className="quiz-tab-content">
        {view === 'quiz' ? (
          <FinanceQuiz userId={userId} />
        ) : (
          <QuizHistory userId={userId} />
        )}
      </div>
    </div>
  );
};

export default QuizMainPage;
