import React, { useState } from 'react';
import FinanceChallenge from './FinanceChallenge';
import BadgeHistory from './BadgeHistory';
import '../css//challengesmainpage.css';

const ChallengeBadgeTabs = () => {
  const [activeTab, setActiveTab] = useState('challenge'); // 'challenge' or 'badge'

  return (
    <div className="container my-4">
      {/* Tab Bar */}
      <div className="nav-tabs nav-links">
        <div className="nav-item">
          <button
            className={`nav-link ${activeTab === 'challenge' ? 'active' : ''}`}
            onClick={() => setActiveTab('challenge')}
          >
            🏆 Challenges
          </button>
        </div>
        <div className="nav-item">
          <button
            className={`nav-link ${activeTab === 'badge' ? 'active' : ''}`}
            onClick={() => setActiveTab('badge')}
          >
            🎖️ Badge History
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-3">
        {activeTab === 'challenge' && <FinanceChallenge />}
        {activeTab === 'badge' && <BadgeHistory />}
      </div>
    </div>
  );
};

export default ChallengeBadgeTabs;
