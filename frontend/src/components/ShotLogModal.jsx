import React, { useState, useEffect } from 'react';

/**
 * ショット入力モーダル
 * 新規登録 / 編集の両モードに対応。
 * editingShot が渡されると編集モードになり、既存データをプリフィルする。
 */
const CLUBS = [
  '1W', '3W', '5W', '7W',
  '3U', '4U', '5U',
  '2I', '3I', '4I', '5I', '6I', '7I', '8I', '9I',
  'PW', 'AW', 'SW', 'LW',
  'PT'
];

// 傾斜（複数選択可）
const SLOPES = [
  { value: 'flat',     label: '平坦',       icon: '➖' },
  { value: 'uphill',   label: '左足上がり', icon: '⬆️' },
  { value: 'downhill', label: '左足下がり', icon: '⬇️' },
  { value: 'toe_up',   label: 'つま先上がり', icon: '↗️' },
  { value: 'toe_down', label: 'つま先下がり', icon: '↘️' },
];

// 地点状況（単一選択）
const POSITIONS = [
  { value: 'tee',         label: 'ティー',     icon: '🔴' },
  { value: 'fairway',     label: 'フェアウェイ', icon: '🟢' },
  { value: 'rough',       label: 'ラフ',       icon: '🌿' },
  { value: 'bunker',      label: 'バンカー',   icon: '⛱️' },
  { value: 'green',       label: 'グリーン',   icon: '🏁' },
  { value: 'ob_penalty',  label: 'OB/ペナ',   icon: '🚫' },
  { value: 'bare_ground', label: 'ベアグラウンド', icon: '🟤' },
];

// ショット結果（単一選択）
const SHOT_RESULTS = [
  { value: 'good',   label: 'ナイスショット', icon: '👍' },
  { value: 'cup_in', label: 'カップイン',    icon: '🕳️' },
  { value: 'fat',    label: 'ダフり',       icon: '💥' },
  { value: 'thin',   label: 'トップ',       icon: '⚡' },
  { value: 'slice',  label: 'スライス(右)',  icon: '➡️' },
  { value: 'hook',   label: 'フック(左)',    icon: '⬅️' },
  { value: 'shank',  label: 'シャンク',     icon: '💀' },
];

/**
 * @param {boolean}  isOpen
 * @param {Function} onClose
 * @param {Function} onSave       - 新規: (shotData) => void / 編集: (shotData) => void
 * @param {number}   shotNumber
 * @param {object}   position     - { lat, lng }
 * @param {object|null} editingShot - 編集対象（null なら新規モード）
 * @param {Function|null} onDelete - 編集モード時の削除コールバック
 */
