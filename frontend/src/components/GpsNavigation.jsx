import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { GoogleMap, Marker, Circle, OverlayView, Polyline } from '@react-google-maps/api';
import { HOLE_COORDINATES, calcDistanceMeters, metersToYards, calcBearing } from '../data/courseCoordinates';
import { GoogleMapsContext } from '../App';

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
 * GPS ナビゲーションコンポーネント
 * Google Maps 航空写真 + リアルタイム GPS 現在地 + 距離表示
 */
const GpsNavigation = ({ holeNumber, par, yardage, onGreenTap }) => {
  const [currentPos, setCurrentPos] = useState(null);
  const [gpsError, setGpsError] = useState(null);
  const [distanceToGreen, setDistanceToGreen] = useState(null);
  const [distanceToTee, setDistanceToTee] = useState(null);
  const watchIdRef = useRef(null);
  const mapRef = useRef(null);

  // App.jsx で一度だけロードした Google Maps の状態を Context から取得
  const { isLoaded, loadError, hasValidKey } = useContext(GoogleMapsContext);

  const holeCoords = HOLE_COORDINATES[holeNumber];

  // マップの中心をティーとグリーンの中間に設定
  const mapCenter = holeCoords
    ? {
        lat: (holeCoords.tee.lat + holeCoords.green.lat) / 2,
        lng: (holeCoords.tee.lng + holeCoords.green.lng) / 2,
      }
    : { lat: 34.804, lng: 137.564 };

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
    // ズームアウト制限を確実に適用
    map.setOptions({ minZoom: 15 });
    // fairwayAngle でグリーンが画面上部に来るよう heading を適用
    if (holeCoords && holeCoords.fairwayAngle != null) {
      map.setHeading(holeCoords.fairwayAngle);
    }
  }, [holeCoords]);

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

  // fairwayAngle を heading に設定し、グリーンが画面上部に来るようにする
  const mapHeading = holeCoords?.fairwayAngle ?? 0;

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
          center={mapCenter}
          zoom={getZoomLevel()}
          options={{ ...MAP_OPTIONS, heading: mapHeading }}
          onLoad={onMapLoad}
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

          {/* グリーン：クリック可能エリア */}
          {holeCoords && (
            <>
              <Circle
                center={holeCoords.green}
                radius={15}
                options={{
                  fillColor: '#00C851',
                  fillOpacity: 0.5,
                  strokeColor: '#00C851',
                  strokeWeight: 2,
                  clickable: true,
                }}
                onClick={onGreenTap}
              />
              {/* グリーンラベル */}
              <OverlayView
                position={holeCoords.green}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                <div
                  className="gps-green-label"
                  onClick={onGreenTap}
                  role="button"
                  tabIndex={0}
                >
                  🟢 Green
                </div>
              </OverlayView>
            </>
          )}

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
    </div>
  );
};

export default GpsNavigation;
