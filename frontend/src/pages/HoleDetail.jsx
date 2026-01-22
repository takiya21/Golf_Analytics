import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/holeDetail.css';

const HoleDetail = () => {
  const navigate = useNavigate();
  const { holeId } = useParams();

  // Lake Hamamatsu コースデータ
  const parArray = [4, 4, 3, 4, 5, 4, 3, 4, 5, 4, 3, 5, 4, 4, 4, 3, 5, 4];
  const yardageArray = [420, 306, 182, 443, 472, 350, 173, 391, 492, 400, 151, 500, 442, 320, 366, 191, 508, 383];
  const handicapArray = [9, 15, 17, 3, 1, 11, 18, 13, 5, 7, 16, 2, 8, 14, 10, 18, 4, 12];
  
  const courseData = {
    id: 'lake-hamamatsu',
    name: 'Lake Hamamatsu',
    par: 72,
    holes: Array.from({ length: 18 }, (_, i) => {
      const holeNum = i + 1;
      const holePar = parArray[i];
      const holeYardage = yardageArray[i];
      return {
        hole_number: holeNum,
        par: holePar,
        yardage: holeYardage,
        handicap: handicapArray[i],
        image: `/hole_img/lake-hamamatsu/Hole${holeNum}_par${holePar}_${holeYardage}yard.webp`
      };
    })
  };

  const currentHoleNumber = parseInt(holeId);
  const hole = courseData.holes.find(h => h.hole_number === currentHoleNumber);

  if (!hole) {
    return (
      <div className="hole-detail-page">
        <h1>ホール詳細</h1>
        <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
          <p>ホール情報が見つかりません</p>
          <button onClick={() => navigate('/courses')} className="btn btn-primary">
            コース選択に戻る
          </button>
        </div>
      </div>
    );
  }

  const prevHole = hole.hole_number > 1 ? hole.hole_number - 1 : null;
  const nextHole = hole.hole_number < 18 ? hole.hole_number + 1 : null;

  return (
    <div className="hole-detail-page">
      <div className="hole-detail-container">
        <div className="hole-image-section">
          <img src={hole.image} alt={`Hole ${hole.hole_number}`} className="hole-image-large" />
          <div className="hole-info-overlay">
            <h1>{courseData.name} - Hole {hole.hole_number}</h1>
            <div className="hole-specs">
              <span>Par {hole.par}</span>
              <span>{hole.yardage} yards</span>
              <span>HCP {hole.handicap}</span>
            </div>
          </div>
        </div>

        <div className="hole-content">
          <div className="stats-section">
            <h2>成績統計</h2>
            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-label">ベストスコア</div>
                <div className="stat-value">-</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">平均スコア</div>
                <div className="stat-value">-</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">ラウンド数</div>
                <div className="stat-value">0</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">イーグル</div>
                <div className="stat-value">0</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">バーディ</div>
                <div className="stat-value">0</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">パー</div>
                <div className="stat-value">0</div>
              </div>
            </div>
          </div>

          <div className="navigation-buttons">
            {prevHole && (
              <button className="btn btn-secondary" onClick={() => navigate(`/hole/${prevHole}`)}>
                ← Hole {prevHole}
              </button>
            )}
            <button className="btn btn-tertiary" onClick={() => navigate('/courses')}>
              コース一覧に戻る
            </button>
            {nextHole && (
              <button className="btn btn-secondary" onClick={() => navigate(`/hole/${nextHole}`)}>
                Hole {nextHole} →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoleDetail;