const ShotLogModal = ({ isOpen, onClose, onSave, shotNumber, position, editingShot, onDelete }) => {
  const [club, setClub] = useState('');
  const [slopes, setSlopes] = useState([]);
  const [positionType, setPositionType] = useState('');
  const [shotResult, setShotResult] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isEditMode = !!editingShot;

  // モーダルが開いた/editingShotが変わったときにフィールドを初期化
  useEffect(() => {
    if (!isOpen) {
      setConfirmDelete(false);
      return;
    }
    if (editingShot) {
      // 編集モード: 既存データをプリフィル
      setClub(editingShot.club || '');
      setSlopes(editingShot.slopes || []);
      setPositionType(editingShot.positionType || '');
      setShotResult(editingShot.shotResult || '');
    } else {
      // 新規モード
      setClub('');
      setSlopes([]);
      setPositionType(shotNumber === 1 ? 'tee' : '');
      setShotResult('');
    }
    setConfirmDelete(false);
  }, [isOpen, editingShot, shotNumber]);

  if (!isOpen) return null;

  // 傾斜のトグル（複数選択対応）
  const toggleSlope = (value) => {
    setSlopes((prev) => {
      if (value === 'flat') {
        return prev.includes('flat') ? [] : ['flat'];
      }
      const withoutFlat = prev.filter((s) => s !== 'flat');
      if (withoutFlat.includes(value)) {
        return withoutFlat.filter((s) => s !== value);
      }
      return [...withoutFlat, value];
    });
  };

  const handleSave = () => {
    if (!club) {
      alert('クラブを選択してください');
      return;
    }
    onSave({
      number: shotNumber,
      pos: position,
      club,
      slopes,
      positionType,
      shotResult,
      lie: POSITIONS.find((p) => p.value === positionType)?.label || '',
      shotType: positionType === 'ob_penalty' ? 'ob'
              : club === 'PT' ? 'putt'
              : 'normal',
    });
  };

  const handleCancel = () => {
    onClose();
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    if (onDelete) onDelete();
  };

  return (
    <div className="shotlog-modal-overlay" onClick={handleCancel}>
      <div className="shotlog-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* ヘッダー */}
        <div className={`shotlog-modal-header ${isEditMode ? 'shotlog-modal-header-edit' : ''}`}>
          <h3>{isEditMode ? '✏️' : '⛳'} ショット #{shotNumber} {isEditMode ? '編集' : '記録'}</h3>
          <button className="shotlog-modal-close" onClick={handleCancel} aria-label="閉じる">✕</button>
        </div>

        {/* 位置情報 */}
        <div className="shotlog-modal-position">
          <span className="shotlog-pos-icon">📍</span>
          <span className="shotlog-pos-text">
            {position ? `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}` : '位置不明'}
          </span>
        </div>

        {/* クラブ選択 */}
        <div className="shotlog-modal-section">
          <label className="shotlog-modal-label">🏌️ 使用クラブ *</label>
          <div className="shotlog-club-grid">
            {CLUBS.map((c) => (
              <button
                key={c}
                className={`shotlog-club-btn ${club === c ? 'active' : ''}`}
                onClick={() => setClub(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* 地点状況（単一選択） */}
        <div className="shotlog-modal-section">
          <label className="shotlog-modal-label">📍 地点状況</label>
          <div className="shotlog-position-grid">
            {POSITIONS.map((p) => (
              <button
                key={p.value}
                className={`shotlog-position-btn ${positionType === p.value ? 'active' : ''}`}
                onClick={() => setPositionType(p.value)}
              >
                <span className="shotlog-position-icon">{p.icon}</span>
                <span className="shotlog-position-text">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 傾斜（複数選択チェックボックス） */}
        <div className="shotlog-modal-section">
          <label className="shotlog-modal-label">⛰️ 傾斜 <span className="shotlog-label-hint">（複数選択可）</span></label>
          <div className="shotlog-slope-grid">
            {SLOPES.map((s) => {
              const checked = slopes.includes(s.value);
              return (
                <label
                  key={s.value}
                  className={`shotlog-slope-checkbox ${checked ? 'checked' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSlope(s.value)}
                  />
                  <span className="shotlog-slope-check-mark">{checked ? '✓' : ''}</span>
                  <span className="shotlog-slope-icon">{s.icon}</span>
                  <span className="shotlog-slope-text">{s.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* ショット結果（単一選択） */}
        <div className="shotlog-modal-section">
          <label className="shotlog-modal-label">🎯 ショット結果</label>
          <div className="shotlog-result-grid">
            {SHOT_RESULTS.map((r) => (
              <button
                key={r.value}
                className={`shotlog-result-btn ${shotResult === r.value ? 'active' : ''} shotlog-result-${r.value}`}
                onClick={() => setShotResult(shotResult === r.value ? '' : r.value)}
              >
                <span className="shotlog-result-icon">{r.icon}</span>
                <span className="shotlog-result-text">{r.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* アクションボタン */}
        <div className="shotlog-modal-actions">
          {isEditMode && onDelete && (
            <button
              className={`shotlog-btn-delete ${confirmDelete ? 'shotlog-btn-delete-confirm' : ''}`}
              onClick={handleDelete}
            >
              {confirmDelete ? '本当に削除' : '🗑 削除'}
            </button>
          )}
          <button className="shotlog-btn-cancel" onClick={handleCancel}>キャンセル</button>
          <button className="shotlog-btn-save" onClick={handleSave}>
            {isEditMode ? '更新する' : '記録する'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShotLogModal;
