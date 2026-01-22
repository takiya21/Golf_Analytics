import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/rounds.css';

const Rounds = () => {
  const navigate = useNavigate();
  const rounds = [];  // ダミーデータ

  return (
    <div className="rounds-page">
      <h1>📅 ラウンド履歴</h1>
      {rounds.length > 0 ? (
        <div className="rounds-list">
          {rounds.map(round => (
            <div key={round.id} className="round-card">
              <h3>{round.course_name}</h3>
              <p>{round.play_date}</p>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
          <p>ラウンドデータがありません</p>
          <button onClick={() => navigate('/manual-score')} className="btn btn-primary">
            スコアを登録する
          </button>
        </div>
      )}
    </div>
  );
};

export default Rounds;
