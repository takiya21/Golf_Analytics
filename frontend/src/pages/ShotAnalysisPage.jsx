import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { calcDistanceMeters, metersToYards } from '../data/courseCoordinates';
import '../styles/shotAnalysisPage.css';

const CHART_COLORS = ['#667eea', '#4ecdc4', '#ff6b6b', '#f39c12', '#9b59b6', '#e67e22', '#00C851', '#03a9f4'];

const POSITION_LABELS = {
  tee: { label: 'ティー', icon: '🔴' },
  fairway: { label: 'フェアウェイ', icon: '🟢' },
  rough: { label: 'ラフ', icon: '🌿' },
  bunker: { label: 'バンカー', icon: '⛱️' },
  green: { label: 'グリーン', icon: '🏁' },
  ob_penalty: { label: 'OB/ペナ', icon: '🚫' },
  bare_ground: { label: 'ベアグラウンド', icon: '🟤' },
};

const SLOPE_LABELS = {
  flat: { label: '平坦', icon: '➖' },
  uphill: { label: '左足上がり', icon: '⬆️' },
  downhill: { label: '左足下がり', icon: '⬇️' },
  toe_up: { label: 'つま先上がり', icon: '↗️' },
  toe_down: { label: 'つま先下がり', icon: '↘️' },
};

const RESULT_LABELS = {
  good: { label: 'ナイスショット', icon: '👍', color: '#4ecdc4' },
  cup_in: { label: 'カップイン', icon: '🕳️', color: '#ffd700' },
  fat: { label: 'ダフり', icon: '💥', color: '#e74c3c' },
  thin: { label: 'トップ', icon: '⚡', color: '#f39c12' },
  slice: { label: 'スライス', icon: '➡️', color: '#e67e22' },
  hook: { label: 'フック', icon: '⬅️', color: '#9b59b6' },
  shank: { label: 'シャンク', icon: '💀', color: '#c0392b' },
};

const PAR_ARRAY = [4, 4, 3, 4, 5, 4, 3, 4, 5, 4, 3, 5, 4, 4, 4, 3, 5, 4];
const DAY_NAMES = ['日', '月', '火', '水', '木', '金', '土'];

