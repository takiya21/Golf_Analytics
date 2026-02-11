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

export const COURSE_ZOOM = 16;

export const HOLE_COORDINATES = {
  1: {
    tee:   { lat: 34.80600, lng: 137.56200 },
    green: { lat: 34.80250, lng: 137.56250 },
    greenZoom: 19,
    fairwayAngle: 170, // 南向き
  },
  2: {
    tee:   { lat: 34.80200, lng: 137.56300 },
    green: { lat: 34.80000, lng: 137.56450 },
    greenZoom: 19,
    fairwayAngle: 155,
  },
  3: {
    tee:   { lat: 34.79950, lng: 137.56500 },
    green: { lat: 34.79850, lng: 137.56650 },
    greenZoom: 20,
    fairwayAngle: 135,
  },
  4: {
    tee:   { lat: 34.79800, lng: 137.56700 },
    green: { lat: 34.79400, lng: 137.56800 },
    greenZoom: 19,
    fairwayAngle: 175,
  },
  5: {
    tee:   { lat: 34.79350, lng: 137.56850 },
    green: { lat: 34.79000, lng: 137.56600 },
    greenZoom: 18,
    fairwayAngle: 210,
  },
  6: {
    tee:   { lat: 34.78950, lng: 137.56550 },
    green: { lat: 34.78700, lng: 137.56400 },
    greenZoom: 19,
    fairwayAngle: 200,
  },
  7: {
    tee:   { lat: 34.78650, lng: 137.56350 },
    green: { lat: 34.78550, lng: 137.56200 },
    greenZoom: 20,
    fairwayAngle: 225,
  },
  8: {
    tee:   { lat: 34.78500, lng: 137.56150 },
    green: { lat: 34.78200, lng: 137.56000 },
    greenZoom: 19,
    fairwayAngle: 195,
  },
  9: {
    tee:   { lat: 34.78150, lng: 137.55950 },
    green: { lat: 34.77800, lng: 137.56150 },
    greenZoom: 18,
    fairwayAngle: 160,
  },
  10: {
    tee:   { lat: 34.77850, lng: 137.56200 },
    green: { lat: 34.77550, lng: 137.56400 },
    greenZoom: 19,
    fairwayAngle: 155,
  },
  11: {
    tee:   { lat: 34.77600, lng: 137.56450 },
    green: { lat: 34.77500, lng: 137.56600 },
    greenZoom: 20,
    fairwayAngle: 140,
  },
  12: {
    tee:   { lat: 34.77550, lng: 137.56650 },
    green: { lat: 34.77950, lng: 137.56800 },
    greenZoom: 18,
    fairwayAngle: 15,
  },
  13: {
    tee:   { lat: 34.78000, lng: 137.56850 },
    green: { lat: 34.78400, lng: 137.56700 },
    greenZoom: 19,
    fairwayAngle: 345,
  },
  14: {
    tee:   { lat: 34.78450, lng: 137.56650 },
    green: { lat: 34.78700, lng: 137.56500 },
    greenZoom: 19,
    fairwayAngle: 335,
  },
  15: {
    tee:   { lat: 34.78750, lng: 137.56450 },
    green: { lat: 34.79050, lng: 137.56300 },
    greenZoom: 19,
    fairwayAngle: 340,
  },
  16: {
    tee:   { lat: 34.79100, lng: 137.56250 },
    green: { lat: 34.79200, lng: 137.56100 },
    greenZoom: 20,
    fairwayAngle: 330,
  },
  17: {
    tee:   { lat: 34.79250, lng: 137.56050 },
    green: { lat: 34.79650, lng: 137.55900 },
    greenZoom: 18,
    fairwayAngle: 345,
  },
  18: {
    tee:   { lat: 34.79700, lng: 137.55850 },
    green: { lat: 34.80050, lng: 137.56100 },
    greenZoom: 19,
    fairwayAngle: 25,
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
