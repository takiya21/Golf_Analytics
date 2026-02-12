import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { calcDistanceMeters, metersToYards } from '../data/courseCoordinates';

/**
 * ショット分析コンポーネント
 * ショットログデータからクラブ別、地点状況別、傾斜別、ショット結果の分析を表示
 */

const CHART_COLORS = ['#667eea', '#4ecdc4', '#ff6b6b', '#f39c12', '#9b59b6', '#e67e22', '#00C851', '#03a9f4'];

// ラベル定義
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

const ShotAnalysis = ({ shotLogByDate, holePar, holeNumber }) => {
  // 全日付の全ショットデータをフラット化（飛距離付き）
  const allShots = useMemo(() => {
    const result = [];
    Object.entries(shotLogByDate).forEach(([date, shots]) => {
      shots.forEach((shot, idx) => {
        let distance = null;
        if (idx < shots.length - 1) {
          const next = shots[idx + 1];
          const distM = calcDistanceMeters(shot.pos.lat, shot.pos.lng, next.pos.lat, next.pos.lng);
          distance = metersToYards(distM);
        }
        result.push({ ...shot, _date: date, distance });
      });
    });
    return result;
  }, [shotLogByDate]);

  // 日付ごとのショット数（＝スコア）
  const scoreByDate = useMemo(() => {
    return Object.entries(shotLogByDate)
      .map(([date, shots]) => ({
        date,
        shotCount: shots.length,
        puttCount: shots.filter(s => s.shotType === 'putt' || s.club === 'PT').length,
        obCount: shots.filter(s => s.shotType === 'ob' || s.positionType === 'ob_penalty').length,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [shotLogByDate]);

  // ── クラブ別分析 ──
  const clubAnalysis = useMemo(() => {
    const clubMap = {};
    allShots.forEach((shot) => {
      if (!shot.club) return;
      if (!clubMap[shot.club]) {
        clubMap[shot.club] = {
          count: 0, distances: [], results: {},
        };
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
          ? Math.round(data.distances.reduce((a, b) => a + b, 0) / data.distances.length)
          : 0;
        const max = data.distances.length > 0 ? Math.max(...data.distances) : 0;
        const min = data.distances.length > 0 ? Math.min(...data.distances) : 0;
        const stdDev = data.distances.length >= 2
          ? Math.round(Math.sqrt(data.distances.reduce((sum, d) => sum + (d - avg) ** 2, 0) / data.distances.length))
          : 0;
        const goodRate = data.count > 0
          ? Math.round(((data.results.good || 0) + (data.results.cup_in || 0)) / data.count * 100)
          : 0;
        const missRate = data.count > 0
          ? Math.round(((data.results.fat || 0) + (data.results.thin || 0) + (data.results.shank || 0)) / data.count * 100)
          : 0;
        return { club, count: data.count, avg, max, min, stdDev, goodRate, missRate, results: data.results };
      })
      .sort((a, b) => b.avg - a.avg);
  }, [allShots]);

  // ── 地点状況別分析 ──
  const positionAnalysis = useMemo(() => {
    const posMap = {};
    allShots.forEach((shot) => {
      const pos = shot.positionType || 'unknown';
      if (!posMap[pos]) {
        posMap[pos] = { count: 0, results: {} };
      }
      posMap[pos].count++;
      if (shot.shotResult) {
        posMap[pos].results[shot.shotResult] = (posMap[pos].results[shot.shotResult] || 0) + 1;
      }
    });
    return Object.entries(posMap)
      .filter(([key]) => key !== 'unknown')
      .map(([pos, data]) => {
        const info = POSITION_LABELS[pos] || { label: pos, icon: '📍' };
        const goodCount = (data.results.good || 0) + (data.results.cup_in || 0);
        const goodRate = data.count > 0 ? Math.round(goodCount / data.count * 100) : 0;
        return { position: pos, ...info, count: data.count, goodRate, results: data.results };
      })
      .sort((a, b) => b.count - a.count);
  }, [allShots]);

  // ── 傾斜別分析 ──
  const slopeAnalysis = useMemo(() => {
    const slopeMap = {};
    allShots.forEach((shot) => {
      if (!shot.slopes || shot.slopes.length === 0) return;
      shot.slopes.forEach((slope) => {
        if (!slopeMap[slope]) {
          slopeMap[slope] = { count: 0, results: {} };
        }
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
        const resultBreakdown = Object.entries(data.results)
          .map(([r, cnt]) => {
            const ri = RESULT_LABELS[r] || { label: r, icon: '❓', color: '#999' };
            return { result: r, label: ri.label, icon: ri.icon, color: ri.color, count: cnt, rate: data.count > 0 ? Math.round(cnt / data.count * 100) : 0 };
          })
          .sort((a, b) => b.count - a.count);
        return { slope, ...info, count: data.count, goodRate, missRate, results: data.results, resultBreakdown };
      })
      .sort((a, b) => b.count - a.count);
  }, [allShots]);

  // ── ショット結果分析 ──
  const resultAnalysis = useMemo(() => {
    const resultMap = {};
    allShots.forEach((shot) => {
      if (!shot.shotResult) return;
      resultMap[shot.shotResult] = (resultMap[shot.shotResult] || 0) + 1;
    });
    const total = Object.values(resultMap).reduce((a, b) => a + b, 0);
    return Object.entries(resultMap)
      .map(([result, count]) => {
        const info = RESULT_LABELS[result] || { label: result, icon: '❓', color: '#999' };
        return {
          result,
          name: `${info.icon} ${info.label}`,
          count,
          percentage: total > 0 ? Math.round(count / total * 100) : 0,
          color: info.color,
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [allShots]);

  // ── スコアサマリー ──
  const scoreSummary = useMemo(() => {
    if (scoreByDate.length === 0) return null;
    const scores = scoreByDate.map(s => s.shotCount);
    const putts = scoreByDate.map(s => s.puttCount);
    return {
      rounds: scoreByDate.length,
      bestScore: Math.min(...scores),
      avgScore: (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1),
      avgPutts: (putts.reduce((a, b) => a + b, 0) / putts.length).toFixed(1),
      totalShots: allShots.length,
    };
  }, [scoreByDate, allShots]);

  // データなし
  if (allShots.length === 0) {
    return (
      <div className="shot-analysis">
        <div className="shot-analysis-empty">
          <p>📊 ショットログデータがありません</p>
          <p className="shot-analysis-empty-hint">
            コースマップタブでショットを記録すると、ここで分析結果を確認できます
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="shot-analysis">
      {/* ── スコアサマリー ── */}
      {scoreSummary && (
        <section className="shot-analysis-section">
          <h3 className="shot-analysis-title">🏆 スコアサマリー</h3>
          <div className="shot-analysis-summary-grid">
            <div className="shot-analysis-summary-card">
              <span className="summary-card-value">{scoreSummary.rounds}</span>
              <span className="summary-card-label">ラウンド数</span>
            </div>
            <div className="shot-analysis-summary-card highlight">
              <span className="summary-card-value">{scoreSummary.bestScore}</span>
              <span className="summary-card-label">ベスト</span>
            </div>
            <div className="shot-analysis-summary-card">
              <span className="summary-card-value">{scoreSummary.avgScore}</span>
              <span className="summary-card-label">平均スコア</span>
            </div>
            <div className="shot-analysis-summary-card">
              <span className="summary-card-value">{scoreSummary.avgPutts}</span>
              <span className="summary-card-label">平均パット</span>
            </div>
          </div>

          {/* スコア推移（複数ラウンド時） */}
          {scoreByDate.length > 1 && (
            <div className="shot-analysis-chart-container">
              <h4>📈 スコア推移</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={scoreByDate.map(s => ({
                  date: s.date.slice(5), // MM-DD
                  スコア: s.shotCount,
                  パット: s.puttCount,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8 }}
                    labelStyle={{ color: 'rgba(255,255,255,0.8)' }}
                  />
                  <Bar dataKey="スコア" fill="#667eea" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="パット" fill="#4ecdc4" radius={[4, 4, 0, 0]} />
                  <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      )}

      {/* ── クラブ別分析 ── */}
      {clubAnalysis.length > 0 && (
        <section className="shot-analysis-section">
          <h3 className="shot-analysis-title">🏌️ クラブ別分析</h3>
          <div className="shot-analysis-table">
            <div className="shot-analysis-table-header shot-analysis-table-7col">
              <span>クラブ</span>
              <span>使用数</span>
              <span>平均距離</span>
              <span>SD</span>
              <span>最大</span>
              <span>Good率</span>
              <span>ミス率</span>
            </div>
            {clubAnalysis.map((item) => (
              <div key={item.club} className="shot-analysis-table-row shot-analysis-table-7col">
                <span className="shot-analysis-club-name">{item.club}</span>
                <span>{item.count}回</span>
                <span className="shot-analysis-highlight">{item.avg > 0 ? `${item.avg}yd` : '-'}</span>
                <span className="shot-analysis-sd">{item.stdDev > 0 ? `±${item.stdDev}` : '-'}</span>
                <span>{item.max > 0 ? `${item.max}yd` : '-'}</span>
                <span className="shot-analysis-good">{item.goodRate}%</span>
                <span className="shot-analysis-miss">{item.missRate}%</span>
              </div>
            ))}
          </div>

          {/* クラブ別飛距離チャート */}
          {clubAnalysis.filter(c => c.avg > 0).length > 0 && (
            <div className="shot-analysis-chart-container">
              <h4>📊 クラブ別平均飛距離</h4>
              <ResponsiveContainer width="100%" height={Math.max(200, clubAnalysis.filter(c => c.avg > 0).length * 36)}>
                <BarChart
                  data={clubAnalysis.filter(c => c.avg > 0)}
                  layout="vertical"
                  margin={{ left: 10, right: 20, top: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} unit="yd" />
                  <YAxis type="category" dataKey="club" tick={{ fill: 'rgba(255,255,255,0.9)', fontSize: 12 }} width={40} />
                  <Tooltip
                    contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8 }}
                    formatter={(value) => [`${value} yd`, '平均飛距離']}
                  />
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
        <section className="shot-analysis-section">
          <h3 className="shot-analysis-title">📍 地点状況別分析</h3>
          <div className="shot-analysis-cards">
            {positionAnalysis.map((item, i) => (
              <div key={item.position} className="shot-analysis-card">
                <div className="shot-analysis-card-header">
                  <span className="shot-analysis-card-icon">{item.icon}</span>
                  <span className="shot-analysis-card-title">{item.label}</span>
                  <span className="shot-analysis-card-count">{item.count}回</span>
                </div>
                <div className="shot-analysis-card-bar">
                  <div
                    className="shot-analysis-card-bar-fill"
                    style={{
                      width: `${item.goodRate}%`,
                      background: `linear-gradient(90deg, #4ecdc4, #667eea)`,
                    }}
                  />
                </div>
                <div className="shot-analysis-card-footer">
                  <span>👍 Good: {item.goodRate}%</span>
                  {Object.entries(item.results).filter(([k]) => k !== 'good' && k !== 'cup_in').length > 0 && (
                    <span className="shot-analysis-card-results">
                      {Object.entries(item.results)
                        .filter(([k]) => k !== 'good' && k !== 'cup_in')
                        .map(([k, v]) => {
                          const info = RESULT_LABELS[k];
                          return info ? `${info.icon}${v}` : '';
                        })
                        .join(' ')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 地点状況分布 PieChart */}
          <div className="shot-analysis-chart-container">
            <h4>地点状況の割合</h4>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={positionAnalysis.map(p => ({ name: `${p.icon} ${p.label}`, value: p.count }))}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {positionAnalysis.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* ── 傾斜別分析 ── */}
      {slopeAnalysis.length > 0 && (
        <section className="shot-analysis-section">
          <h3 className="shot-analysis-title">⛰️ 傾斜別分析</h3>
          <div className="shot-analysis-table">
            <div className="shot-analysis-table-header">
              <span>傾斜</span>
              <span>回数</span>
              <span>Good率</span>
              <span>ミス率</span>
            </div>
            {slopeAnalysis.map((item) => (
              <div key={item.slope} className="shot-analysis-table-row">
                <span className="shot-analysis-slope-name">{item.icon} {item.label}</span>
                <span>{item.count}回</span>
                <span className="shot-analysis-good">{item.goodRate}%</span>
                <span className="shot-analysis-miss">{item.missRate}%</span>
              </div>
            ))}
          </div>

          {/* 傾斜別ショット結果内訳 */}
          <div className="shot-analysis-slope-detail-list">
            {slopeAnalysis.map((item) => (
              <div key={item.slope} className="shot-analysis-slope-detail-card">
                <div className="shot-analysis-slope-detail-head">
                  <span className="shot-analysis-slope-detail-title">{item.icon} {item.label}</span>
                  <span className="shot-analysis-slope-detail-count">{item.count}回</span>
                </div>
                <div className="shot-analysis-slope-stacked-bar">
                  {item.resultBreakdown.map((rb) => (
                    rb.rate > 0 && (
                      <div
                        key={rb.result}
                        className="shot-analysis-slope-stacked-segment"
                        style={{ width: `${rb.rate}%`, backgroundColor: rb.color }}
                        title={`${rb.icon} ${rb.label}: ${rb.rate}%`}
                      />
                    )
                  ))}
                </div>
                <div className="shot-analysis-slope-detail-results">
                  {item.resultBreakdown.map((rb) => (
                    <span key={rb.result} className="shot-analysis-slope-result-tag" style={{ borderColor: rb.color }}>
                      {rb.icon} {rb.label} <strong>{rb.rate}%</strong> ({rb.count})
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 傾斜別ショット結果率 積み上げ棒グラフ */}
          <div className="shot-analysis-chart-container">
            <h4>傾斜別ショット結果率</h4>
            <ResponsiveContainer width="100%" height={Math.max(180, slopeAnalysis.length * 44)}>
              <BarChart
                data={slopeAnalysis.map(s => {
                  const row = { name: `${s.icon}${s.label}` };
                  s.resultBreakdown.forEach(rb => { row[rb.label] = rb.rate; });
                  return row;
                })}
                layout="vertical"
                margin={{ left: 10, right: 20, top: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} unit="%" domain={[0, 100]} />
                <YAxis type="category" dataKey="name" tick={{ fill: 'rgba(255,255,255,0.9)', fontSize: 11 }} width={75} />
                <Tooltip
                  contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8 }}
                  formatter={(v) => [`${v}%`]}
                />
                {(() => {
                  const keySet = new Set();
                  slopeAnalysis.forEach(s => s.resultBreakdown.forEach(rb => keySet.add(rb.label)));
                  const order = Object.values(RESULT_LABELS).map(r => r.label);
                  return order.filter(l => keySet.has(l)).map(key => {
                    const entry = Object.values(RESULT_LABELS).find(r => r.label === key);
                    return <Bar key={key} dataKey={key} stackId="a" fill={entry ? entry.color : '#999'} />;
                  });
                })()}
                <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* ── ショット結果分析 ── */}
      {resultAnalysis.length > 0 && (
        <section className="shot-analysis-section">
          <h3 className="shot-analysis-title">🎯 ショット結果分析</h3>
          <div className="shot-analysis-result-grid">
            {resultAnalysis.map((item) => (
              <div key={item.result} className="shot-analysis-result-card" style={{ borderColor: item.color }}>
                <span className="result-card-name">{item.name}</span>
                <span className="result-card-count">{item.count}回</span>
                <div className="result-card-bar">
                  <div
                    className="result-card-bar-fill"
                    style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                  />
                </div>
                <span className="result-card-pct">{item.percentage}%</span>
              </div>
            ))}
          </div>

          {/* 結果分布 PieChart */}
          <div className="shot-analysis-chart-container">
            <h4>結果の分布</h4>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={resultAnalysis}
                  dataKey="count"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {resultAnalysis.map((item, i) => (
                    <Cell key={i} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}
    </div>
  );
};

export default ShotAnalysis;
