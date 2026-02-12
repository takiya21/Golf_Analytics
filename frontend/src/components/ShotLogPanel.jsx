import React, { useMemo, useState } from 'react';
import { calcDistanceMeters, metersToYards } from '../data/courseCoordinates';

/**
 * ショットログパネル
 * 記録された全ショットの一覧と、クラブ別平均飛距離を表示
 * 各ショットをタップで編集、スワイプ/ボタンで削除
 */
const ShotLogPanel = ({ shots, onDeleteShot, onClearAll, onEditShot, selectedDates, dateColorMap }) => {
  // 複数日付表示中か
  const isMultiDate = selectedDates && selectedDates.length > 1;

  // 各ショットの飛距離を計算（同じ日付の次の地点までの距離）
  const shotsWithDistance = useMemo(() => {
    return shots.map((shot, idx) => {
      let distance = null;
      // 次のショットが同じ日付の場合のみ距離を計算
      if (idx < shots.length - 1) {
        const next = shots[idx + 1];
        if (shot._date === next._date) {
          const distM = calcDistanceMeters(shot.pos.lat, shot.pos.lng, next.pos.lat, next.pos.lng);
          distance = metersToYards(distM);
        }
      }
      return { ...shot, distance };
    });
  }, [shots]);

  // クラブ別平均飛距離の算出
  const clubStats = useMemo(() => {
    const clubMap = {};
    shotsWithDistance.forEach((shot) => {
      if (shot.distance !== null && shot.shotType === 'normal' && shot.club !== 'PT') {
        if (!clubMap[shot.club]) {
          clubMap[shot.club] = { total: 0, count: 0, distances: [] };
        }
        clubMap[shot.club].total += shot.distance;
        clubMap[shot.club].count += 1;
        clubMap[shot.club].distances.push(shot.distance);
      }
    });
    return Object.entries(clubMap)
      .map(([club, data]) => ({
        club,
        avg: Math.round(data.total / data.count),
        max: Math.max(...data.distances),
        min: Math.min(...data.distances),
        count: data.count,
      }))
      .sort((a, b) => b.avg - a.avg);
  }, [shotsWithDistance]);

  // 合計距離
  const totalDistance = useMemo(() => {
    return shotsWithDistance.reduce((sum, s) => sum + (s.distance || 0), 0);
  }, [shotsWithDistance]);

  // ショット種別のアイコンと色
  const shotTypeInfo = {
    normal: { icon: '⛳', label: '通常', color: '#4ecdc4' },
    ob: { icon: '🚫', label: 'OB', color: '#e74c3c' },
    penalty: { icon: '⚠️', label: 'ペナ', color: '#f39c12' },
    putt: { icon: '🏌️', label: 'パット', color: '#667eea' },
  };

  // 地点状況のアイコン
  const positionInfo = {
    tee:         { icon: '🔴', label: 'ティー' },
    fairway:     { icon: '🟢', label: 'FW' },
    rough:       { icon: '🌿', label: 'ラフ' },
    bunker:      { icon: '⛱️', label: 'バンカー' },
    green:       { icon: '🏁', label: 'グリーン' },
    ob_penalty:  { icon: '🚫', label: 'OB/ペナ' },
    bare_ground: { icon: '🟤', label: 'ベア' },
  };

  // 傾斜のアイコン
  const slopeInfo = {
    flat:     { icon: '➖', label: '平坦' },
    uphill:   { icon: '⬆️', label: '左足上' },
    downhill: { icon: '⬇️', label: '左足下' },
    toe_up:   { icon: '↗️', label: 'つま先上' },
    toe_down: { icon: '↘️', label: 'つま先下' },
  };

  // ショット結果のアイコン
  const resultInfo = {
    good:   { icon: '👍', label: 'ナイス', color: '#4ecdc4' },
    cup_in: { icon: '🕳️', label: 'カップイン', color: '#ffd700' },
    fat:    { icon: '💥', label: 'ダフり', color: '#e74c3c' },
    thin:   { icon: '⚡', label: 'トップ', color: '#f39c12' },
    slice:  { icon: '➡️', label: 'スライス', color: '#e67e22' },
    hook:   { icon: '⬅️', label: 'フック', color: '#9b59b6' },
    shank:  { icon: '💀', label: 'シャンク', color: '#e74c3c' },
  };

  // ライのアイコン（後方互換用）
  const lieIcon = {
    'ティー': '🔴',
    'フェアウェイ': '🟢',
    'ラフ': '🌿',
    'バンカー': '⛱️',
    'グリーン': '🏁',
  };

  if (shots.length === 0) {
    return (
      <div className="shotlog-panel">
        <div className="shotlog-panel-header">
          <h3>📋 ショットログ</h3>
        </div>
        <div className="shotlog-empty">
          <p>📍 まだショットが記録されていません</p>
          <p className="shotlog-empty-hint">
            マップ上の「現在地を記録」ボタンまたはマップを長押しして地点を登録しましょう
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="shotlog-panel">
      {/* ヘッダー */}
      <div className="shotlog-panel-header">
        <h3>📋 ショットログ ({shots.length}打){isMultiDate && <span className="shotlog-header-date"> - {selectedDates.length}日分</span>}</h3>
        {onClearAll && (
          <button className="shotlog-clear-btn" onClick={onClearAll}>
            🗑 全消去
          </button>
        )}
      </div>

      {/* 合計距離 */}
      <div className="shotlog-total-distance">
        <span className="shotlog-total-label">合計飛距離</span>
        <span className="shotlog-total-value">{totalDistance} yd</span>
      </div>

      {/* ショット一覧 */}
      <div className="shotlog-list">
        {shotsWithDistance.map((shot, idx) => {
          // 日付が変わったらセパレーター表示（複数日付時）
          const showDateHeader = isMultiDate && (idx === 0 || shot._date !== shotsWithDistance[idx - 1]._date);
          const typeInfo = shotTypeInfo[shot.shotType] || shotTypeInfo.normal;
          // 地点状況: 新フィールド優先、後方互換でlieを使用
          const posInfo = shot.positionType
            ? positionInfo[shot.positionType]
            : null;
          const posLabel = posInfo
            ? `${posInfo.icon} ${posInfo.label}`
            : (shot.lie ? `${lieIcon[shot.lie] || '📍'} ${shot.lie}` : '');
          // 傾斜
          const slopeLabels = (shot.slopes && shot.slopes.length > 0)
            ? shot.slopes.map((sv) => slopeInfo[sv] || { icon: '', label: sv })
            : [];
          // ショット結果
          const resInfo = shot.shotResult ? resultInfo[shot.shotResult] : null;

          return (
            <React.Fragment key={idx}>
              {showDateHeader && (
                <div className="shotlog-date-group-header">
                  <span
                    className="shotlog-date-group-dot"
                    style={{ backgroundColor: (dateColorMap && dateColorMap[shot._date]) || '#667eea' }}
                  />
                  <span className="shotlog-date-group-text">{shot._date}</span>
                </div>
              )}
              <div className={`shotlog-item shotlog-item-${shot.shotType}`}>
              {/* 日付カラーインジケーター（複数日付表示時） */}
              {isMultiDate && dateColorMap && shot._date && (
                <div
                  className="shotlog-item-date-bar"
                  style={{ backgroundColor: dateColorMap[shot._date] || '#667eea' }}
                  title={shot._date}
                />
              )}
              <div className="shotlog-item-number">
                <span className="shotlog-number-badge">❶❷❸❹❺❻❼❽❾❿⓫⓬⓭⓮⓯⓰⓱⓲</span>
                <span className="shotlog-number-circle">{shot.number}</span>
              </div>
              <div className="shotlog-item-details">
                {/* 1行目: クラブ + 地点 + 種別 */}
                <div className="shotlog-item-top">
                  <span className="shotlog-club-badge">{shot.club}</span>
                  {posLabel && <span className="shotlog-lie-badge">{posLabel}</span>}
                  <span
                    className="shotlog-type-badge"
                    style={{ backgroundColor: typeInfo.color }}
                  >
                    {typeInfo.icon} {typeInfo.label}
                  </span>
                </div>
                {/* 2行目: 傾斜 + ショット結果 */}
                {(slopeLabels.length > 0 || resInfo) && (
                  <div className="shotlog-item-meta">
                    {slopeLabels.length > 0 && (
                      <span className="shotlog-slope-badges">
                        {slopeLabels.map((sl, i) => (
                          <span key={i} className="shotlog-slope-tag">{sl.icon}{sl.label}</span>
                        ))}
                      </span>
                    )}
                    {resInfo && (
                      <span
                        className="shotlog-result-tag"
                        style={{ backgroundColor: resInfo.color }}
                      >
                        {resInfo.icon} {resInfo.label}
                      </span>
                    )}
                  </div>
                )}
                {/* 3行目: 飛距離 */}
                {shot.distance !== null && (
                  <div className="shotlog-item-distance">
                    ➡️ <strong>{shot.distance} yd</strong>
                  </div>
                )}
              </div>
              <div className="shotlog-item-actions">
                {onEditShot && (
                  <button
                    className="shotlog-edit-btn"
                    onClick={() => onEditShot(idx, shot)}
                    title="編集"
                  >
                    ✏️
                  </button>
                )}
                {onDeleteShot && (
                  <button
                    className="shotlog-delete-btn"
                    onClick={() => {
                      if (window.confirm(`ショット #${shot.number} を削除しますか？`)) {
                        onDeleteShot(idx);
                      }
                    }}
                    title="削除"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* クラブ別平均飛距離 */}
      {clubStats.length > 0 && (
        <div className="shotlog-club-stats">
          <h4>📊 クラブ別飛距離</h4>
          <div className="shotlog-club-stats-table">
            <div className="shotlog-club-stats-header">
              <span>クラブ</span>
              <span>平均</span>
              <span>最大</span>
              <span>最小</span>
              <span>回数</span>
            </div>
            {clubStats.map((cs) => (
              <div key={cs.club} className="shotlog-club-stats-row">
                <span className="shotlog-club-stats-name">{cs.club}</span>
                <span className="shotlog-club-stats-avg">{cs.avg} yd</span>
                <span className="shotlog-club-stats-max">{cs.max} yd</span>
                <span className="shotlog-club-stats-min">{cs.min} yd</span>
                <span className="shotlog-club-stats-count">{cs.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShotLogPanel;
