import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

const FinanceChallenge = () => {
  const [challenge, setChallenge] = useState(null);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [badge, setBadge] = useState(null);

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/challenge/active/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data) setChallenge(data);
      } catch (err) {
        console.error('Error fetching challenge:', err);
      }
    };
    fetchChallenge();
  }, [userId, token]);

  const generateChallengePrompt = async () => {
  setLoading(true);
  try {
    setGeneratedPrompt('');
    const { data } = await axios.post(
      `${API_URL}/api/challenge/generate`,
      { userId, currentPrompt: generatedPrompt },  // <-- Pass current prompt to avoid repeat
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setTimeout(() => {
      setGeneratedPrompt(data.prompt);
      console.log('Generated Prompt:', data.prompt);
      setBadge(null);
      setChallenge(null);
    }, 50);
  } catch (err) {
    console.error('Failed to generate challenge:', err);
  } finally {
    setLoading(false);
  }
};


  const takeUpChallenge = async () => {
    try {
      const { data } = await axios.post(
        `${API_URL}/api/challenge/takeup`,
        { userId, prompt: generatedPrompt },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChallenge(data);
      setGeneratedPrompt('');
      setBadge(null);
      alert('Challenge taken up successfully!');      
    } catch (err) {
      console.error('Error taking up challenge:', err);
    }
  };

  const completeChallenge = async () => {
    try {
      const { data } = await axios.post(
        `${API_URL}/api/challenge/complete`,
        { userId, challengeId: challenge._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBadge(data.badge);
      setChallenge(null);
    } catch (err) {
      console.error('Error completing challenge:', err);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <h2>🎯 Financial Challenge</h2>

      {challenge ? (
        <>
          <p><strong>Your Challenge:</strong> {challenge.prompt}</p>
          <button onClick={completeChallenge}>✅ Mark as Complete and Earn Badge</button>
        </>
      ) : badge ? (
        <>
          <h3>🎉 Challenge completed!</h3>
          <p>You earned: <strong>{badge.icon} {badge.name}</strong></p>
          <p>{badge.description}</p>
          <button onClick={generateChallengePrompt}>🔄 Generate New Challenge</button>
        </>
      ) : generatedPrompt ? (
        <>
          <p>{generatedPrompt}</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={takeUpChallenge}>🚀 Take up this challenge</button>
            <button onClick={generateChallengePrompt} disabled={loading}>
              {loading ? 'Generating...' : '🔄 Generate a Different One'}
            </button>
          </div>
        </>
      ) : (
        <button onClick={generateChallengePrompt} disabled={loading}>
          {loading ? 'Generating...' : '🎲 Generate a Challenge'}
        </button>
      )}
    </div>
  );
};

export default FinanceChallenge;
