import React, { useEffect, useState } from "react";
import axios from "axios";

const BadgeHistory = () => {
  const [history, setHistory] = useState({ challenges: [], badges: [] });
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5050/api/challenge/history/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setHistory(data);
      } catch (err) {
        console.error("Failed to fetch badge history:", err);
      }
    };
    fetchHistory();
  }, [userId, token]);

  return (
    <div className="container my-4">
      <h2>🎖️ Badge & Challenge History</h2>
      <div className="mt-4">
        <h4>🏅 Badges Earned</h4>
        {history.badges.length > 0 ? (
          <ul>
            {history.badges.map((badge, index) => (
              <li key={index}>
                <strong>{badge.name}</strong>
                <br />
                <em>{badge.description}</em> <br />
                <small>{new Date(badge.earnedAt).toLocaleDateString()}</small>
              </li>
            ))}
          </ul>
        ) : (
          <p>No badges earned yet.</p>
        )}
      </div>
      <div className="mt-4">
        <h4>📌 Completed Challenges</h4>
        {history.challenges.length > 0 ? (
          <ul>
            {history.challenges.map((ch, index) => (
              <li key={index}>
                {ch.prompt} -{" "}
                <em>{new Date(ch.createdAt).toLocaleDateString()}</em>
              </li>
            ))}
          </ul>
        ) : (
          <p>No challenges completed yet.</p>
        )}
      </div>
    </div>
  );
};

export default BadgeHistory;
