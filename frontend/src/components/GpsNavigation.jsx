import React, { useState, useEffect, useCallback, useRef, useContext, useMemo } from 'react';
import { GoogleMap, Marker, Circle, OverlayView, Polyline } from '@react-google-maps/api';
import { HOLE_COORDINATES, calcDistanceMeters, metersToYards, calcBearing } from '../data/courseCoordinates';
import { GoogleMapsContext } from '../App';
import ShotLogModal from './ShotLogModal';
import ShotLogPanel from './ShotLogPanel';

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '100%',
};

const MAP_OPTIONS = {
  mapTypeId: 'satellite',
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  gestureHandling: 'greedy',
  rotateControl: true,
  tilt: 0,
  minZoom: 5,
};

// マーカーアイコン定義
const CURRENT_POS_ICON = {
  path: 0, // google.maps.SymbolPath.CIRCLE
  scale: 10,
  fillColor: '#4285F4',
  fillOpacity: 1,
  strokeColor: '#ffffff',
  strokeWeight: 3,
};

const TEE_ICON = {
  path: 0,
  scale: 8,
  fillColor: '#FF6B6B',
  fillOpacity: 0.9,
  strokeColor: '#ffffff',
  strokeWeight: 2,
};

/**
 * 日付文字列を読みやすいラベルに変換
 * @param {string} dateStr - "YYYY-MM-DD"
 * @returns {string} - "M/D (曜日)" 形式
 */
const DAY_NAMES = ['日', '月', '火', '水', '木', '金', '土'];
const formatDateLabel = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const dow = DAY_NAMES[d.getDay()];
  return `${m}/${day}(${dow})`;
};

// 日付ごとの色パレット（マップ上のポリライン・マーカーを色分け）
const DATE_COLORS = [
  '#00bcd4', // シアン
  '#ff9800', // オレンジ
  '#e91e63', // ピンク
  '#4caf50', // グリーン
  '#9c27b0', // パープル
  '#ffeb3b', // イエロー
  '#03a9f4', // ライトブルー
  '#ff5722', // ディープオレンジ
];

/**
 * GPS ナビゲーションコンポーネント
 * Google Maps 航空写真 + リアルタイム GPS 現在地 + 距離表示 + ショットログ
 */
