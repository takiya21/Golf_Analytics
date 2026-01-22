import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/manualScore.css';

const ManualScore = () => {
  const navigate = useNavigate();
  const [playDate, setPlayDate] = useState(new Date().toISOString().split('T')[0]);
  const [scores, setScores] = useState({});

  // ダミーコースデータ
  const courses = [
    { id: 'lake-hamamatsu', name: 'Lake Hamamatsu' }
  ];
  const holes = Array.from({ length: 18 }, (_, i) => ({
    hole_number: i + 1,
    par: [4, 4, 3, 4, 5, 4, 3, 4, 5, 4, 3, 5, 4, 4, 4, 3, 5, 4][i]
  }));

  const handleScoreChange = (hole, score) => {
    setScores({
      ...scores,
      [hole]: parseInt(score)
    });
  };

  const handleSubmit = () => {
    alert('スコアが登録されました（フロントエンド表示のみ）');
  };

  return (
    <div className="manual-score-page">
      <h1>✍️ スコアを手動入力</h1>
      
      <div className="form-group">
        <label>コース</label>
        <select defaultValue={courses[0].id}>
          {courses.map(course => (
            <option key={course.id} value={course.id}>{course.name}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>プレー日</label>
        <input 
          type="date" 
          value={playDate} 
          onChange={(e) => setPlayDate(e.target.value)} 
        />
      </div>

      <div className="scores-table">
        <h2>スコア入力</h2>
        <table>
          <thead>
            <tr>
              <th>ホール</th>
              <th>Par</th>
              <th>スコア</th>
            </tr>
          </thead>
          <tbody>
            {holes.map(hole => (
              <tr key={hole.hole_number}>
                <td>{hole.hole_number}</td>
                <td>{hole.par}</td>
                <td>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={scores[hole.hole_number] || ''}
                    onChange={(e) => handleScoreChange(hole.hole_number, e.target.value)}
                    placeholder="スコアを入力"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="button-group">
        <button onClick={handleSubmit} className="btn btn-primary">登録する</button>
        <button onClick={() => navigate(-1)} className="btn btn-secondary">戻る</button>
      </div>
    </div>
  );
};

export default ManualScore;
