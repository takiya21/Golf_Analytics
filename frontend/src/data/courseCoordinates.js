/**
 * レイク浜松カントリークラブ ホール座標データ
 * 
 * 各ホールの tee（ティーグラウンド）と green（グリーン中心）の緯度経度。
 * Google Maps 航空写真で実際の座標に合わせて調整してください。
 * 
 * greenZoom: グリーン詳細ポップアップ表示時のズームレベル
 */

export const COURSE_CENTER = {
  lat: 34.8040,
  lng: 137.5640,
};

export const COURSE_ZOOM = 25;

export const HOLE_COORDINATES = {
  1: {
    tee:   { lat: 34.886250, lng: 137.670391 },
    green: { lat: 34.882952, lng: 137.669424 },
    greenZoom: 20,
    fairwayAngle: 194,
  },
  2: {
    tee:   { lat: 34.882775, lng: 137.668139 },
    green: { lat: 34.880926, lng: 137.666173 },
    greenZoom: 19,
    fairwayAngle: 221,
  },
  3: {
    tee:   { lat: 34.880425, lng: 137.667115 },
    green: { lat: 34.879133, lng: 137.666174 },
    greenZoom: 20,
    fairwayAngle: 211,
  },
  4: {
    tee:   { lat: 34.879417, lng: 137.665466 },
    green: { lat: 34.882714, lng: 137.666136 },
    greenZoom: 19,
    fairwayAngle: 9,
  },
  5: {
    tee:   { lat: 34.882725, lng: 137.666936 },
    green: { lat: 34.885562, lng: 137.668971 },
    greenZoom: 18,
    fairwayAngle: 30,
  },
  6: {
    tee:   { lat: 34.885920, lng: 137.669686 },
    green: { lat: 34.883245, lng: 137.668583 },
    greenZoom: 19,
    fairwayAngle: 199,
  },
  7: {
    tee:   { lat: 34.882770, lng: 137.668125 },
    green: { lat: 34.880936, lng: 137.666169 },
    greenZoom: 20,
    fairwayAngle: 221,
  },
  8: {
    tee:   { lat: 34.880538, lng: 137.667315 },
    green: { lat: 34.882737, lng: 137.670087 },
    greenZoom: 19,
    fairwayAngle: 46,
  },
  9: {
    tee:   { lat: 34.882986, lng: 137.670762 },
    green: { lat: 34.886745, lng: 137.671023 },
    greenZoom: 18,
    fairwayAngle: 3,
  },
  10: {
    tee:   { lat: 34.887716, lng: 137.671958 },
    green: { lat: 34.887835, lng: 137.676451 },
    greenZoom: 19,
    fairwayAngle: 88,
  },
  11: {
    tee:   { lat: 34.889070, lng: 137.676383 },
    green: { lat: 34.887812, lng: 137.676443 },
    greenZoom: 20,
    fairwayAngle: 178,
  },
  12: {
    tee:   { lat: 34.886842, lng: 137.676274 },
    green: { lat: 34.883361, lng: 137.678116 },
    greenZoom: 18,
    fairwayAngle: 157,
  },
  13: {
    tee:   { lat: 34.882810, lng: 137.677662 },
    green: { lat: 34.886022, lng: 137.675932 },
    greenZoom: 19,
    fairwayAngle: 336,
  },
  14: {
    tee:   { lat: 34.885713, lng: 137.675548 },
    green: { lat: 34.883287, lng: 137.675414 },
    greenZoom: 19,
    fairwayAngle: 183,
  },
  15: {
    tee:   { lat: 34.882812, lng: 137.675177 },
    green: { lat: 34.885664, lng: 137.674579 },
    greenZoom: 19,
    fairwayAngle: 350,
  },
  16: {
    tee:   { lat: 34.885552, lng: 137.673907 },
    green: { lat: 34.884261, lng: 137.672812 },
    greenZoom: 20,
    fairwayAngle: 215,
  },
  17: {
    tee:   { lat: 34.884039, lng: 137.672015 },
    green: { lat: 34.886712, lng: 137.675577 },
    greenZoom: 18,
    fairwayAngle: 48,
  },
  18: {
    tee:   { lat: 34.887264, lng: 137.675254 },
    green: { lat: 34.887131, lng: 137.671447 },
    greenZoom: 19,
    fairwayAngle: 268,
  },
};

/**
 * 2点間の距離をメートルで計算（Haversine Formula）
 */
export function calcDistanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * メートル → ヤード変換
 */
export function metersToYards(m) {
  return Math.round(m * 1.09361);
}

/**
 * 2点間の方位角（bearing）を度数で計算
 * 北=0°, 東=90°, 南=180°, 西=270°
 */
export function calcBearing(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const toDeg = (rad) => (rad * 180) / Math.PI;
  const dLng = toRad(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}
