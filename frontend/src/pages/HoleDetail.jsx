import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/holeDetail.css';

const HoleDetail = () => {
  const navigate = useNavigate();

  return (
    <div className="hole-detail-page">
      <h1>ホール詳細</h1>
      <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
        <p>ホール詳細情報がありません</p>
        <button onClick={() => navigate('/courses')} className="btn btn-primary">
          コース選択に戻る
        </button>
      </div>
    </div>
  );
};

export default HoleDetail;
