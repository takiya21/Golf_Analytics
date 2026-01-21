import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ocrService, courseService } from '../services/api';
import '../styles/review.css';

const Review = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { resultId, ocrData } = location.state || {};

  const [courseName, setCourseName] = useState(ocrData?.courseName || '');
  const [playDate, setPlayDate] = useState(ocrData?.playDate || '');
  const [scores, setScores] = useState(ocrData?.holes || {});
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const response = await courseService.getAllCourses();
      setCourses(response.data);
    } catch (error) {
      console.error('Failed to load courses:', error);
    }
  };

  const handleScoreChange = (holeNum, field, value) => {
    setScores({
      ...scores,
      [holeNum]: {
        ...scores[holeNum],
        [field]: value
      }
    });
  };

  const handleConfirm = async () => {
    if (!courseName || !playDate) {
      alert('コース名と日付は必須です');
      return;
    }

    setLoading(true);
    try {
      const response = await ocrService.confirmOCRData(
        resultId,
        courseName,
        playDate,
        scores
      );
      navigate(`/rounds/${response.data.roundId}`);
    } catch (error) {
      console.error('Confirmation failed:', error);
      alert('データの確認に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-page">
      <div className="review-container">
        <h1>データ確認・編集</h1>

        {/* Basic Info Section */}
        <section className="info-section">
          <h2>基本情報</h2>
          <div className="form-group">
            <label>コース名</label>
            <input 
              type="text" 
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="コース名を入力"
            />
          </div>

          <div className="form-group">
            <label>プレー日</label>
            <input 
              type="date" 
              value={playDate}
              onChange={(e) => setPlayDate(e.target.value)}
            />
          </div>
        </section>

        {/* Scores Edit Section */}
        <section className="scores-section">
          <h2>スコア編集</h2>
          <div className="scores-table-wrapper">
            <table className="scores-table">
              <thead>
                <tr>
                  <th>ホール</th>
                  <th>スコア</th>
                  <th>パット</th>
                  <th>1打目</th>
                  <th>FW</th>
                  <th>OB</th>
                  <th>バンカー</th>
                  <th>ペナ</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(hole => (
                  <tr key={hole}>
                    <td className="hole-num">{hole}</td>
                    <td>
                      <input 
                        type="number" 
                        value={scores[hole]?.score || ''}
                        onChange={(e) => handleScoreChange(hole, 'score', e.target.value)}
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        value={scores[hole]?.putts || ''}
                        onChange={(e) => handleScoreChange(hole, 'putts', e.target.value)}
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        value={scores[hole]?.firstClub || ''}
                        onChange={(e) => handleScoreChange(hole, 'firstClub', e.target.value)}
                        placeholder="クラブ名"
                      />
                    </td>
                    <td>
                      <input 
                        type="checkbox" 
                        checked={scores[hole]?.fairwayKept || false}
                        onChange={(e) => handleScoreChange(hole, 'fairwayKept', e.target.checked)}
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        value={scores[hole]?.obCount || 0}
                        onChange={(e) => handleScoreChange(hole, 'obCount', parseInt(e.target.value))}
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        value={scores[hole]?.bunkerCount || 0}
                        onChange={(e) => handleScoreChange(hole, 'bunkerCount', parseInt(e.target.value))}
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        value={scores[hole]?.onePenalty || 0}
                        onChange={(e) => handleScoreChange(hole, 'onePenalty', parseInt(e.target.value))}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="button-group">
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-secondary"
            disabled={loading}
          >
            ← キャンセル
          </button>
          <button 
            onClick={handleConfirm} 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? '処理中...' : 'この内容で登録する'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Review;
