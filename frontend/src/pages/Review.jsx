import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/review.css';

const Review = () => {
  const navigate = useNavigate();

  return (
    <div className="review-page">
      <div className="review-container">
        <h1>OCR機能は削除されました</h1>
        <p>スコアを記録するには、スコア登録画面から手動入力してください。</p>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/upload')}
        >
          スコア登録に戻る
        </button>
      </div>
    </div>
  );
};

export default Review;
