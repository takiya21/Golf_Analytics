import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import GpsNavigation from '../components/GpsNavigation';
import GreenDetailPopup from '../components/GreenDetailPopup';
import ShotAnalysis from '../components/ShotAnalysis';
import '../styles/holeDetail.css';
import '../styles/gpsNavigation.css';
import '../styles/shotLog.css';
import '../styles/shotAnalysis.css';

const HoleDetail = () => {
  const navigate = useNavigate();
  const { holeId } = useParams();

  // Lake Hamamatsu コースデータ
  const parArray = [4, 4, 3, 4, 5, 4, 3, 4, 5, 4, 3, 5, 4, 4, 4, 3, 5, 4];
  const yardageArray = [420, 306, 182, 443, 472, 350, 173, 391, 492, 400, 151, 500, 442, 320, 366, 191, 508, 383];
  const handicapArray = [9, 15, 17, 3, 1, 11, 18, 13, 5, 7, 16, 2, 8, 14, 10, 18, 4, 12];
  const basePath = import.meta.env.BASE_URL;
  
  const courseData = {
    id: 'lake-hamamatsu',
    name: 'レイク浜松カントリークラブ',
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
        image: `${basePath}hole_img/lake-hamamatsu/Hole${holeNum}_par${holePar}_${holeYardage}yard.webp`
      };
    })
  };

  const currentHoleNumber = parseInt(holeId);
  const hole = courseData.holes.find(h => h.hole_number === currentHoleNumber);

  // ローカルストレージからこのホールの履歴データを取得
  const holeHistory = useMemo(() => {
    const rounds = JSON.parse(localStorage.getItem('golfys_rounds') || '[]');
    return rounds
      .flatMap(round => {
        const holeData = round.holes[currentHoleNumber];
        if (!holeData || !holeData.score) return [];
        return {
          date: round.play_date,
          score: holeData.score,
          putts: holeData.putts || 0,
          first_club: holeData.first_club || '-',
          fairway_kept: holeData.fairway_kept || '-',
          ob_count: holeData.ob_count || 0,
          bunker_count: holeData.bunker_count || 0,
          penalty_count: holeData.penalty_count || 0
        };
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [currentHoleNumber]);

  // 統計データの計算
  const stats = useMemo(() => {
    if (!hole || holeHistory.length === 0) {
      return {
        bestScore: '-',
        avgScore: '-',
        roundCount: 0,
        eagle: { count: 0, percentage: 0 },
        birdie: { count: 0, percentage: 0 },
        par: { count: 0, percentage: 0 },
        bogey: { count: 0, percentage: 0 },
        tripleBogie: { count: 0, percentage: 0 },
        extraBogie: { count: 0, percentage: 0 },
        avgPutts: '-',
        totalOB: { count: 0, percentage: 0 },
        totalBunker: { count: 0, percentage: 0 },
        totalPenalty: { count: 0, percentage: 0 },
        parOnRate: 0,
        bogeyOnRate: 0,
        fairwayKeptRate: 0,
        fairwayLeftRate: 0,
        fairwayRightRate: 0,
        fairwayShortRate: 0,
        birdieOrBetter: { count: 0, percentage: 0 },
        doubleBogey: { count: 0, percentage: 0 },
        tripleBogey: { count: 0, percentage: 0 },
        extraBogey: { count: 0, percentage: 0 }
      };
    }

    const holePar = hole.par;
    const scores = holeHistory.map(h => h.score);
    const putts = holeHistory.map(h => h.putts);

    const bestScore = Math.min(...scores);
    const avgScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2);
    const avgPutts = (putts.reduce((a, b) => a + b, 0) / putts.length).toFixed(2);
    const roundCount = scores.length;

    // スコア分類
    const birdieOrBetterCount = scores.filter(s => s <= holePar - 1).length;
    const parCount = scores.filter(s => s === holePar).length;
    const bogeyCount = scores.filter(s => s === holePar + 1).length;
    const doubleBogeyCount = scores.filter(s => s === holePar + 2).length;
    const tripleBogeyCount = scores.filter(s => s === holePar + 3).length;
    const extraBogeyCount = scores.filter(s => s >= holePar + 4).length;

    // OB, バンカー, ペナルティ集計
    const obCount = holeHistory.reduce((sum, h) => sum + (h.ob_count || 0), 0);
    const bunkerCount = holeHistory.reduce((sum, h) => sum + (h.bunker_count || 0), 0);
    const penaltyCount = holeHistory.reduce((sum, h) => sum + (h.penalty_count || 0), 0);

    // フェアウェイキープ集計
    const fairwayKeptCount = holeHistory.filter(h => h.fairway_kept === '〇').length;
    const fairwayLeftCount = holeHistory.filter(h => h.fairway_kept === '左').length;
    const fairwayRightCount = holeHistory.filter(h => h.fairway_kept === '右').length;
    const fairwayShortCount = holeHistory.filter(h => h.fairway_kept === 'ショート').length;

    // 割合計算関数
    const calcPercentage = (count) => {
      return roundCount > 0 ? ((count / roundCount) * 100).toFixed(1) : 0;
    };

    // パーオン率（バーディ以下 + パー）
    const parOnCount = birdieOrBetterCount + parCount;
    const parOnRate = calcPercentage(parOnCount);

    // ボギーオン率（ボギー + ダブルボギー）
    const bogeyOnCount = bogeyCount + doubleBogeyCount;
    const bogeyOnRate = calcPercentage(bogeyOnCount);

    return {
      bestScore,
      avgScore,
      roundCount,
      birdieOrBetter: { count: birdieOrBetterCount, percentage: calcPercentage(birdieOrBetterCount) },
      par: { count: parCount, percentage: calcPercentage(parCount) },
      bogey: { count: bogeyCount, percentage: calcPercentage(bogeyCount) },
      doubleBogey: { count: doubleBogeyCount, percentage: calcPercentage(doubleBogeyCount) },
      tripleBogey: { count: tripleBogeyCount, percentage: calcPercentage(tripleBogeyCount) },
      extraBogey: { count: extraBogeyCount, percentage: calcPercentage(extraBogeyCount) },
      avgPutts,
      totalOB: { count: obCount, percentage: calcPercentage(obCount) },
      totalBunker: { count: bunkerCount, percentage: calcPercentage(bunkerCount) },
      totalPenalty: { count: penaltyCount, percentage: calcPercentage(penaltyCount) },
      parOnRate,
      bogeyOnRate,
      fairwayKeptRate: calcPercentage(fairwayKeptCount),
      fairwayLeftRate: calcPercentage(fairwayLeftCount),
      fairwayRightRate: calcPercentage(fairwayRightCount),
      fairwayShortRate: calcPercentage(fairwayShortCount)
    };
  }, [holeHistory, hole]);

  // スコア分布のグラフデータ
  const scoreDistributionData = useMemo(() => {
    const data = [];
    if (stats.birdieOrBetter.count > 0) data.push({ name: 'バーディ以下', value: stats.birdieOrBetter.count });
    if (stats.par.count > 0) data.push({ name: 'パー', value: stats.par.count });
    if (stats.bogey.count > 0) data.push({ name: 'ボギー', value: stats.bogey.count });
    if (stats.doubleBogey.count > 0) data.push({ name: 'ダブル', value: stats.doubleBogey.count });
    if (stats.tripleBogey.count > 0) data.push({ name: 'トリプル', value: stats.tripleBogey.count });
    if (stats.extraBogey.count > 0) data.push({ name: '＋４以上', value: stats.extraBogey.count });
    return data;
  }, [stats]);

  // グラフ用データ
  const chartData = holeHistory.map((h, idx) => ({
    date: new Date(h.date).toLocaleDateString('ja-JP'),
    score: h.score,
    putts: h.putts,
    roundIndex: idx + 1
  }));

  // フォーム状態
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    score: '',
    putts: '',
    first_club: '',
    fairway_kept: '',
    ob_count: 0,
    bunker_count: 0,
    penalty_count: 0
  });

  // グリーン攻略図ポップアップ状態
  const [isGreenPopupOpen, setIsGreenPopupOpen] = useState(false);
  const handleGreenTap = useCallback(() => setIsGreenPopupOpen(true), []);
  const handleGreenClose = useCallback(() => setIsGreenPopupOpen(false), []);

  // タブ切り替え状態
  const [activeTab, setActiveTab] = useState('map');

  // ── ショットログ state ──
  // LocalStorage キー: golfys_shotlog_<holeNumber>
  // 保存形式: { "YYYY-MM-DD": [shot, ...], ... }（日付別にグループ化）
  const shotLogKey = `golfys_shotlog_${currentHoleNumber}`;

  // 今日の日付文字列
  const todayStr = new Date().toISOString().slice(0, 10);

  const [shotLogByDate, setShotLogByDate] = useState(() => {
    try {
      const saved = localStorage.getItem(shotLogKey);
      if (!saved) return {};
      const parsed = JSON.parse(saved);
      // 後方互換：旧フォーマット（配列）→ 新フォーマット（日付キーオブジェクト）へ移行
      if (Array.isArray(parsed)) {
        if (parsed.length === 0) return {};
        return { [todayStr]: parsed };
      }
      return parsed;
    } catch {
      return {};
    }
  });

  // 選択中の日付（複数選択対応）
  const [selectedDates, setSelectedDates] = useState([todayStr]);

  // 利用可能な日付一覧（降順ソート）
  const availableDates = useMemo(() => {
    return Object.keys(shotLogByDate)
      .filter((d) => shotLogByDate[d] && shotLogByDate[d].length > 0)
      .sort((a, b) => b.localeCompare(a));
  }, [shotLogByDate]);

  // 日付ごとのショット数マップ
  const shotCountByDate = useMemo(() => {
    const counts = {};
    availableDates.forEach((d) => {
      counts[d] = (shotLogByDate[d] || []).length;
    });
    return counts;
  }, [shotLogByDate, availableDates]);

  // 全選択中かどうか
  const isAllSelected = useMemo(() => {
    return availableDates.length > 0 && availableDates.every((d) => selectedDates.includes(d));
  }, [availableDates, selectedDates]);

  // 日付トグル
  const handleToggleDate = useCallback((date) => {
    setSelectedDates((prev) => {
      if (prev.includes(date)) {
        const next = prev.filter((d) => d !== date);
        return next.length > 0 ? next : [date]; // 最低1つは選択
      }
      return [...prev, date];
    });
  }, []);

  // 全選択 / 全解除
  const handleToggleAllDates = useCallback(() => {
    if (isAllSelected) {
      // 全解除 → 今日のみ or 最新日付のみ
      setSelectedDates([availableDates[0] || todayStr]);
    } else {
      setSelectedDates([...availableDates]);
    }
  }, [isAllSelected, availableDates, todayStr]);

  // 選択中の全日付のショットを結合（日付情報タグ付き）
  const shotLog = useMemo(() => {
    const combined = [];
    // 選択日付を昇順で処理
    const sortedDates = [...selectedDates].sort();
    sortedDates.forEach((date) => {
      const shots = shotLogByDate[date] || [];
      shots.forEach((shot) => {
        combined.push({ ...shot, _date: date });
      });
    });
    return combined;
  }, [shotLogByDate, selectedDates]);

  // 編集・削除対象の日付を特定するためのアクティブ編集日付
  // （パネルから操作される場合、ショットの _date を使う）

  // ショットログをローカルストレージに同期
  useEffect(() => {
    localStorage.setItem(shotLogKey, JSON.stringify(shotLogByDate));
  }, [shotLogByDate, shotLogKey]);

  // ── ショットログからスコアを自動記録 ──
  useEffect(() => {
    if (!hole) return;
    const rounds = JSON.parse(localStorage.getItem('golfys_rounds') || '[]');
    let updated = false;

    Object.entries(shotLogByDate).forEach(([date, shots]) => {
      if (!shots || shots.length === 0) return;
      const shotCount = shots.length;
      const puttCount = shots.filter(s => s.shotType === 'putt' || s.club === 'PT').length;
      const obCount = shots.filter(s => s.shotType === 'ob' || s.positionType === 'ob_penalty').length;
      const bunkerCount = shots.filter(s => s.positionType === 'bunker').length;
      const firstClub = shots[0]?.club || '-';
      // フェアウェイキープ判定: 2打目がフェアウェイなら〇
      const secondShot = shots[1];
      let fwKept = '-';
      if (secondShot) {
        if (secondShot.positionType === 'fairway') fwKept = '〇';
        else if (secondShot.positionType === 'rough') fwKept = '左'; // 簡易判定
      }

      const holeScore = {
        score: shotCount,
        putts: puttCount,
        first_club: firstClub,
        fairway_kept: fwKept,
        ob_count: obCount,
        bunker_count: bunkerCount,
        penalty_count: obCount,
        _from_shotlog: true, // ショットログから自動記録のマーカー
      };

      let existingRound = rounds.find(r => r.play_date === date);
      if (existingRound) {
        // 既存ラウンドのこのホールにショットログデータを更新
        const existingHole = existingRound.holes[currentHoleNumber];
        if (!existingHole || existingHole._from_shotlog) {
          existingRound.holes[currentHoleNumber] = holeScore;
          updated = true;
        }
      } else {
        rounds.push({
          id: Date.now() + Math.random(),
          course_id: 'lake-hamamatsu',
          course_name: 'レイク浜松カントリークラブ',
          play_date: date,
          holes: { [currentHoleNumber]: holeScore },
          created_at: new Date().toISOString(),
          _from_shotlog: true,
        });
        updated = true;
      }
    });

    if (updated) {
      localStorage.setItem('golfys_rounds', JSON.stringify(rounds));
    }
  }, [shotLogByDate, currentHoleNumber, hole]);

  // ショット追加（今日の日付に追加）
  const handleAddShot = useCallback((shotData) => {
    const dateKey = todayStr;
    setShotLogByDate((prev) => {
      const existing = prev[dateKey] || [];
      return { ...prev, [dateKey]: [...existing, shotData] };
    });
    // 今日が選択に入っていなければ追加
    setSelectedDates((prev) => prev.includes(todayStr) ? prev : [...prev, todayStr]);
  }, [todayStr]);

  // ショット削除（_date タグから対象日付を特定）
  const handleDeleteShot = useCallback((combinedIndex) => {
    const target = shotLog[combinedIndex];
    if (!target) return;
    const dateKey = target._date;
    setShotLogByDate((prev) => {
      const existing = prev[dateKey] || [];
      // combinedIndex は結合配列内のインデックス。対象日付内のインデックスを求める
      const dateShots = existing.filter((s) => s !== target);
      // 正確にマッチさせるため、位置で特定
      let dateIndex = 0;
      const sortedDates = [...selectedDates].sort();
      let offset = 0;
      for (const d of sortedDates) {
        if (d === dateKey) break;
        offset += (prev[d] || []).length;
      }
      dateIndex = combinedIndex - offset;

      const updated = existing.filter((_, i) => i !== dateIndex)
        .map((s, i) => ({ ...s, number: i + 1 }));
      if (updated.length === 0) {
        const newState = { ...prev };
        delete newState[dateKey];
        return newState;
      }
      return { ...prev, [dateKey]: updated };
    });
  }, [shotLog, selectedDates]);

  // ショット編集（_date タグから対象日付を特定）
  const handleEditShot = useCallback((combinedIndex, updatedData) => {
    const target = shotLog[combinedIndex];
    if (!target) return;
    const dateKey = target._date;
    setShotLogByDate((prev) => {
      const sortedDates = [...selectedDates].sort();
      let offset = 0;
      for (const d of sortedDates) {
        if (d === dateKey) break;
        offset += (prev[d] || []).length;
      }
      const dateIndex = combinedIndex - offset;

      const existing = prev[dateKey] || [];
      const updated = existing.map((s, i) => {
        if (i === dateIndex) {
          return { ...updatedData, number: i + 1 };
        }
        return s;
      });
      return { ...prev, [dateKey]: updated };
    });
  }, [shotLog, selectedDates]);

  // 全ショットクリア（選択中の全日付のショットをクリア）
  const handleClearShots = useCallback(() => {
    const dateLabel = selectedDates.length > 1
      ? `${selectedDates.length}日分`
      : selectedDates[0];
    if (window.confirm(`${dateLabel} のショットログを全て削除しますか？`)) {
      setShotLogByDate((prev) => {
        const newState = { ...prev };
        selectedDates.forEach((d) => delete newState[d]);
        return newState;
      });
    }
  }, [selectedDates]);

  const clubs = ['ドライバー', '3W', '5W', '4U', '5U', '6U', '2I', '3I', '4I', '5I', '6I', '7I', '8I', '9I', 'PW', 'AW', 'SW', 'パター'];
  const fwKeepOptions = ['〇', '左', '右', 'ショート'];

  // スコア追加
  const handleAddScore = () => {
    if (!formData.score) {
      alert('スコアを入力してください');
      return;
    }

    const rounds = JSON.parse(localStorage.getItem('golfys_rounds') || '[]');
    
    // 新しいラウンドを作成するか、既存ラウンドに追加するか判定
    const existingRound = rounds.find(r => r.play_date === formData.date);
    
    if (existingRound) {
      // 既存ラウンドに追加
      existingRound.holes[currentHoleNumber] = {
        score: parseInt(formData.score),
        putts: parseInt(formData.putts) || 0,
        first_club: formData.first_club,
        fairway_kept: formData.fairway_kept,
        ob_count: parseInt(formData.ob_count) || 0,
        bunker_count: parseInt(formData.bunker_count) || 0,
        penalty_count: parseInt(formData.penalty_count) || 0
      };
    } else {
      // 新しいラウンドを作成
      const newRound = {
        id: Date.now(),
        course_id: 'lake-hamamatsu',
        course_name: courseData.name,
        play_date: formData.date,
        holes: {
          [currentHoleNumber]: {
            score: parseInt(formData.score),
            putts: parseInt(formData.putts) || 0,
            first_club: formData.first_club,
            fairway_kept: formData.fairway_kept,
            ob_count: parseInt(formData.ob_count) || 0,
            bunker_count: parseInt(formData.bunker_count) || 0,
            penalty_count: parseInt(formData.penalty_count) || 0
          }
        },
        created_at: new Date().toISOString()
      };
      rounds.push(newRound);
    }

    localStorage.setItem('golfys_rounds', JSON.stringify(rounds));
    
    alert('スコアが保存されました！');
    
    // フォームをリセット
    setFormData({
      date: new Date().toISOString().split('T')[0],
      score: '',
      putts: '',
      first_club: '',
      fairway_kept: '',
      ob_count: 0,
      bunker_count: 0,
      penalty_count: 0
    });
  };

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
    <div className="hole-detail-page hole-detail-tabbed">
      <div className="hole-detail-container">

        {/* ===== コースマップ タブ ===== */}
        {activeTab === 'map' && (
          <>
            {/* ホールナビゲーション（マップ上部） */}
            <div className="navigation-buttons map-top-nav">
              {prevHole ? (
                <button className="btn btn-secondary" onClick={() => navigate(`/hole/${prevHole}`)}>
                  ← Hole {prevHole}
                </button>
              ) : <span />}
              <button className="btn btn-tertiary" onClick={() => navigate('/courses')}>
                コース一覧
              </button>
              {nextHole ? (
                <button className="btn btn-secondary" onClick={() => navigate(`/hole/${nextHole}`)}>
                  Hole {nextHole} →
                </button>
              ) : <span />}
            </div>

            <GpsNavigation
              holeNumber={hole.hole_number}
              par={hole.par}
              yardage={hole.yardage}
              onGreenTap={handleGreenTap}
              shots={shotLog}
              onAddShot={handleAddShot}
              onDeleteShot={handleDeleteShot}
              onEditShot={handleEditShot}
              onClearShots={handleClearShots}
              selectedDates={selectedDates}
              availableDates={availableDates}
              shotCountByDate={shotCountByDate}
              isAllSelected={isAllSelected}
              onToggleDate={handleToggleDate}
              onToggleAllDates={handleToggleAllDates}
            />

            {/* スコア詳細カード */}
            <div className="hole-score-summary-card">
              <div className="hole-score-summary-header">
                <span className="hole-score-summary-title">Hole {hole.hole_number}</span>
                <span className="hole-score-summary-par">Par {hole.par} / {hole.yardage}yd</span>
              </div>
              {stats.roundCount > 0 ? (
                <div className="hole-score-summary-stats">
                  <div className="hole-score-mini-stat">
                    <span className="mini-stat-value">{stats.bestScore}</span>
                    <span className="mini-stat-label">ベスト</span>
                  </div>
                  <div className="hole-score-mini-stat">
                    <span className="mini-stat-value">{stats.avgScore}</span>
                    <span className="mini-stat-label">平均</span>
                  </div>
                  <div className="hole-score-mini-stat">
                    <span className="mini-stat-value">{stats.avgPutts}</span>
                    <span className="mini-stat-label">Avg パット</span>
                  </div>
                  <div className="hole-score-mini-stat">
                    <span className="mini-stat-value">{stats.roundCount}</span>
                    <span className="mini-stat-label">ラウンド</span>
                  </div>
                </div>
              ) : (
                <p className="hole-score-summary-empty">まだスコアデータがありません</p>
              )}
              <button
                className="hole-score-detail-btn"
                onClick={() => setActiveTab('score')}
              >
                📊 スコア詳細を見る
              </button>
            </div>
          </>
        )}

        {/* ===== スコア入力 タブ ===== */}
        {activeTab === 'score' && (
          <div className="hole-content">
            {/* コースマップへ戻るボタン */}
            <div className="tab-switch-banner">
              <button
                className="tab-switch-btn to-map"
                onClick={() => setActiveTab('map')}
              >
                🗺️ コースマップを見る
              </button>
            </div>

            {/* 統計セクション */}
            <section className="stats-section">
              <h2>📊 成績統計</h2>
            <div className="stats-table-wrapper">
              <div className="stats-summary-row">
                <div className="stats-summary-item">
                  <span className="stats-summary-label">ベストスコア</span>
                  <span className="stats-summary-value">{stats.bestScore}</span>
                </div>
                <div className="stats-summary-item">
                  <span className="stats-summary-label">平均スコア</span>
                  <span className="stats-summary-value">{stats.avgScore}</span>
                </div>
                <div className="stats-summary-item">
                  <span className="stats-summary-label">平均パット</span>
                  <span className="stats-summary-value">{stats.avgPutts}</span>
                </div>
                <div className="stats-summary-item">
                  <span className="stats-summary-label">ラウンド数</span>
                  <span className="stats-summary-value">{stats.roundCount}</span>
                </div>
              </div>

              <div className="stats-transposed-container">
                {stats.roundCount > 0 && (
                  <>
                    <div className="stats-transposed-section">
                      <h3>スコア別成績</h3>
                      <table className="stats-table-transposed">
                        <thead>
                          <tr>
                            <th>バーディ以下</th>
                            <th>パー</th>
                            <th>ボギー</th>
                            <th>ダブル</th>
                            <th>トリプル</th>
                            <th>＋４以上</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="stats-percentage">{stats.birdieOrBetter.percentage}%</td>
                            <td className="stats-percentage">{stats.par.percentage}%</td>
                            <td className="stats-percentage">{stats.bogey.percentage}%</td>
                            <td className="stats-percentage">{stats.doubleBogey.percentage}%</td>
                            <td className="stats-percentage">{stats.tripleBogey.percentage}%</td>
                            <td className="stats-percentage">{stats.extraBogey.percentage}%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="stats-transposed-section">
                      <h3>成績統計</h3>
                      <table className="stats-table-transposed">
                        <thead>
                          <tr>
                            <th>パーオン率</th>
                            <th>ボギーオン率</th>
                            <th>OB</th>
                            <th>バンカー</th>
                            <th>ペナルティ</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="stats-percentage">{stats.parOnRate}%</td>
                            <td className="stats-percentage">{stats.bogeyOnRate}%</td>
                            <td className="stats-percentage">{stats.totalOB.percentage}%</td>
                            <td className="stats-percentage">{stats.totalBunker.percentage}%</td>
                            <td className="stats-percentage">{stats.totalPenalty.percentage}%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="stats-transposed-section">
                      <h3>FW統計</h3>
                      <table className="stats-table-transposed">
                        <thead>
                          <tr>
                            <th>FWキープ</th>
                            <th>左</th>
                            <th>右</th>
                            <th>ショート</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="stats-percentage">{stats.fairwayKeptRate}%</td>
                            <td className="stats-percentage">{stats.fairwayLeftRate}%</td>
                            <td className="stats-percentage">{stats.fairwayRightRate}%</td>
                            <td className="stats-percentage">{stats.fairwayShortRate}%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* スコア分布円グラフ */}
          {scoreDistributionData.length > 0 && (
            <section className="score-distribution-section">
              <h2>📊 スコア分布</h2>
              <div className="chart-container pie-chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={scoreDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${name} ${value} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      innerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {scoreDistributionData.map((entry, index) => {
                        const colors = ['#4ecdc4', '#ff6b6b', '#95e1d3', '#f8b500', '#e67e22', '#e74c3c'];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                      })}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          {/* 手動入力フォーム */}
          <section className="input-form-section">
            <h2>➕ スコアを追加</h2>
            <div className="input-form">
              <div className="form-group">
                <label>プレー日</label>
                <input 
                  type="date" 
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>スコア *</label>
                <input 
                  type="number" 
                  min="1" 
                  max="12"
                  value={formData.score}
                  onChange={(e) => setFormData({...formData, score: e.target.value})}
                  placeholder="スコアを入力"
                />
              </div>

              <div className="form-group">
                <label>パット</label>
                <input 
                  type="number" 
                  min="0" 
                  max="12"
                  value={formData.putts}
                  onChange={(e) => setFormData({...formData, putts: e.target.value})}
                  placeholder="パット数"
                />
              </div>

              <div className="form-group">
                <label>1打目クラブ</label>
                <select 
                  value={formData.first_club}
                  onChange={(e) => setFormData({...formData, first_club: e.target.value})}
                >
                  <option value="">選択してください</option>
                  {clubs.map(club => (
                    <option key={club} value={club}>{club}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>FWキープ</label>
                <select 
                  value={formData.fairway_kept}
                  onChange={(e) => setFormData({...formData, fairway_kept: e.target.value})}
                >
                  <option value="">選択してください</option>
                  {fwKeepOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>OB</label>
                <input 
                  type="number" 
                  min="0" 
                  max="3"
                  value={formData.ob_count}
                  onChange={(e) => setFormData({...formData, ob_count: parseInt(e.target.value) || 0})}
                />
              </div>

              <div className="form-group">
                <label>バンカー</label>
                <input 
                  type="number" 
                  min="0" 
                  max="3"
                  value={formData.bunker_count}
                  onChange={(e) => setFormData({...formData, bunker_count: parseInt(e.target.value) || 0})}
                />
              </div>

              <div className="form-group">
                <label>ペナルティ</label>
                <input 
                  type="number" 
                  min="0" 
                  max="3"
                  value={formData.penalty_count}
                  onChange={(e) => setFormData({...formData, penalty_count: parseInt(e.target.value) || 0})}
                />
              </div>

              <button onClick={handleAddScore} className="btn btn-primary btn-block">
                スコアを保存
              </button>
            </div>
          </section>

          {/* スコア履歴表 - 成績統計の直下 */}
          {holeHistory.length > 0 && (
            <section className="score-history-summary-section">
              <h2>📋 過去のスコア</h2>
              <div className="table-container">
                <table className="summary-table">
                  <thead>
                    <tr>
                      <th>日付</th>
                      <th>スコア</th>
                      <th>パット</th>
                      <th>1打目</th>
                      <th>FW</th>
                      <th>OB</th>
                      <th>Sand</th>
                      <th>ペナ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holeHistory.map((record, idx) => (
                      <tr key={idx}>
                        <td>{new Date(record.date).toLocaleDateString('ja-JP')}</td>
                        <td className="score-cell">{record.score}</td>
                        <td>{record.putts}</td>
                        <td>{record.first_club}</td>
                        <td>{record.fairway_kept}</td>
                        <td>{record.ob_count}</td>
                        <td>{record.bunker_count}</td>
                        <td>{record.penalty_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* グラフセクション */}
          {holeHistory.length > 0 && (
            <section className="graph-section">
              <h2>📈 スコア推移</h2>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis label={{ value: 'スコア', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#f5f5f5', border: '1px solid #ddd' }}
                      formatter={(value) => value}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#ff6b6b" 
                      dot={{ fill: '#ff6b6b', r: 4 }}
                      strokeWidth={2}
                      name="スコア"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="putts" 
                      stroke="#4ecdc4" 
                      dot={{ fill: '#4ecdc4', r: 4 }}
                      strokeWidth={2}
                      name="パット"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          {/* ホールナビゲーション */}
          <div className="navigation-buttons">
            {prevHole && (
              <button className="btn btn-secondary" onClick={() => navigate(`/hole/${prevHole}`)}>
                ← Hole {prevHole}
              </button>
            )}
            <button className="btn btn-tertiary" onClick={() => navigate('/courses')}>
              コース一覧
            </button>
            {nextHole && (
              <button className="btn btn-secondary" onClick={() => navigate(`/hole/${nextHole}`)}>
                Hole {nextHole} →
              </button>
            )}
          </div>
          </div>
        )}

        {/* ===== ショット分析 タブ ===== */}
        {activeTab === 'analysis' && (
          <>
            <div className="tab-switch-banner">
              <button
                className="tab-switch-btn to-map"
                onClick={() => setActiveTab('map')}
              >
                🗺️ コースマップを見る
              </button>
            </div>
            <div className="shot-analysis-wrapper">
              <h2 className="shot-analysis-page-title">📊 Hole {hole.hole_number} ショット分析</h2>
              <ShotAnalysis
                shotLogByDate={shotLogByDate}
                holePar={hole.par}
                holeNumber={hole.hole_number}
              />
            </div>
          </>
        )}

      </div>

      {/* ===== 下部タブバー ===== */}
      <div className="hole-tab-bar">
        <button
          className={`hole-tab-btn ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveTab('map')}
        >
          <span className="hole-tab-icon">🗺️</span>
          <span className="hole-tab-label">コースマップ</span>
        </button>
        <button
          className={`hole-tab-btn ${activeTab === 'score' ? 'active' : ''}`}
          onClick={() => setActiveTab('score')}
        >
          <span className="hole-tab-icon">📝</span>
          <span className="hole-tab-label">スコア入力</span>
        </button>
        <button
          className={`hole-tab-btn ${activeTab === 'analysis' ? 'active' : ''}`}
          onClick={() => setActiveTab('analysis')}
        >
          <span className="hole-tab-icon">📊</span>
          <span className="hole-tab-label">ショット分析</span>
        </button>
      </div>

      {/* グリーン攻略図ポップアップ */}
      <GreenDetailPopup
        holeNumber={hole.hole_number}
        par={hole.par}
        yardage={hole.yardage}
        isOpen={isGreenPopupOpen}
        onClose={handleGreenClose}
      />
    </div>
  );
};

export default HoleDetail;
