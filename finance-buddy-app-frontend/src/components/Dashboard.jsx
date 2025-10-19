// src/components/Dashboard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/dashboard.css'; // Link to updated styles

const features = [
  {
    title: 'AI-Powered Quiz',
    description: 'Boost your financial knowledge with personalized, adaptive quizzes.',
    route: '/quiz'
  },
  {
    title: '"What If" Simulators',
    description: 'Explore hypothetical scenarios to see how different choices impact your finances.',
    route: '/simulators'
  },
  {
    title: 'Daily Digest',
    description: 'Stay informed with daily insights and discover how news affects your money.',
    route: '/daily-digest'
  },
  {
    title: 'Decode My Statement',
    description: 'Upload your statements and let AI categorize expenses and highlight trends.',
    route: '/statement-decoder'
  },
  {
    title: 'Finance Challenges',
    description: 'Gamify your money habits with exciting challenges and earn achievement badges.',
    route: '/challenges'
  }
];


const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-wrapper">
      <h2 className="dashboard-title text-gradient">Welcome to FinSight</h2>
      <div className="row">
        {features.map((feature, index) => (
          <div className="col-lg-6 col-md-6 mb-4" key={index}>
            <div className="feature-card h-100" onClick={() => navigate(feature.route)}>
              <div className="feature-card-body">
                <h5>{feature.title}</h5>
                <p>{feature.description}</p>
                <span className="go-link">Explore →</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