const GpsNavigation = ({ holeNumber, par, yardage, onGreenTap, shots, onAddShot, onDeleteShot, onEditShot, onClearShots, selectedDates, availableDates, shotCountByDate, isAllSelected, onToggleDate, onToggleAllDates }) => {
  const [currentPos, setCurrentPos] = useState(null);
  const [gpsError, setGpsError] = useState(null);
  const [distanceToGreen, setDistanceToGreen] = useState(null);
  const [distanceToTee, setDistanceToTee] = useState(null);
  const watchIdRef = useRef(null);
  const mapRef = useRef(null);
  const mapInitializedRef = useRef(false);

  // ショットログモーダル状態
  const [shotModalOpen, setShotModalOpen] = useState(false);
  const [pendingPosition, setPendingPosition] = useState(null);
  const longPressTimerRef = useRef(null);

  // 編集中のショット状態
  const [editingShotIndex, setEditingShotIndex] = useState(null);
  const [editingShotData, setEditingShotData] = useState(null);

  // App.jsx で一度だけロードした Google Maps の状態を Context から取得
  const { isLoaded, loadError, hasValidKey } = useContext(GoogleMapsContext);

  const holeCoords = HOLE_COORDINATES[holeNumber];

  // マップの中心をティーとグリーンの中間に設定（useMemo で参照を安定化）
  const mapCenter = useMemo(() => holeCoords
    ? {
        lat: (holeCoords.tee.lat + holeCoords.green.lat) / 2,
        lng: (holeCoords.tee.lng + holeCoords.green.lng) / 2,
      }
    : { lat: 34.804, lng: 137.564 }, [holeCoords]);

  // GPS リアルタイム追跡
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsError('GPS機能がサポートされていません');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 1000,
    };

    const onSuccess = (position) => {
      const pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      setCurrentPos(pos);
      setGpsError(null);

      // グリーンまでの距離を計算
      if (holeCoords) {
        const distG = calcDistanceMeters(pos.lat, pos.lng, holeCoords.green.lat, holeCoords.green.lng);
        setDistanceToGreen(metersToYards(distG));

        const distT = calcDistanceMeters(pos.lat, pos.lng, holeCoords.tee.lat, holeCoords.tee.lng);
        setDistanceToTee(metersToYards(distT));
      }
    };

    const onError = (err) => {
      console.warn('GPS Error:', err.message);
      setGpsError(`GPS取得中: ${err.message}`);
    };

    // 初回取得
    navigator.geolocation.getCurrentPosition(onSuccess, onError, options);

    // リアルタイム追跡
    watchIdRef.current = navigator.geolocation.watchPosition(onSuccess, onError, options);

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [holeNumber, holeCoords]);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    mapInitializedRef.current = true;
    // ティー → グリーン方位を計算してグリーンが画面上部に来るよう heading を適用
    if (holeCoords) {
      const bearing = calcBearing(
        holeCoords.tee.lat, holeCoords.tee.lng,
        holeCoords.green.lat, holeCoords.green.lng
      );
      map.setHeading(bearing);

      // ティー・グリーン座標から表示範囲を制限（周囲に余裕を持たせる）
      const latMin = Math.min(holeCoords.tee.lat, holeCoords.green.lat);
      const latMax = Math.max(holeCoords.tee.lat, holeCoords.green.lat);
      const lngMin = Math.min(holeCoords.tee.lng, holeCoords.green.lng);
      const lngMax = Math.max(holeCoords.tee.lng, holeCoords.green.lng);
      const latPad = Math.max((latMax - latMin) * 0.05, 0.0000015);
      const lngPad = Math.max((lngMax - lngMin) * 0.05, 0.0000015);
      map.setOptions({
        minZoom: 15,
        restriction: {
          latLngBounds: {
            north: latMax + latPad,
            south: latMin - latPad,
            east: lngMax + lngPad,
            west: lngMin - lngPad,
          },
          strictBounds: false,
        },
      });
    } else {
      map.setOptions({ minZoom: 15 });
    }
  }, [holeCoords]);

  // ── ショットログ：現在地を記録 ──
  const handleRecordCurrentPos = useCallback(() => {
    if (!currentPos) {
      alert('GPS位置が取得できていません');
      return;
    }
    setPendingPosition({ ...currentPos });
    setShotModalOpen(true);
  }, [currentPos]);

  // ── ショットログ：マップ長押し（タップ）で手動記録 ──
  const handleMapClick = useCallback((e) => {
    // Google Maps のクリックイベントから座標を取得
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setPendingPosition({ lat, lng });
    setShotModalOpen(true);
  }, []);

  // ── ショットログ：モーダルで保存（新規 or 編集） ──
  const handleShotSave = useCallback((shotData) => {
    if (editingShotIndex !== null && onEditShot) {
      // 編集モード
      onEditShot(editingShotIndex, shotData);
    } else {
      // 新規追加
      onAddShot(shotData);
    }
    setShotModalOpen(false);
    setPendingPosition(null);
    setEditingShotIndex(null);
    setEditingShotData(null);
  }, [onAddShot, onEditShot, editingShotIndex]);

  const handleShotModalClose = useCallback(() => {
    setShotModalOpen(false);
    setPendingPosition(null);
    setEditingShotIndex(null);
    setEditingShotData(null);
  }, []);

  // ── ショットログ：編集開始 ──
  const handleEditShotStart = useCallback((index, shot) => {
    setEditingShotIndex(index);
    setEditingShotData(shot);
    setPendingPosition(shot.position);
    setShotModalOpen(true);
  }, []);

  // ── ショットログ：モーダル内から削除 ──
  const handleDeleteFromModal = useCallback((index) => {
    if (window.confirm(`ショット #${index + 1} を削除しますか？`)) {
      onDeleteShot(index);
      setShotModalOpen(false);
      setPendingPosition(null);
      setEditingShotIndex(null);
      setEditingShotData(null);
    }
  }, [onDeleteShot]);

  // 番号付きマーカーアイコンを生成
  const getShotMarkerIcon = useCallback((shotNumber, shotType, dateColor) => {
    let fillColor = dateColor || '#667eea';
    if (shotType === 'ob') fillColor = '#e74c3c';
    else if (shotType === 'penalty') fillColor = '#f39c12';
    return {
      path: 0, // google.maps.SymbolPath.CIRCLE
      scale: 14,
      fillColor,
      fillOpacity: 0.9,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      labelOrigin: typeof google !== 'undefined'
        ? new google.maps.Point(0, 0)
        : undefined,
    };
  }, []);

  // 日付→色のマッピング
  const dateColorMap = useMemo(() => {
    const map = {};
    if (availableDates) {
      // 降順のavailableDatesを昇順にして色を割り当て
      const sorted = [...availableDates].sort();
      sorted.forEach((d, i) => {
        map[d] = DATE_COLORS[i % DATE_COLORS.length];
      });
    }
    return map;
  }, [availableDates]);

  // ショット間の飛距離を計算してポリラインデータを生成（日付ごとにグループ化）
  const shotPolylines = useMemo(() => {
    if (!shots || shots.length < 2) return [];
    const lines = [];
    // 日付ごとにショットをグループ化して各日付内でポリラインを生成
    const byDate = {};
    shots.forEach((s) => {
      const d = s._date || '_';
      if (!byDate[d]) byDate[d] = [];
      byDate[d].push(s);
    });
    Object.entries(byDate).forEach(([date, dateShots]) => {
      for (let i = 0; i < dateShots.length - 1; i++) {
        const from = dateShots[i];
        const to = dateShots[i + 1];
        const distM = calcDistanceMeters(from.pos.lat, from.pos.lng, to.pos.lat, to.pos.lng);
        const distYd = metersToYards(distM);
        lines.push({
          path: [from.pos, to.pos],
          distance: distYd,
          midpoint: {
            lat: (from.pos.lat + to.pos.lat) / 2,
            lng: (from.pos.lng + to.pos.lng) / 2,
          },
          shotType: from.shotType,
          dateColor: dateColorMap[date] || '#00bcd4',
        });
      }
    });
    return lines;
  }, [shots, dateColorMap]);

  // マップのズームレベルを計算
  const getZoomLevel = () => {
    if (!holeCoords) return 17;
    // ヤーデージに基づいてズームを調整
    if (yardage > 450) return 16;
    if (yardage > 350) return 17;
    if (yardage > 200) return 17;
    return 18;
  };

  // ティーからグリーンへのフェアウェイライン
  const fairwayPath = holeCoords
    ? [holeCoords.tee, holeCoords.green]
    : [];

  // --- Google Maps API キーが無い場合のフォールバック ---
  if (!hasValidKey) {
    return (
      <div className="gps-nav-section">
        <div className="gps-nav-fallback">
          <div className="gps-nav-fallback-header">
            <span className="gps-nav-icon">📡</span>
            <h3>リアルタイム GPS ナビ</h3>
          </div>
          <div className="gps-hole-info-banner">
            <span className="gps-hole-badge">Hole {holeNumber}</span>
            <span className="gps-par-badge">Par {par}</span>
            <span className="gps-yard-badge">{yardage} yard</span>
          </div>
          {currentPos && holeCoords && (
            <div className="gps-distance-panel">
              <div className="gps-distance-item gps-distance-green">
                <span className="gps-distance-label">🏁 グリーンまで</span>
                <span className="gps-distance-value">{distanceToGreen} yd</span>
              </div>
              <div className="gps-distance-item gps-distance-tee">
                <span className="gps-distance-label">🏌️ ティーまで</span>
                <span className="gps-distance-value">{distanceToTee} yd</span>
              </div>
            </div>
          )}
          {gpsError && <p className="gps-error-msg">⚠️ {gpsError}</p>}
          <div className="gps-nav-setup-guide">
            <p>🗺️ Google Maps 航空写真を表示するには:</p>
            <ol>
              <li><a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer">Google Cloud Console</a> で Maps JavaScript API を有効化</li>
              <li>APIキーを取得</li>
              <li><code>Golf_Analytics/.env</code> に <code>VITE_GOOGLE_MAPS_API_KEY=取得したキー</code> を設定</li>
              <li>開発サーバーを再起動</li>
            </ol>
          </div>
          {holeCoords && (
            <button className="btn btn-green-detail" onClick={onGreenTap}>
              🟢 グリーン攻略図を見る
            </button>
          )}
        </div>
      </div>
    );
  }

  // --- Google Maps ロードエラー ---
  if (loadError) {
    return (
      <div className="gps-nav-section">
        <div className="gps-nav-fallback">
          <div className="gps-nav-fallback-header">
            <span className="gps-nav-icon">⚠️</span>
            <h3>Google Maps 読み込みエラー</h3>
          </div>
          <div className="gps-hole-info-banner">
            <span className="gps-hole-badge">Hole {holeNumber}</span>
            <span className="gps-par-badge">Par {par}</span>
            <span className="gps-yard-badge">{yardage} yard</span>
          </div>
          {currentPos && holeCoords && (
            <div className="gps-distance-panel">
              <div className="gps-distance-item gps-distance-green">
                <span className="gps-distance-label">🏁 グリーンまで</span>
                <span className="gps-distance-value">{distanceToGreen} yd</span>
              </div>
              <div className="gps-distance-item gps-distance-tee">
                <span className="gps-distance-label">🏌️ ティーまで</span>
                <span className="gps-distance-value">{distanceToTee} yd</span>
              </div>
            </div>
          )}
          <div className="gps-nav-setup-guide">
            <p>⚠️ Google Maps の読み込みに失敗しました</p>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{loadError.message}</p>
            <p>🔧 以下を確認してください:</p>
            <ol>
              <li><a href="https://console.cloud.google.com/apis/library/maps-backend.googleapis.com" target="_blank" rel="noreferrer">Maps JavaScript API</a> が有効化されているか</li>
              <li><a href="https://console.cloud.google.com/billing" target="_blank" rel="noreferrer">課金（Billing）</a>が有効化されているか</li>
              <li>APIキーの<a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer">アプリケーション制限</a>でこのドメインが許可されているか</li>
            </ol>
          </div>
          {holeCoords && (
            <button className="btn btn-green-detail" onClick={onGreenTap}>
              🟢 グリーン攻略図を見る
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="gps-nav-section">
        <div className="gps-nav-loading">
          <div className="gps-spinner" />
          <p>マップを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gps-nav-section">
      {/* ホール情報バナー */}
      <div className="gps-hole-info-banner">
        <span className="gps-hole-badge">Hole {holeNumber}</span>
        <span className="gps-par-badge">Par {par}</span>
        <span className="gps-yard-badge">{yardage} yard</span>
        {distanceToGreen !== null && (
          <span className="gps-remaining-badge">残り {distanceToGreen} yd</span>
        )}
      </div>

      {/* マップ */}
      <div className="gps-map-container">
        <GoogleMap
          mapContainerStyle={MAP_CONTAINER_STYLE}
          center={mapInitializedRef.current ? undefined : mapCenter}
          zoom={mapInitializedRef.current ? undefined : getZoomLevel()}
          options={MAP_OPTIONS}
          onLoad={onMapLoad}
          onClick={handleMapClick}
        >
          {/* フェアウェイライン（ティー→グリーン） */}
          {fairwayPath.length === 2 && (
            <Polyline
              path={fairwayPath}
              options={{
                strokeColor: '#FFD700',
                strokeOpacity: 0.6,
                strokeWeight: 3,
                geodesic: true,
                icons: [{
                  icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 3 },
                  offset: '0',
                  repeat: '20px',
                }],
              }}
            />
          )}

          {/* ティーマーカー */}
          {holeCoords && (
            <Marker
              position={holeCoords.tee}
              icon={TEE_ICON}
              title={`Hole ${holeNumber} Tee`}
            />
          )}

          {/* ── ショットログ：ポリライン（ショット間の線） ── */}
          {shotPolylines.map((line, idx) => (
            <React.Fragment key={`shot-line-${idx}`}>
              <Polyline
                path={line.path}
                options={{
                  strokeColor: line.shotType === 'ob' ? '#e74c3c' : line.shotType === 'penalty' ? '#f39c12' : line.dateColor,
                  strokeOpacity: 0.9,
                  strokeWeight: 3,
                  geodesic: true,
                }}
              />
              {/* 距離ラベル */}
              <OverlayView
                position={line.midpoint}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                <div className="shotlog-distance-label">
                  {line.distance} yd
                </div>
              </OverlayView>
            </React.Fragment>
          ))}

          {/* ── ショットログ：番号付きマーカー ── */}
          {shots && shots.map((shot, idx) => (
            <Marker
              key={`shot-marker-${idx}`}
              position={shot.pos}
              icon={getShotMarkerIcon(shot.number, shot.shotType, dateColorMap[shot._date])}
              label={{
                text: String(shot.number),
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '12px',
              }}
              title={`#${shot.number} ${shot.club} (${shot.lie || ''})`}
              zIndex={100 + idx}
            />
          ))}

          {/* 現在地マーカー */}
          {currentPos && (
            <>
              <Circle
                center={currentPos}
                radius={8}
                options={{
                  fillColor: '#4285F4',
                  fillOpacity: 0.15,
                  strokeColor: '#4285F4',
                  strokeWeight: 1,
                }}
              />
              <Marker
                position={currentPos}
                icon={CURRENT_POS_ICON}
                title="現在地"
                zIndex={999}
              />
            </>
          )}

          {/* ティー→グリーン距離ライン */}
          {holeCoords && (
            <Polyline
              path={[holeCoords.tee, holeCoords.green]}
              options={{
                strokeColor: '#4285F4',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                geodesic: true,
              }}
            />
          )}
        </GoogleMap>

        {/* ── ショットログ：現在地記録ボタン（マップ上にオーバーレイ） ── */}
        <button
          className="shotlog-record-btn"
          onClick={handleRecordCurrentPos}
          title="現在地をショット地点として記録"
        >
          <span className="shotlog-record-icon">📍</span>
          <span className="shotlog-record-text">現在地を記録</span>
        </button>
      </div>

      {/* 距離パネル */}
      <div className="gps-distance-panel">
        <div className="gps-distance-item gps-distance-green">
          <span className="gps-distance-label">🏁 ティー→グリーン</span>
          <span className="gps-distance-value">{yardage} yd</span>
        </div>
        {distanceToGreen !== null && (
          <div className="gps-distance-item gps-distance-tee">
            <span className="gps-distance-label">📍 現在地→グリーン</span>
            <span className="gps-distance-value">{distanceToGreen} yd</span>
          </div>
        )}
      </div>

      {/* グリーン攻略図ボタン */}
      <button className="btn btn-green-detail" onClick={onGreenTap}>
        🟢 グリーン攻略図を見る
      </button>

      {/* ── 日付セレクター（複数選択対応） ── */}
      {(availableDates && availableDates.length > 0) && (
        <div className="shotlog-date-selector">
          <div className="shotlog-date-header">
            <label className="shotlog-date-label">📅 日付選択</label>
            {availableDates.length > 1 && (
              <button
                className={`shotlog-date-all-btn ${isAllSelected ? 'shotlog-date-all-active' : ''}`}
                onClick={onToggleAllDates}
              >
                {isAllSelected ? '✓ 全選択中' : '全選択'}
              </button>
            )}
          </div>
          <div className="shotlog-date-tabs">
            {availableDates.map((date) => {
              const isSelected = selectedDates && selectedDates.includes(date);
              const color = dateColorMap[date] || '#667eea';
              const count = shotCountByDate ? shotCountByDate[date] : 0;
              return (
                <button
                  key={date}
                  className={`shotlog-date-tab ${isSelected ? 'shotlog-date-tab-active' : ''}`}
                  style={isSelected ? { borderColor: color, boxShadow: `0 2px 8px ${color}40` } : {}}
                  onClick={() => onToggleDate(date)}
                >
                  <span
                    className="shotlog-date-color-dot"
                    style={{ backgroundColor: color }}
                  />
                  {formatDateLabel(date)}
                  {count > 0 && (
                    <span className="shotlog-date-tab-count">{count}打</span>
                  )}
                </button>
              );
            })}
          </div>
          {/* 今日が一覧にない場合：今日のタブを表示 */}
          {!availableDates.includes(new Date().toISOString().slice(0, 10)) && (
            <button
              className="shotlog-date-tab shotlog-date-tab-new"
              onClick={() => onToggleDate(new Date().toISOString().slice(0, 10))}
            >
              ＋ 今日 ({formatDateLabel(new Date().toISOString().slice(0, 10))})
            </button>
          )}
        </div>
      )}

      {/* ── ショットログパネル ── */}
      <ShotLogPanel
        shots={shots || []}
        onDeleteShot={onDeleteShot}
        onEditShot={handleEditShotStart}
        onClearAll={onClearShots}
        selectedDates={selectedDates}
        dateColorMap={dateColorMap}
      />

      {/* ── ショット入力モーダル ── */}
      <ShotLogModal
        isOpen={shotModalOpen}
        onClose={handleShotModalClose}
        onSave={handleShotSave}
        onDelete={editingShotIndex !== null ? () => handleDeleteFromModal(editingShotIndex) : undefined}
        shotNumber={editingShotData ? editingShotData.number : (shots ? shots.length : 0) + 1}
        position={pendingPosition}
        editingShot={editingShotData}
      />
    </div>
  );
};

export default GpsNavigation;
