import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/quizhistory.css'; 

const QuizHistory = ({ userId }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!userId || !token) return;

        const { data } = await axios.get(
          `http://localhost:5050/api/quiz/history/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Sort history by date descending
        const sortedData = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
        setHistory(sortedData);
      } catch (err) {
        console.error("Error fetching quiz history:", err);
      }
    };

    fetchHistory();
  }, [userId]);

  const letterToIndex = (letter) => {
    if (!letter) return -1;
    const code = letter.charCodeAt(0);
    return code >= 65 && code <= 90 ? code - 65 : -1; // A-Z
  };

  return (
    <div className="container my-4">
      <h3>Your Quiz History</h3>
      {history.length === 0 ? (
        <p>No quizzes attempted yet.</p>
      ) : (
        history.map((attempt, idx) => (
          <div key={idx} className="quiz-card">
            <h5>🗓 Attempted on: {new Date(attempt.date).toLocaleString()}</h5>
            <p>🎯 Score: {attempt.score} / {attempt.questions.length}</p>
            {attempt.questions.map((q, i) => {
              const userIdx = letterToIndex(q.userAnswer);
              const correctIdx = letterToIndex(q.correctAnswer);

              return (
                <div key={i} className="question-block">
                  <strong>Q{i + 1}: {q.question}</strong><br />
                  <span>
                    <span className={q.userAnswer === q.correctAnswer ? 'text-success' : 'text-danger'}>
                      Your Answer: {userIdx >= 0 && userIdx < q.options.length ? q.options[userIdx] : 'Not Answered'}
                    </span><br />
                    <span className="text-success">
                      Correct Answer: {correctIdx >= 0 && correctIdx < q.options.length ? q.options[correctIdx] : 'Unknown'}
                    </span><br />
                    <em>Explanation: {q.explanation}</em>
                  </span>
                </div>
              );
            })}
          </div>
        ))
      )}
    </div>
  );
};

export default QuizHistory;
