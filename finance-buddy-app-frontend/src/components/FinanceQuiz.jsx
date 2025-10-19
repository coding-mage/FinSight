import React, { useState } from 'react';
import axios from 'axios';
import '../css/financequiz.css';

const FinanceQuiz = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState('');
  const [quizStarted, setQuizStarted] = useState(false);
  const [error, setError] = useState('');

  const startQuiz = async () => {
    setError('');
    setSubmitted(false);
    setResults(null);
    setQuestions([]);
    setAnswers([]);
    setQuizStarted(false);

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      const { data } = await axios.post(
        'http://localhost:5050/api/quiz/generate',
        { userId, topic: topic.trim() || 'finance' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setQuestions(data);
      setAnswers(new Array(data.length).fill(null));
      setQuizStarted(true);
    } catch (err) {
      console.error('Error fetching quiz:', err);
      setError('Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (qIndex, optIndex) => {
    const newAnswers = [...answers];
    newAnswers[qIndex] = optIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      const indexToLetter = (i) => String.fromCharCode(65 + i);
      const formattedAnswers = answers.map((ansIndex) =>
        ansIndex !== null ? indexToLetter(ansIndex) : null
      );

      const { data } = await axios.post(
        'http://localhost:5050/api/quiz/submit',
        {
          userId,
          questions,
          answers: formattedAnswers,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResults(data);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  const letterToIndex = (letter) => {
    if (!letter) return -1;
    const code = letter.charCodeAt(0);
    return code >= 65 && code <= 90 ? code - 65 : -1; // A-Z
  };

  return (
    <div className="container my-4">
      <h2>Quiz</h2>

      <div className="mb-4">
        <label className="form-label">Enter Topic (optional):</label>
        <input
          type="text"
          className="form-control mb-2"
          placeholder="e.g., budgeting, credit cards, insurance"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        {error && <div className="text-danger mb-2">{error}</div>}
        {!quizStarted || submitted ? (
          <button className="btn btn-success" onClick={startQuiz} disabled={loading}>
            {loading ? 'Loading...' : '🚀 Start New Quiz'}
          </button>
        ) : null}
      </div>

      {loading && (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {quizStarted && !loading && questions.length > 0 && (
        <>
          {questions.map((q, i) => {
            const correctIdx = letterToIndex(q.correctAnswer);
            return (
              <div key={i} className="rounded quiz-block mb-4 p-3">
                <h5>{i + 1}. {q.question}</h5>
                {q.options.map((opt, j) => {
                  let optionClass = '';
                  if (submitted) {
                    if (j === correctIdx) {
                      optionClass = 'text-success'; // correct
                    } else if (answers[i] === j) {
                      optionClass = 'text-danger'; // wrong selected
                    }
                  }

                  return (
                    <div key={j}>
                      <input
                        type="radio"
                        id={`q${i}opt${j}`}
                        name={`q${i}`}
                        checked={answers[i] === j}
                        onChange={() => handleChange(i, j)}
                        disabled={submitted}
                      />
                      <label htmlFor={`q${i}opt${j}`} className={`ms-2 ${optionClass}`}>
                        {opt}
                      </label>
                    </div>
                  );
                })}
                {submitted && (
                  <div className="mt-2">
                    <strong>Explanation:</strong> {q.explanation}
                  </div>
                )}
              </div>
            );
          })}

          {!submitted ? (
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={answers.includes(null)}
            >
              Submit Quiz
            </button>
          ) : (
            <div className="mt-3">
              <h4>🎯 Score: {results.score} / {results.total}</h4>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FinanceQuiz;
