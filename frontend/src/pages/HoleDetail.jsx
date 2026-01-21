import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { holeService, statsService } from '../services/api';
import '../styles/holeDetail.css';

// 定数: lake-hamamatsu コースのホール情報
const LAKE_HAMAMATSU_HOLES = {
  1: { par: 4, yardage: 420 },
  2: { par: 4, yardage: 306 },
  3: { par: 3, yardage: 182 },
  4: { par: 4, yardage: 443 },
  5: { par: 5, yardage: 472 },
  6: { par: 4, yardage: 350 },
  7: { par: 3, yardage: 173 },
  8: { par: 4, yardage: 391 },
  9: { par: 4, yardage: 410 },
  10: { par: 4, yardage: 400 },
  11: { par: 3, yardage: 151 },
  12: { par: 5, yardage: 500 },
  13: { par: 4, yardage: 442 },
  14: { par: 4, yardage: 320 },
  15: { par: 4, yardage: 366 },
  16: { par: 3, yardage: 191 },
  17: { par: 5, yardage: 508 },
  18: { par: 4, yardage: 383 }
};

const HoleDetail = () => {
  const { holeId } = useParams();
  const navigate = useNavigate();
  const [hole, setHole] = useState(null);
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHoleData();
  }, [holeId]);

  const loadHoleData = async () => {
    try {
      const [holeResponse, statsResponse] = await Promise.all([
        holeService.getHoleDetails(holeId),
        statsService.getHoleStats(holeId)
      ]);

      let holeData = holeResponse.data;
      
      // lake-hamamatsu コースの場合は定数データを適用
      if (holeData && LAKE_HAMAMATSU_HOLES[holeData.hole_number]) {
        const constData = LAKE_HAMAMATSU_HOLES[holeData.hole_number];
        holeData = {
          ...holeData,
          par: constData.par,
          yardage: constData.yardage
        };
      }
      
      setHole(holeData);
      setStats(statsResponse.data);
      setHistory(statsResponse.data.history || []);
    } catch (error) {
      console.error('Failed to load hole data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">読込中...</div>;
  }

  if (!hole) {
    return <div className="error">ホールデータが見つかりません</div>;
  }

  const prevHole = Math.max(1, hole.hole_number - 1);
  const nextHole = Math.min(18, hole.hole_number + 1);

  return (
    <div className="hole-detail-page">
      <div className="hole-detail-container">
        {/* Hole Image & Info */}
        <section className="hole-image-section">
          <img 
            src={`http://localhost:5000/hole_img/lake-hamamatsu/Hole${hole.hole_number}_par${hole.par}_${hole.yardage}yard.webp`}
            alt={`Hole ${hole.hole_number}`}
            className="hole-image-large"
            onError={(e) => {
              console.error(`Failed to load hole detail image for Hole ${hole.hole_number}:`, e.target.src);
              e.target.alt = 'Image not available';
            }}
            onLoad={() => console.log(`Loaded hole detail image for Hole ${hole.hole_number}`)}
          />
          <div className="hole-info-overlay">
            <h1>Hole {hole.hole_number}</h1>
            <div className="hole-specs">
              <span>Par {hole.par}</span>
              <span>{hole.yardage} yards</span>
            </div>
          </div>
        </section>

        {/* History Table */}
        <section className="history-section">
          <h2>📅 履歴</h2>
          <table className="history-table">
            <thead>
              <tr>
                <th>日付</th>
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
              {history.map((record, idx) => (
                <tr key={idx}>
                  <td>{record.play_date}</td>
                  <td className="score">{record.score}</td>
                  <td>{record.putts}</td>
                  <td>{record.first_club || '-'}</td>
                  <td>{record.fairway_kept ? '✓' : '-'}</td>
                  <td>{record.ob_count || 0}</td>
                  <td>{record.bunker_count || 0}</td>
                  <td>{record.one_penalty || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Statistics */}
        <section className="stats-section">
          <h2>📊 統計情報</h2>
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-label">平均スコア</div>
              <div className="stat-value">{stats?.avg_score || '-'}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">平均パット</div>
              <div className="stat-value">{stats?.avg_putts || '-'}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">プレー回数</div>
              <div className="stat-value">{stats?.times_played || 0}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">FWキープ率</div>
              <div className="stat-value">{stats?.fairway_kept_rate || '-'}%</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">イーグル</div>
              <div className="stat-value">{stats?.eagles || 0}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">バーディ</div>
              <div className="stat-value">{stats?.birdies || 0}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">パー</div>
              <div className="stat-value">{stats?.pars || 0}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">ボギー</div>
              <div className="stat-value">{stats?.bogeys || 0}</div>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <div className="navigation-buttons">
          {hole.hole_number > 1 && (
            <button className="btn btn-secondary" onClick={() => navigate(`/hole/${hole.id - 1}`)}>
              ← Hole {prevHole}
            </button>
          )}
          <button className="btn btn-tertiary" onClick={() => navigate('/courses')}>
            コース一覧に戻る
          </button>
          {hole.hole_number < 18 && (
            <button className="btn btn-secondary" onClick={() => navigate(`/hole/${hole.id + 1}`)}>
              Hole {nextHole} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HoleDetail;
