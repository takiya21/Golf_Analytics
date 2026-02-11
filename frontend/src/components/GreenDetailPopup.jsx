import React, { useState, useEffect } from 'react';

/**
 * グリーン攻略図ポップアップ
 * 
 * - HoleN_green.webp が存在する場合はその画像を表示
 * - 存在しない場合はSVGプレースホルダーを表示
 * - 傾斜（アンジュレーション）情報を視覚的に確認可能
 */
const GreenDetailPopup = ({ holeNumber, par, yardage, isOpen, onClose }) => {
  const [imageExists, setImageExists] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const basePath = import.meta.env.BASE_URL;

  const greenImageUrl = `${basePath}hole_img/lake-hamamatsu/Hole${holeNumber}_green.webp`;

  useEffect(() => {
    if (!isOpen) return;
    setImageLoading(true);
    setImageExists(true);
  }, [isOpen, holeNumber]);

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageExists(true);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageExists(false);
  };

  // ESC キーでクローズ
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // スクロールロック
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // グリーンの形状データ（ホールごとに少しバリエーション）
  const greenShapes = {
    1:  { rx: 80, ry: 65, slope: '奥から手前', difficulty: '中', pinPositions: ['左奥', '中央', '右手前'] },
    2:  { rx: 70, ry: 70, slope: '左から右', difficulty: '易', pinPositions: ['左手前', '中央', '右奥'] },
    3:  { rx: 60, ry: 75, slope: '手前から奥', difficulty: '難', pinPositions: ['左', '中央奥', '右'] },
    4:  { rx: 85, ry: 60, slope: '右から左', difficulty: '中', pinPositions: ['左奥', '中央', '右手前'] },
    5:  { rx: 90, ry: 70, slope: '奥から手前（2段）', difficulty: '難', pinPositions: ['上段左', '下段中央', '上段右'] },
    6:  { rx: 65, ry: 65, slope: '左から右', difficulty: '易', pinPositions: ['左', '中央', '右'] },
    7:  { rx: 55, ry: 60, slope: '手前から奥', difficulty: '中', pinPositions: ['左手前', '中央', '右奥'] },
    8:  { rx: 75, ry: 80, slope: '奥から手前', difficulty: '中', pinPositions: ['左奥', '中央', '右手前'] },
    9:  { rx: 95, ry: 65, slope: '右から左（うねり）', difficulty: '難', pinPositions: ['左手前', '中央奥', '右'] },
    10: { rx: 80, ry: 70, slope: '奥から手前', difficulty: '中', pinPositions: ['左', '中央', '右奥'] },
    11: { rx: 55, ry: 55, slope: '左から右', difficulty: '易', pinPositions: ['左手前', '中央', '右奥'] },
    12: { rx: 85, ry: 75, slope: '手前から奥（2段）', difficulty: '難', pinPositions: ['上段左', '下段中央', '上段右'] },
    13: { rx: 75, ry: 65, slope: '右から左', difficulty: '中', pinPositions: ['左奥', '中央', '右手前'] },
    14: { rx: 70, ry: 70, slope: '奥から手前', difficulty: '易', pinPositions: ['左', '中央', '右'] },
    15: { rx: 80, ry: 60, slope: '左から右（速い）', difficulty: '中', pinPositions: ['左手前', '中央奥', '右'] },
    16: { rx: 50, ry: 55, slope: '手前から奥', difficulty: '難', pinPositions: ['左奥', '中央', '右手前'] },
    17: { rx: 90, ry: 75, slope: '右から左（2段）', difficulty: '難', pinPositions: ['上段左', '下段中央', '上段右'] },
    18: { rx: 80, ry: 70, slope: '奥から手前', difficulty: '中', pinPositions: ['左奥', '中央', '右手前'] },
  };

  const greenInfo = greenShapes[holeNumber] || greenShapes[1];

  // 難易度の色
  const difficultyColor = {
    '易': '#27ae60',
    '中': '#f39c12',
    '難': '#e74c3c',
  };

  return (
    <div className="green-popup-overlay" onClick={onClose}>
      <div className="green-popup-content" onClick={(e) => e.stopPropagation()}>
        {/* ヘッダー */}
        <div className="green-popup-header">
          <div className="green-popup-title">
            <h2>🟢 Hole {holeNumber} グリーン攻略図</h2>
            <div className="green-popup-specs">
              <span>Par {par}</span>
              <span>{yardage} yard</span>
              <span
                className="green-difficulty-badge"
                style={{ backgroundColor: difficultyColor[greenInfo.difficulty] }}
              >
                難易度: {greenInfo.difficulty}
              </span>
            </div>
          </div>
          <button className="green-popup-close" onClick={onClose} aria-label="閉じる">
            ✕
          </button>
        </div>

        {/* グリーン画像 or SVGプレースホルダー */}
        <div className="green-popup-body">
          {/* 実画像がある場合 */}
          <div className="green-image-container" style={{ display: imageExists ? 'block' : 'none' }}>
            {imageLoading && (
              <div className="green-image-loading">
                <div className="gps-spinner" />
                <p>画像を読み込み中...</p>
              </div>
            )}
            <img
              src={greenImageUrl}
              alt={`Hole ${holeNumber} グリーン攻略図`}
              className="green-detail-image"
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{ display: imageLoading ? 'none' : 'block' }}
            />
          </div>

          {/* 画像が無い場合：SVGプレースホルダー */}
          {!imageExists && (
            <div className="green-svg-container">
              <svg viewBox="0 0 300 300" className="green-svg-placeholder">
                {/* 背景（グリーン周りのラフ） */}
                <rect x="0" y="0" width="300" height="300" fill="#4a7c3f" rx="8" />

                {/* グリーン面 */}
                <ellipse
                  cx="150"
                  cy="150"
                  rx={greenInfo.rx}
                  ry={greenInfo.ry}
                  fill="#5cb85c"
                  stroke="#3d8b3d"
                  strokeWidth="2"
                />

                {/* アンジュレーション（等高線） */}
                <ellipse cx="150" cy="140" rx={greenInfo.rx * 0.7} ry={greenInfo.ry * 0.6}
                  fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="4 4" />
                <ellipse cx="150" cy="130" rx={greenInfo.rx * 0.45} ry={greenInfo.ry * 0.35}
                  fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="3 3" />

                {/* 傾斜方向矢印 */}
                <defs>
                  <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                    <polygon points="0 0, 8 3, 0 6" fill="rgba(255,255,255,0.6)" />
                  </marker>
                </defs>
                {greenInfo.slope.includes('奥から手前') && (
                  <line x1="150" y1="100" x2="150" y2="200" stroke="rgba(255,255,255,0.5)" strokeWidth="2" markerEnd="url(#arrowhead)" />
                )}
                {greenInfo.slope.includes('手前から奥') && (
                  <line x1="150" y1="200" x2="150" y2="100" stroke="rgba(255,255,255,0.5)" strokeWidth="2" markerEnd="url(#arrowhead)" />
                )}
                {greenInfo.slope.includes('左から右') && (
                  <line x1="90" y1="150" x2="210" y2="150" stroke="rgba(255,255,255,0.5)" strokeWidth="2" markerEnd="url(#arrowhead)" />
                )}
                {greenInfo.slope.includes('右から左') && (
                  <line x1="210" y1="150" x2="90" y2="150" stroke="rgba(255,255,255,0.5)" strokeWidth="2" markerEnd="url(#arrowhead)" />
                )}

                {/* 2段グリーン表示 */}
                {greenInfo.slope.includes('2段') && (
                  <>
                    <line x1="80" y1="150" x2="220" y2="150" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeDasharray="6 3" />
                    <text x="235" y="145" fill="rgba(255,255,255,0.6)" fontSize="10" fontWeight="bold">上段</text>
                    <text x="235" y="165" fill="rgba(255,255,255,0.6)" fontSize="10" fontWeight="bold">下段</text>
                  </>
                )}

                {/* ピンポジション（3箇所） */}
                {greenInfo.pinPositions.map((pos, idx) => {
                  const pinCoords = getPinCoords(pos, greenInfo.rx, greenInfo.ry);
                  return (
                    <g key={idx}>
                      <circle cx={150 + pinCoords.x} cy={150 + pinCoords.y} r="4" fill="#FFD700" stroke="#fff" strokeWidth="1" />
                      <line x1={150 + pinCoords.x} y1={150 + pinCoords.y - 4} x2={150 + pinCoords.x} y2={150 + pinCoords.y - 18}
                        stroke="#fff" strokeWidth="1.5" />
                      <polygon
                        points={`${150 + pinCoords.x},${150 + pinCoords.y - 18} ${150 + pinCoords.x + 8},${150 + pinCoords.y - 14} ${150 + pinCoords.x},${150 + pinCoords.y - 10}`}
                        fill="#e74c3c"
                      />
                    </g>
                  );
                })}

                {/* 花道表示 */}
                <path d="M 145 225 Q 150 210 155 225" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="8" />
                <text x="135" y="245" fill="rgba(255,255,255,0.5)" fontSize="10">花道</text>

                {/* バンカー */}
                <ellipse cx="85" cy="155" rx="15" ry="10" fill="#f5deb3" opacity="0.7" />
                <text x="73" y="175" fill="rgba(255,255,255,0.5)" fontSize="9">B</text>

              </svg>

              <p className="green-placeholder-note">
                ※ プレースホルダー表示中。<code>hole_img/lake-hamamatsu/Hole{holeNumber}_green.webp</code> を追加すると実画像が表示されます。
              </p>
            </div>
          )}

          {/* グリーン情報パネル */}
          <div className="green-info-panel">
            <div className="green-info-grid">
              <div className="green-info-item">
                <span className="green-info-label">⛰️ 傾斜</span>
                <span className="green-info-value">{greenInfo.slope}</span>
              </div>
              <div className="green-info-item">
                <span className="green-info-label">⚡ 難易度</span>
                <span
                  className="green-info-value"
                  style={{ color: difficultyColor[greenInfo.difficulty] }}
                >
                  {greenInfo.difficulty}
                </span>
              </div>
              <div className="green-info-item green-info-pins">
                <span className="green-info-label">🚩 ピン位置</span>
                <div className="green-pin-positions">
                  {greenInfo.pinPositions.map((pos, idx) => (
                    <span key={idx} className="green-pin-tag">
                      {['①', '②', '③'][idx]} {pos}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 攻略メモ */}
          <div className="green-strategy-section">
            <h3>📝 攻略メモ</h3>
            <GreenStrategyNotes holeNumber={holeNumber} />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * ピン位置のテキストからSVG座標を計算
 */
function getPinCoords(posText, rx, ry) {
  const coords = { x: 0, y: 0 };
  if (posText.includes('左'))   coords.x = -rx * 0.45;
  if (posText.includes('右'))   coords.x = rx * 0.45;
  if (posText.includes('奥'))   coords.y = -ry * 0.45;
  if (posText.includes('手前')) coords.y = ry * 0.45;
  if (posText.includes('上段')) coords.y = -ry * 0.3;
  if (posText.includes('下段')) coords.y = ry * 0.3;
  if (posText.includes('中央')) { /* keep at 0 */ }
  return coords;
}

/**
 * グリーン攻略メモ（localStorage で永続化）
 */
const GreenStrategyNotes = ({ holeNumber }) => {
  const storageKey = `golfys_green_notes_${holeNumber}`;
  const [notes, setNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) setNotes(saved);
  }, [storageKey]);

  const handleSave = () => {
    localStorage.setItem(storageKey, notes);
    setIsEditing(false);
  };

  return (
    <div className="green-notes">
      {isEditing ? (
        <>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="green-notes-textarea"
            placeholder="グリーンの攻略メモを入力...&#10;例: 右奥ピンは左手前から寄せる。速いので上は禁物。"
            rows={4}
          />
          <div className="green-notes-actions">
            <button className="btn btn-sm btn-primary" onClick={handleSave}>保存</button>
            <button className="btn btn-sm btn-secondary" onClick={() => setIsEditing(false)}>キャンセル</button>
          </div>
        </>
      ) : (
        <div className="green-notes-display" onClick={() => setIsEditing(true)}>
          {notes ? (
            <p>{notes}</p>
          ) : (
            <p className="green-notes-empty">タップしてメモを追加...</p>
          )}
        </div>
      )}
    </div>
  );
};

export default GreenDetailPopup;
