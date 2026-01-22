import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/upload.css';

const Upload = () => {
  const navigate = useNavigate();

  return (
    <div className="upload-page">
      <div className="upload-container">
        <h1>⛳ スコアを記録</h1>
        
        <div className="upload-options">
          <div className="option-card" onClick={() => navigate('/manual-score')}>
            <div className="option-icon">✏️</div>
            <h2>スコアを手動入力</h2>
            <p>ラウンドのスコアを手動で入力します</p>
          </div>

          <div className="option-info">
            <p>📱 フロントエンドのみの実装です</p>
            <p>🔒 すべてのデータはデバイスに保存されます</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
