import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/manualScore.css';

const ManualScore = () => {
  const navigate = useNavigate();
  const [playDate, setPlayDate] = useState(new Date().toISOString().split('T')[0]);
  const [roundData, setRoundData] = useState({});

  // コース・ホールデータ
  const course = { id: 'lake-hamamatsu', name: 'レイク浜松カントリークラブ' };
  const parArray = [4, 4, 3, 4, 5, 4, 3, 4, 5, 4, 3, 5, 4, 4, 4, 3, 5, 4];
  const holes = Array.from({ length: 18 }, (_, i) => ({
    hole_number: i + 1,
    par: parArray[i]
  }));

  // クラブオプション
  const clubs = ['ドライバー', '3W', '5W', '4U', '5U', '6U', '2I', '3I', '4I', '5I', '6I', '7I', '8I', '9I', 'PW', 'AW', 'SW', 'パター'];

  // FWキープオプション
  const fwKeepOptions = ['〇', '左', '右', 'ショート'];

  // ホール毎のデータを更新
  const updateHoleData = (holeNumber, field, value) => {
    setRoundData(prev => ({
      ...prev,
      [holeNumber]: {
        ...(prev[holeNumber] || {}),
        [field]: value
      }
    }));
  };

  // データを localStorage に保存
  const handleSubmit = () => {
    // ラウンドオブジェクトの完成
    const round = {
      id: Date.now(),
      course_id: course.id,
      course_name: course.name,
      play_date: playDate,
      holes: roundData,
      created_at: new Date().toISOString()
    };

    // 既存データを取得
    const existingRounds = JSON.parse(localStorage.getItem('golfys_rounds') || '[]');
    existingRounds.push(round);
    
    // localStorage に保存
    localStorage.setItem('golfys_rounds', JSON.stringify(existingRounds));
    
    alert(`${playDate} のラウンドデータが保存されました！`);
    navigate('/');
  };

  return (
    <div className="manual-score-page">
      <h1>✍️ スコアを手動入力</h1>
      
      <div className="form-header">
        <div className="form-group">
          <label>コース</label>
          <input type="text" value={course.name} disabled />
        </div>

        <div className="form-group">
          <label>プレー日</label>
          <input 
            type="date" 
            value={playDate} 
            onChange={(e) => setPlayDate(e.target.value)} 
          />
        </div>
      </div>

      <div className="scores-table">
        <table>
          <thead>
            <tr>
              <th>Hole</th>
              <th>Par</th>
              <th>スコア</th>
              <th>パット</th>
              <th>1打目</th>
              <th>FWキープ</th>
              <th>OB</th>
              <th>Sand</th>
              <th>Penalty</th>
            </tr>
          </thead>
          <tbody>
            {holes.map(hole => (
              <tr key={hole.hole_number}>
                <td className="hole-col">{hole.hole_number}</td>
                <td className="par-col">{hole.par}</td>
                <td>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={roundData[hole.hole_number]?.score || ''}
                    onChange={(e) => updateHoleData(hole.hole_number, 'score', parseInt(e.target.value) || 0)}
                    placeholder="-"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    max="12"
                    value={roundData[hole.hole_number]?.putts || ''}
                    onChange={(e) => updateHoleData(hole.hole_number, 'putts', parseInt(e.target.value) || 0)}
                    placeholder="-"
                  />
                </td>
                <td>
                  <select
                    value={roundData[hole.hole_number]?.first_club || ''}
                    onChange={(e) => updateHoleData(hole.hole_number, 'first_club', e.target.value)}
                  >
                    <option value="">-</option>
                    {clubs.map(club => (
                      <option key={club} value={club}>{club}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    value={roundData[hole.hole_number]?.fairway_kept || ''}
                    onChange={(e) => updateHoleData(hole.hole_number, 'fairway_kept', e.target.value)}
                  >
                    <option value="">-</option>
                    {fwKeepOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    max="3"
                    value={roundData[hole.hole_number]?.ob_count || ''}
                    onChange={(e) => updateHoleData(hole.hole_number, 'ob_count', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    max="3"
                    value={roundData[hole.hole_number]?.bunker_count || ''}
                    onChange={(e) => updateHoleData(hole.hole_number, 'bunker_count', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    max="3"
                    value={roundData[hole.hole_number]?.penalty_count || ''}
                    onChange={(e) => updateHoleData(hole.hole_number, 'penalty_count', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="button-group">
        <button onClick={handleSubmit} className="btn btn-primary">保存する</button>
        <button onClick={() => navigate(-1)} className="btn btn-secondary">戻る</button>
      </div>
    </div>
  );
};

export default ManualScore;