const formatDateLabel = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getMonth() + 1}/${d.getDate()}(${DAY_NAMES[d.getDay()]})`;
};

/**
 * ショット分析ページ（トップレベル）
 * 全18ホールのショットログを集約し、全ラウンド/各ラウンドで分析
 */
const ShotAnalysisPage = () => {
  const navigate = useNavigate();

  // 全18ホールのショットログを読み込み
  const allHoleShotLogs = useMemo(() => {
    const result = {};
    for (let h = 1; h <= 18; h++) {
      const key = `golfys_shotlog_${h}`;
      try {
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            // 旧フォーマット → 日付不明として today に割り当て
            if (parsed.length > 0) {
              result[h] = { unknown: parsed };
            }
          } else if (typeof parsed === 'object' && parsed !== null) {
            result[h] = parsed;
          }
        }
      } catch {
        // ignore
      }
    }
    return result;
  }, []);

  // 全日付一覧（降順）
  const allDates = useMemo(() => {
    const dateSet = new Set();
    Object.values(allHoleShotLogs).forEach((holeDateMap) => {
      Object.keys(holeDateMap).forEach((d) => {
        if (holeDateMap[d] && holeDateMap[d].length > 0) {
          dateSet.add(d);
        }
      });
    });
    return [...dateSet].sort((a, b) => b.localeCompare(a));
  }, [allHoleShotLogs]);

  // 選択中のラウンド日付 (null = 全ラウンド)
  const [selectedRound, setSelectedRound] = useState(null);

  // 各日付ごとのホール数とショット数
  const roundSummaries = useMemo(() => {
    return allDates.map((date) => {
      let totalShots = 0;
      let holeCount = 0;
      for (let h = 1; h <= 18; h++) {
        const holeData = allHoleShotLogs[h];
        if (holeData && holeData[date] && holeData[date].length > 0) {
          holeCount++;
          totalShots += holeData[date].length;
        }
      }
      return { date, holeCount, totalShots };
    });
  }, [allDates, allHoleShotLogs]);

  // フィルタ後の全ショット（飛距離 + ホール番号付き）
  const filteredShots = useMemo(() => {
    const result = [];
    for (let h = 1; h <= 18; h++) {
      const holeData = allHoleShotLogs[h];
      if (!holeData) continue;
      const dates = selectedRound ? [selectedRound] : Object.keys(holeData);
      dates.forEach((date) => {
        const shots = holeData[date];
        if (!shots || shots.length === 0) return;
        shots.forEach((shot, idx) => {
          let distance = null;
          if (idx < shots.length - 1) {
            const next = shots[idx + 1];
            if (shot.pos && next.pos) {
              const distM = calcDistanceMeters(shot.pos.lat, shot.pos.lng, next.pos.lat, next.pos.lng);
              distance = metersToYards(distM);
            }
          }
          result.push({ ...shot, _date: date, _hole: h, distance });
        });
      });
    }
    return result;
  }, [allHoleShotLogs, selectedRound]);

  // ── ホール別スコア（選択ラウンド） ──
  const holeScores = useMemo(() => {
    const dates = selectedRound ? [selectedRound] : allDates;
    const holesMap = {};
    for (let h = 1; h <= 18; h++) {
      const holeData = allHoleShotLogs[h];
      if (!holeData) continue;
      dates.forEach((date) => {
        const shots = holeData[date];
        if (!shots || shots.length === 0) return;
        if (!holesMap[h]) holesMap[h] = [];
        holesMap[h].push({
          date,
          shotCount: shots.length,
          puttCount: shots.filter(s => s.shotType === 'putt' || s.club === 'PT').length,
        });
      });
    }
    return holesMap;
  }, [allHoleShotLogs, selectedRound, allDates]);

  // ── クラブ別分析 ──
  const clubAnalysis = useMemo(() => {
    const clubMap = {};
    filteredShots.forEach((shot) => {
      if (!shot.club) return;
      if (!clubMap[shot.club]) {
        clubMap[shot.club] = { count: 0, distances: [], results: {} };
      }
      clubMap[shot.club].count++;
      if (shot.distance !== null && shot.shotType !== 'ob' && shot.shotType !== 'penalty') {
        clubMap[shot.club].distances.push(shot.distance);
      }
      if (shot.shotResult) {
        clubMap[shot.club].results[shot.shotResult] = (clubMap[shot.club].results[shot.shotResult] || 0) + 1;
      }
    });
    return Object.entries(clubMap)
      .map(([club, data]) => {
        const avg = data.distances.length > 0
          ? Math.round(data.distances.reduce((a, b) => a + b, 0) / data.distances.length) : 0;
        const max = data.distances.length > 0 ? Math.max(...data.distances) : 0;
        const min = data.distances.length > 0 ? Math.min(...data.distances) : 0;
        const stdDev = data.distances.length >= 2
          ? Math.round(Math.sqrt(data.distances.reduce((sum, d) => sum + (d - avg) ** 2, 0) / data.distances.length))
          : 0;
        const goodRate = data.count > 0
          ? Math.round(((data.results.good || 0) + (data.results.cup_in || 0)) / data.count * 100) : 0;
        const missRate = data.count > 0
          ? Math.round(((data.results.fat || 0) + (data.results.thin || 0) + (data.results.shank || 0)) / data.count * 100) : 0;
        return { club, count: data.count, avg, max, min, stdDev, goodRate, missRate };
      })
      .sort((a, b) => b.avg - a.avg);
  }, [filteredShots]);

  // ── 地点状況別分析 ──
  const positionAnalysis = useMemo(() => {
    const posMap = {};
    filteredShots.forEach((shot) => {
      const pos = shot.positionType || 'unknown';
      if (pos === 'unknown') return;
      if (!posMap[pos]) posMap[pos] = { count: 0, results: {} };
      posMap[pos].count++;
      if (shot.shotResult) {
        posMap[pos].results[shot.shotResult] = (posMap[pos].results[shot.shotResult] || 0) + 1;
      }
    });
    return Object.entries(posMap)
      .map(([pos, data]) => {
        const info = POSITION_LABELS[pos] || { label: pos, icon: '📍' };
        const goodCount = (data.results.good || 0) + (data.results.cup_in || 0);
        const goodRate = data.count > 0 ? Math.round(goodCount / data.count * 100) : 0;
        return { position: pos, ...info, count: data.count, goodRate, results: data.results };
      })
      .sort((a, b) => b.count - a.count);
  }, [filteredShots]);

  // ── 傾斜別分析 ──
  const slopeAnalysis = useMemo(() => {
    const slopeMap = {};
    filteredShots.forEach((shot) => {
      if (!shot.slopes || shot.slopes.length === 0) return;
      shot.slopes.forEach((slope) => {
        if (!slopeMap[slope]) slopeMap[slope] = { count: 0, results: {} };
        slopeMap[slope].count++;
        if (shot.shotResult) {
          slopeMap[slope].results[shot.shotResult] = (slopeMap[slope].results[shot.shotResult] || 0) + 1;
        }
      });
    });
    return Object.entries(slopeMap)
      .map(([slope, data]) => {
        const info = SLOPE_LABELS[slope] || { label: slope, icon: '' };
        const goodCount = (data.results.good || 0) + (data.results.cup_in || 0);
        const goodRate = data.count > 0 ? Math.round(goodCount / data.count * 100) : 0;
        const missCount = (data.results.fat || 0) + (data.results.thin || 0) + (data.results.shank || 0);
        const missRate = data.count > 0 ? Math.round(missCount / data.count * 100) : 0;
        // 各結果の内訳
        const resultBreakdown = Object.entries(data.results)
          .map(([r, cnt]) => {
            const ri = RESULT_LABELS[r] || { label: r, icon: '❓', color: '#999' };
            return { result: r, label: ri.label, icon: ri.icon, color: ri.color, count: cnt, rate: data.count > 0 ? Math.round(cnt / data.count * 100) : 0 };
          })
          .sort((a, b) => b.count - a.count);
        return { slope, ...info, count: data.count, goodRate, missRate, results: data.results, resultBreakdown };
      })
      .sort((a, b) => b.count - a.count);
  }, [filteredShots]);

  // 傾斜別 積み上げチャート用データ
  const slopeStackedData = useMemo(() => {
    return slopeAnalysis.map((s) => {
      const row = { name: `${s.icon}${s.label}` };
      s.resultBreakdown.forEach((rb) => { row[rb.label] = rb.rate; });
      return row;
    });
  }, [slopeAnalysis]);

  // 傾斜チャートで使う結果ラベル一覧
  const slopeResultKeys = useMemo(() => {
    const keySet = new Set();
    slopeAnalysis.forEach((s) => s.resultBreakdown.forEach((rb) => keySet.add(rb.label)));
    // RESULT_LABELS 順で並べる
    const order = Object.values(RESULT_LABELS).map(r => r.label);
    return order.filter(l => keySet.has(l));
  }, [slopeAnalysis]);

  // ── ショット結果分析 ──
  const resultAnalysis = useMemo(() => {
    const resultMap = {};
    filteredShots.forEach((shot) => {
      if (!shot.shotResult) return;
      resultMap[shot.shotResult] = (resultMap[shot.shotResult] || 0) + 1;
    });
    const total = Object.values(resultMap).reduce((a, b) => a + b, 0);
    return Object.entries(resultMap)
      .map(([result, count]) => {
        const info = RESULT_LABELS[result] || { label: result, icon: '❓', color: '#999' };
        return {
          result, name: `${info.icon} ${info.label}`, count,
          percentage: total > 0 ? Math.round(count / total * 100) : 0,
          color: info.color,
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [filteredShots]);

  // ── 全体サマリー ──
  const overallSummary = useMemo(() => {
    if (filteredShots.length === 0) return null;
    const dateSet = new Set(filteredShots.map(s => s._date));
    const holeSet = new Set(filteredShots.map(s => s._hole));
    const puttCount = filteredShots.filter(s => s.shotType === 'putt' || s.club === 'PT').length;
    const obCount = filteredShots.filter(s => s.shotType === 'ob' || s.positionType === 'ob_penalty').length;
    return {
      totalShots: filteredShots.length,
      roundCount: dateSet.size,
      holeCount: holeSet.size,
      puttCount,
      obCount,
    };
  }, [filteredShots]);

  // ── ホール別スコアカード ──
  const holeScoreCards = useMemo(() => {
    const cards = [];
    for (let h = 1; h <= 18; h++) {
      const scores = holeScores[h] || [];
      if (scores.length === 0) continue;
      const avgScore = Math.round(scores.reduce((s, r) => s + r.shotCount, 0) / scores.length * 10) / 10;
      const avgPutts = Math.round(scores.reduce((s, r) => s + r.puttCount, 0) / scores.length * 10) / 10;
      const best = Math.min(...scores.map(s => s.shotCount));
      const par = PAR_ARRAY[h - 1];
      const diff = +(avgScore - par).toFixed(1);
      const scoreSD = scores.length >= 2
        ? +(Math.sqrt(scores.reduce((sum, r) => sum + (r.shotCount - avgScore) ** 2, 0) / scores.length)).toFixed(1)
        : 0;
      const puttSD = scores.length >= 2
        ? +(Math.sqrt(scores.reduce((sum, r) => sum + (r.puttCount - avgPutts) ** 2, 0) / scores.length)).toFixed(1)
        : 0;
      cards.push({ hole: h, par, avgScore, avgPutts, best, diff, scoreSD, puttSD, rounds: scores.length });
    }
    return cards;
  }, [holeScores]);

  // ── ホール別レーダーチャートデータ ──
  const radarData = useMemo(() => {
    return holeScoreCards.map((c) => ({
      hole: `H${c.hole}`,
      スコア差: c.diff,
    }));
  }, [holeScoreCards]);

  // データなし
  if (allDates.length === 0) {
    return (
      <div className="sap-page">
        <div className="sap-header">
          <h1 className="sap-title">📊 ショット分析</h1>
        </div>
        <div className="sap-empty">
          <div className="sap-empty-icon">🏌️</div>
          <p>ショットログデータがありません</p>
          <p className="sap-empty-hint">
            ホール詳細画面のコースマップタブでショットを記録すると、<br />
            ここで全ラウンドの分析結果を確認できます
          </p>
          <button className="sap-btn-primary" onClick={() => navigate('/courses')}>
            コース分析へ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sap-page">
      {/* ── ヘッダー ── */}
      <div className="sap-header">
        <h1 className="sap-title">📊 ショット分析</h1>
        <p className="sap-subtitle">
          全{allDates.length}ラウンド / {filteredShots.length}ショット
        </p>
      </div>

      {/* ── ラウンド選択 ── */}
      <div className="sap-round-selector">
        <button
          className={`sap-round-tab ${selectedRound === null ? 'active' : ''}`}
          onClick={() => setSelectedRound(null)}
        >
          📋 全ラウンド
        </button>
        {roundSummaries.map((rs) => (
          <button
            key={rs.date}
            className={`sap-round-tab ${selectedRound === rs.date ? 'active' : ''}`}
            onClick={() => setSelectedRound(rs.date)}
          >
            <span className="sap-round-date">{formatDateLabel(rs.date)}</span>
            <span className="sap-round-meta">{rs.holeCount}H / {rs.totalShots}打</span>
          </button>
        ))}
      </div>

      {/* ── 全体サマリー ── */}
      {overallSummary && (
        <section className="sap-section">
          <h2 className="sap-section-title">🏆 サマリー</h2>
          <div className="sap-summary-grid">
            <div className="sap-summary-card">
              <span className="sap-summary-value">{overallSummary.totalShots}</span>
              <span className="sap-summary-label">総ショット数</span>
            </div>
            <div className="sap-summary-card">
              <span className="sap-summary-value">{overallSummary.roundCount}</span>
              <span className="sap-summary-label">ラウンド数</span>
            </div>
            <div className="sap-summary-card">
              <span className="sap-summary-value">{overallSummary.holeCount}</span>
              <span className="sap-summary-label">記録ホール</span>
            </div>
            <div className="sap-summary-card">
              <span className="sap-summary-value">{overallSummary.puttCount}</span>
              <span className="sap-summary-label">パット数</span>
            </div>
            <div className="sap-summary-card warn">
              <span className="sap-summary-value">{overallSummary.obCount}</span>
              <span className="sap-summary-label">OB/ペナ</span>
            </div>
          </div>
        </section>
      )}

      {/* ── ホール別スコアカード ── */}
      {holeScoreCards.length > 0 && (
        <section className="sap-section">
          <h2 className="sap-section-title">⛳ ホール別スコア</h2>
          <div className="sap-hole-table">
            <div className="sap-hole-table-header">
              <span>Hole</span>
              <span>Par</span>
              <span>平均</span>
              <span>SD</span>
              <span>Best</span>
              <span>差</span>
              <span>パット</span>
              <span>SD</span>
            </div>
            {holeScoreCards.map((c) => (
              <div
                key={c.hole}
                className={`sap-hole-table-row ${c.diff <= 0 ? 'good' : c.diff >= 2 ? 'bad' : ''}`}
                onClick={() => navigate(`/hole/${c.hole}`)}
              >
                <span className="sap-hole-num">H{c.hole}</span>
                <span>{c.par}</span>
                <span className="sap-hole-avg">{c.avgScore}</span>
                <span className="sap-hole-sd">{c.scoreSD > 0 ? `±${c.scoreSD}` : '-'}</span>
                <span className="sap-hole-best">{c.best}</span>
                <span className={`sap-hole-diff ${c.diff <= 0 ? 'under' : 'over'}`}>
                  {c.diff > 0 ? '+' : ''}{c.diff}
                </span>
                <span>{c.avgPutts}</span>
                <span className="sap-hole-sd">{c.puttSD > 0 ? `±${c.puttSD}` : '-'}</span>
              </div>
            ))}
          </div>

          {/* レーダーチャート */}
          {radarData.length >= 3 && (
            <div className="sap-chart-container">
              <h3>ホール別 Par差</h3>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.15)" />
                  <PolarAngleAxis dataKey="hole" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10 }} />
                  <PolarRadiusAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
                  <Radar name="スコア差" dataKey="スコア差" stroke="#667eea" fill="#667eea" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      )}

      {/* ── クラブ別分析 ── */}
      {clubAnalysis.length > 0 && (
        <section className="sap-section">
          <h2 className="sap-section-title">🏌️ クラブ別分析</h2>
          <div className="sap-table">
            <div className="sap-table-header seven-col">
              <span>クラブ</span>
              <span>回数</span>
              <span>平均</span>
              <span>SD</span>
              <span>最大</span>
              <span>Good</span>
              <span>ミス</span>
            </div>
            {clubAnalysis.map((item) => (
              <div key={item.club} className="sap-table-row seven-col">
                <span className="sap-cell-name">{item.club}</span>
                <span>{item.count}</span>
                <span className="sap-cell-highlight">{item.avg > 0 ? `${item.avg}yd` : '-'}</span>
                <span className="sap-cell-sd">{item.stdDev > 0 ? `±${item.stdDev}` : '-'}</span>
                <span>{item.max > 0 ? `${item.max}yd` : '-'}</span>
                <span className="sap-cell-good">{item.goodRate}%</span>
                <span className="sap-cell-miss">{item.missRate}%</span>
              </div>
            ))}
          </div>

          {clubAnalysis.filter(c => c.avg > 0).length > 0 && (
            <div className="sap-chart-container">
              <h3>📊 クラブ別平均飛距離</h3>
              <ResponsiveContainer width="100%" height={Math.max(200, clubAnalysis.filter(c => c.avg > 0).length * 36)}>
                <BarChart data={clubAnalysis.filter(c => c.avg > 0)} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} unit="yd" />
                  <YAxis type="category" dataKey="club" tick={{ fill: 'rgba(255,255,255,0.9)', fontSize: 12 }} width={40} />
                  <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8 }} formatter={(v) => [`${v} yd`, '平均飛距離']} />
                  <Bar dataKey="avg" radius={[0, 4, 4, 0]}>
                    {clubAnalysis.filter(c => c.avg > 0).map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      )}

      {/* ── 地点状況別分析 ── */}
      {positionAnalysis.length > 0 && (
        <section className="sap-section">
          <h2 className="sap-section-title">📍 地点状況別分析</h2>
          <div className="sap-cards-grid">
            {positionAnalysis.map((item) => (
              <div key={item.position} className="sap-stat-card">
                <div className="sap-stat-card-head">
                  <span className="sap-stat-icon">{item.icon}</span>
                  <span className="sap-stat-name">{item.label}</span>
                  <span className="sap-stat-count">{item.count}回</span>
                </div>
                <div className="sap-stat-bar">
                  <div className="sap-stat-bar-fill" style={{ width: `${item.goodRate}%` }} />
                </div>
                <div className="sap-stat-footer">
                  <span>👍 Good: {item.goodRate}%</span>
                  {Object.entries(item.results).filter(([k]) => k !== 'good' && k !== 'cup_in').length > 0 && (
                    <span className="sap-stat-detail">
                      {Object.entries(item.results).filter(([k]) => k !== 'good' && k !== 'cup_in')
                        .map(([k, v]) => { const i = RESULT_LABELS[k]; return i ? `${i.icon}${v}` : ''; }).join(' ')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="sap-chart-container">
            <h3>地点状況の割合</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={positionAnalysis.map(p => ({ name: `${p.icon} ${p.label}`, value: p.count }))} dataKey="value" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {positionAnalysis.map((_, i) => (<Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* ── 傾斜別分析 ── */}
      {slopeAnalysis.length > 0 && (
        <section className="sap-section">
          <h2 className="sap-section-title">⛰️ 傾斜別分析</h2>

          {/* サマリーテーブル */}
          <div className="sap-table">
            <div className="sap-table-header four-col">
              <span>傾斜</span>
              <span>回数</span>
              <span>Good率</span>
              <span>ミス率</span>
            </div>
            {slopeAnalysis.map((item) => (
              <div key={item.slope} className="sap-table-row four-col">
                <span className="sap-cell-name">{item.icon} {item.label}</span>
                <span>{item.count}回</span>
                <span className="sap-cell-good">{item.goodRate}%</span>
                <span className="sap-cell-miss">{item.missRate}%</span>
              </div>
            ))}
          </div>

          {/* 傾斜別ショット結果内訳カード */}
          <div className="sap-slope-detail-list">
            {slopeAnalysis.map((item) => (
              <div key={item.slope} className="sap-slope-detail-card">
                <div className="sap-slope-detail-head">
                  <span className="sap-slope-detail-title">{item.icon} {item.label}</span>
                  <span className="sap-slope-detail-count">{item.count}回</span>
                </div>
                {/* 積み上げバー */}
                <div className="sap-slope-stacked-bar">
                  {item.resultBreakdown.map((rb) => (
                    rb.rate > 0 && (
                      <div
                        key={rb.result}
                        className="sap-slope-stacked-segment"
                        style={{ width: `${rb.rate}%`, backgroundColor: rb.color }}
                        title={`${rb.icon} ${rb.label}: ${rb.rate}%`}
                      />
                    )
                  ))}
                </div>
                {/* 結果ラベル一覧 */}
                <div className="sap-slope-detail-results">
                  {item.resultBreakdown.map((rb) => (
                    <span key={rb.result} className="sap-slope-result-tag" style={{ borderColor: rb.color }}>
                      {rb.icon} {rb.label} <strong>{rb.rate}%</strong> ({rb.count})
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 傾斜×結果 積み上げ棒グラフ */}
          {slopeStackedData.length > 0 && slopeResultKeys.length > 0 && (
            <div className="sap-chart-container">
              <h3>傾斜別ショット結果率</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={slopeStackedData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} unit="%" domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" tick={{ fill: 'rgba(255,255,255,0.9)', fontSize: 11 }} width={75} />
                  <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8 }} formatter={(v) => [`${v}%`]} />
                  {slopeResultKeys.map((key) => {
                    const entry = Object.values(RESULT_LABELS).find(r => r.label === key);
                    return <Bar key={key} dataKey={key} stackId="a" fill={entry ? entry.color : '#999'} />;
                  })}
                  <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      )}

      {/* ── ショット結果分析 ── */}
      {resultAnalysis.length > 0 && (
        <section className="sap-section">
          <h2 className="sap-section-title">🎯 ショット結果分析</h2>
          <div className="sap-result-grid">
            {resultAnalysis.map((item) => (
              <div key={item.result} className="sap-result-card" style={{ borderLeftColor: item.color }}>
                <span className="sap-result-name">{item.name}</span>
                <span className="sap-result-count">{item.count}回</span>
                <div className="sap-result-bar">
                  <div className="sap-result-bar-fill" style={{ width: `${item.percentage}%`, backgroundColor: item.color }} />
                </div>
                <span className="sap-result-pct">{item.percentage}%</span>
              </div>
            ))}
          </div>

          <div className="sap-chart-container">
            <h3>結果の分布</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={resultAnalysis} dataKey="count" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {resultAnalysis.map((item, i) => (<Cell key={i} fill={item.color} />))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}
    </div>
  );
};

export default ShotAnalysisPage;
