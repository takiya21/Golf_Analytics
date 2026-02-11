import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import '../styles/scoreAnalysis.css';

const COLORS_PIE = ['#4ecdc4', '#ff6b6b', '#f8b500', '#667eea', '#e67e22', '#e74c3c'];

const ScoreAnalysis = () => {
  const navigate = useNavigate();

  const parArray = [4, 4, 3, 4, 5, 4, 3, 4, 5, 4, 3, 5, 4, 4, 4, 3, 5, 4];
  const yardageArray = [420, 306, 182, 443, 472, 350, 173, 391, 492, 400, 151, 500, 442, 320, 366, 191, 508, 383];

  // localStorage から全ラウンドを取得
  const rounds = useMemo(() => {
    const stored = JSON.parse(localStorage.getItem('golfys_rounds') || '[]');
    return stored.sort((a, b) => new Date(a.play_date) - new Date(b.play_date));
  }, []);

  // ===================== ラウンド全体統計 =====================
  const overallStats = useMemo(() => {
    if (rounds.length === 0) return null;

    const roundSummaries = rounds.map(round => {
      let totalScore = 0, totalPutts = 0, holeCount = 0;
      let fwKept = 0, fwTotal = 0, obCount = 0, bunkerCount = 0, penaltyCount = 0;
      let birdieOrBetter = 0, parCount = 0, bogeyCount = 0, doublePlus = 0;

      for (let h = 1; h <= 18; h++) {
        const hole = round.holes[h];
        if (!hole || !hole.score) continue;
        const par = parArray[h - 1];
        totalScore += hole.score;
        totalPutts += hole.putts || 0;
        holeCount++;
        obCount += hole.ob_count || 0;
        bunkerCount += hole.bunker_count || 0;
        penaltyCount += hole.penalty_count || 0;
        if (hole.fairway_kept) {
          fwTotal++;
          if (hole.fairway_kept === '〇') fwKept++;
        }
        const diff = hole.score - par;
        if (diff <= -1) birdieOrBetter++;
        else if (diff === 0) parCount++;
        else if (diff === 1) bogeyCount++;
        else doublePlus++;
      }

      const outScore = Array.from({ length: 9 }, (_, i) => round.holes[i + 1]?.score || 0).reduce((a, b) => a + b, 0);
      const inScore = Array.from({ length: 9 }, (_, i) => round.holes[i + 10]?.score || 0).reduce((a, b) => a + b, 0);

      return {
        id: round.id,
        date: round.play_date,
        totalScore, totalPutts, holeCount,
        outScore, inScore,
        fwKept, fwTotal, obCount, bunkerCount, penaltyCount,
        birdieOrBetter, parCount, bogeyCount, doublePlus
      };
    });

    const totalRounds = roundSummaries.length;
    const scores = roundSummaries.map(r => r.totalScore);
    const avgScore = (scores.reduce((a, b) => a + b, 0) / totalRounds).toFixed(1);
    const bestScore = Math.min(...scores);
    const worstScore = Math.max(...scores);
    const avgPutts = (roundSummaries.reduce((s, r) => s + r.totalPutts, 0) / totalRounds).toFixed(1);

    const totalFwTotal = roundSummaries.reduce((s, r) => s + r.fwTotal, 0);
    const totalFwKept = roundSummaries.reduce((s, r) => s + r.fwKept, 0);
    const fwRate = totalFwTotal > 0 ? ((totalFwKept / totalFwTotal) * 100).toFixed(1) : '-';

    const totalOB = roundSummaries.reduce((s, r) => s + r.obCount, 0);
    const totalBunker = roundSummaries.reduce((s, r) => s + r.bunkerCount, 0);
    const totalPenalty = roundSummaries.reduce((s, r) => s + r.penaltyCount, 0);

    const totalBirdie = roundSummaries.reduce((s, r) => s + r.birdieOrBetter, 0);
    const totalPar = roundSummaries.reduce((s, r) => s + r.parCount, 0);
    const totalBogey = roundSummaries.reduce((s, r) => s + r.bogeyCount, 0);
    const totalDouble = roundSummaries.reduce((s, r) => s + r.doublePlus, 0);
    const totalHoles = totalBirdie + totalPar + totalBogey + totalDouble;

    return {
      totalRounds, avgScore, bestScore, worstScore, avgPutts, fwRate,
      totalOB, totalBunker, totalPenalty,
      birdieRate: totalHoles > 0 ? ((totalBirdie / totalHoles) * 100).toFixed(1) : 0,
      parRate: totalHoles > 0 ? ((totalPar / totalHoles) * 100).toFixed(1) : 0,
      bogeyRate: totalHoles > 0 ? ((totalBogey / totalHoles) * 100).toFixed(1) : 0,
      doublePlusRate: totalHoles > 0 ? ((totalDouble / totalHoles) * 100).toFixed(1) : 0,
      totalBirdie, totalPar, totalBogey, totalDouble,
      roundSummaries
    };
  }, [rounds]);

  // ===================== スコア推移グラフデータ =====================
  const trendData = useMemo(() => {
    if (!overallStats) return [];
    return overallStats.roundSummaries.map((r, i) => ({
      label: new Date(r.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
      score: r.totalScore,
      putts: r.totalPutts,
      out: r.outScore,
      in: r.inScore,
      index: i + 1
    }));
  }, [overallStats]);

  // ===================== スコア分布（円グラフ） =====================
  const distributionData = useMemo(() => {
    if (!overallStats) return [];
    const d = [];
    if (overallStats.totalBirdie > 0) d.push({ name: 'バーディ以下', value: overallStats.totalBirdie });
    if (overallStats.totalPar > 0) d.push({ name: 'パー', value: overallStats.totalPar });
    if (overallStats.totalBogey > 0) d.push({ name: 'ボギー', value: overallStats.totalBogey });
    if (overallStats.totalDouble > 0) d.push({ name: 'ダブル以上', value: overallStats.totalDouble });
    return d;
  }, [overallStats]);

  // ===================== ホール別平均スコア =====================
  const holeAvgData = useMemo(() => {
    if (rounds.length === 0) return [];
    return Array.from({ length: 18 }, (_, i) => {
      const holeNum = i + 1;
      const scores = rounds
        .map(r => r.holes[holeNum]?.score)
        .filter(s => s != null && s > 0);
      const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      const par = parArray[i];
      return {
        hole: `H${holeNum}`,
        holeNum,
        avg: parseFloat(avg.toFixed(2)),
        par,
        diff: parseFloat((avg - par).toFixed(2)),
        count: scores.length
      };
    });
  }, [rounds]);

  // ===================== パー別平均スコア =====================
  const parGroupData = useMemo(() => {
    if (rounds.length === 0) return [];
    const groups = { 3: [], 4: [], 5: [] };
    rounds.forEach(round => {
      for (let h = 1; h <= 18; h++) {
        const hole = round.holes[h];
        if (!hole || !hole.score) continue;
        const par = parArray[h - 1];
        if (groups[par]) groups[par].push(hole.score - par);
      }
    });
    return Object.entries(groups).map(([par, diffs]) => ({
      par: `Par ${par}`,
      avg: diffs.length > 0 ? parseFloat((diffs.reduce((a, b) => a + b, 0) / diffs.length).toFixed(2)) : 0,
      count: diffs.length
    }));
  }, [rounds]);

  // ===================== レーダーチャート（スキルバランス） =====================
  const radarData = useMemo(() => {
    if (!overallStats) return [];
    const rs = overallStats;
    // 各スキルを0-100スケールに正規化
    const parOnPct = parseFloat(rs.parRate) + parseFloat(rs.birdieRate);
    const fwPct = rs.fwRate !== '-' ? parseFloat(rs.fwRate) : 0;
    // パット: 平均36パットを基準（低いほど良い）
    const puttScore = Math.max(0, Math.min(100, (36 - parseFloat(rs.avgPutts)) / 36 * 100 + 50));
    // OBなし率
    const totalHoles = rs.roundSummaries.reduce((s, r) => s + r.holeCount, 0);
    const obFreeRate = totalHoles > 0 ? ((totalHoles - rs.totalOB) / totalHoles * 100) : 100;
    // バンカー回避率
    const bunkerFreeRate = totalHoles > 0 ? ((totalHoles - rs.totalBunker) / totalHoles * 100) : 100;

    return [
      { skill: 'パーオン率', value: Math.min(100, parOnPct) },
      { skill: 'FWキープ率', value: Math.min(100, fwPct) },
      { skill: 'パット', value: Math.min(100, puttScore) },
      { skill: 'OB回避', value: Math.min(100, obFreeRate) },
      { skill: 'バンカー回避', value: Math.min(100, bunkerFreeRate) },
    ];
  }, [overallStats]);

  // ===================== 苦手ホール / 得意ホール =====================
  const holeRanking = useMemo(() => {
    if (holeAvgData.length === 0) return { worst: [], best: [] };
    const withData = holeAvgData.filter(h => h.count > 0);
    const sorted = [...withData].sort((a, b) => b.diff - a.diff);
    return {
      worst: sorted.slice(0, 3),
      best: sorted.slice(-3).reverse().map(h => ({ ...h, diff: h.diff }))
    };
  }, [holeAvgData]);

  // ===================== OUT / IN 比較 =====================
  const outInData = useMemo(() => {
    if (!overallStats || overallStats.roundSummaries.length === 0) return null;
    const rs = overallStats.roundSummaries;
    const avgOut = (rs.reduce((s, r) => s + r.outScore, 0) / rs.length).toFixed(1);
    const avgIn = (rs.reduce((s, r) => s + r.inScore, 0) / rs.length).toFixed(1);
    return { avgOut, avgIn };
  }, [overallStats]);

  // ===================== 描画 =====================
  if (rounds.length === 0) {
    return (
      <div className="score-analysis-page">
        <h1>📊 スコア分析</h1>
        <div className="analysis-empty">
          <p>分析データがありません。</p>
          <p>スコアを登録してから分析をご利用ください。</p>
          <button className="btn btn-primary" onClick={() => navigate('/manual-score')}>
            ✍️ スコアを登録する
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="score-analysis-page">
      <h1>📊 スコア分析</h1>

      {/* ===== 全体サマリー ===== */}
      <section className="analysis-section">
        <h2>🏆 全体サマリー</h2>
        <div className="summary-grid">
          <div className="summary-card accent-green">
            <span className="summary-label">ベストスコア</span>
            <span className="summary-value">{overallStats.bestScore}</span>
          </div>
          <div className="summary-card accent-blue">
            <span className="summary-label">平均スコア</span>
            <span className="summary-value">{overallStats.avgScore}</span>
          </div>
          <div className="summary-card accent-orange">
            <span className="summary-label">ワーストスコア</span>
            <span className="summary-value">{overallStats.worstScore}</span>
          </div>
          <div className="summary-card accent-purple">
            <span className="summary-label">平均パット</span>
            <span className="summary-value">{overallStats.avgPutts}</span>
          </div>
          <div className="summary-card accent-teal">
            <span className="summary-label">FWキープ率</span>
            <span className="summary-value">{overallStats.fwRate}%</span>
          </div>
          <div className="summary-card accent-red">
            <span className="summary-label">総ラウンド数</span>
            <span className="summary-value">{overallStats.totalRounds}</span>
          </div>
        </div>
      </section>

      {/* ===== OUT / IN 比較 ===== */}
      {outInData && (
        <section className="analysis-section">
          <h2>🔄 OUT / IN 比較</h2>
          <div className="out-in-compare">
            <div className="out-in-card">
              <span className="out-in-label">OUT (1〜9H)</span>
              <span className="out-in-value">{outInData.avgOut}</span>
              <span className="out-in-par">Par 36</span>
            </div>
            <div className="out-in-divider">vs</div>
            <div className="out-in-card">
              <span className="out-in-label">IN (10〜18H)</span>
              <span className="out-in-value">{outInData.avgIn}</span>
              <span className="out-in-par">Par 36</span>
            </div>
          </div>
        </section>
      )}

      {/* ===== スコア推移 ===== */}
      {trendData.length > 1 && (
        <section className="analysis-section">
          <h2>📈 スコア推移</h2>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip
                  formatter={(val, name) => {
                    const labels = { score: 'スコア', putts: 'パット', out: 'OUT', in: 'IN' };
                    return [val, labels[name] || name];
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#667eea" strokeWidth={2} dot={{ r: 4 }} name="スコア" />
                <Line type="monotone" dataKey="putts" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="パット" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* ===== スコア分布 ===== */}
      {distributionData.length > 0 && (
        <section className="analysis-section">
          <h2>🎯 スコア分布</h2>
          <div className="distribution-row">
            <div className="chart-wrapper pie-wrapper">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {distributionData.map((_, i) => (
                      <Cell key={i} fill={COLORS_PIE[i % COLORS_PIE.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="distribution-stats">
              <div className="dist-row"><span className="dist-dot" style={{ background: '#4ecdc4' }} />バーディ以下: <strong>{overallStats.birdieRate}%</strong></div>
              <div className="dist-row"><span className="dist-dot" style={{ background: '#ff6b6b' }} />パー: <strong>{overallStats.parRate}%</strong></div>
              <div className="dist-row"><span className="dist-dot" style={{ background: '#f8b500' }} />ボギー: <strong>{overallStats.bogeyRate}%</strong></div>
              <div className="dist-row"><span className="dist-dot" style={{ background: '#667eea' }} />ダブル以上: <strong>{overallStats.doublePlusRate}%</strong></div>
            </div>
          </div>
        </section>
      )}

      {/* ===== スキルレーダー ===== */}
      {radarData.length > 0 && (
        <section className="analysis-section">
          <h2>🕸️ スキルバランス</h2>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} />
                <Radar name="スキル" dataKey="value" stroke="#667eea" fill="#667eea" fillOpacity={0.3} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* ===== ホール別平均スコア ===== */}
      <section className="analysis-section">
        <h2>⛳ ホール別 平均スコア vs パー</h2>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={holeAvgData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hole" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 'auto']} />
              <Tooltip
                formatter={(val, name) => {
                  const labels = { avg: '平均スコア', par: 'パー' };
                  return [val, labels[name] || name];
                }}
              />
              <Legend />
              <Bar dataKey="par" fill="#c8e6c9" name="パー" radius={[4, 4, 0, 0]} />
              <Bar dataKey="avg" fill="#667eea" name="平均スコア" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ===== パー別平均差 ===== */}
      {parGroupData.length > 0 && (
        <section className="analysis-section">
          <h2>📏 パー別 平均オーバー数</h2>
          <div className="par-group-cards">
            {parGroupData.map(pg => (
              <div key={pg.par} className={`par-group-card ${pg.avg > 1 ? 'weak' : pg.avg <= 0.3 ? 'strong' : ''}`}>
                <span className="pg-par">{pg.par}</span>
                <span className="pg-avg">{pg.avg > 0 ? '+' : ''}{pg.avg}</span>
                <span className="pg-count">{pg.count}ホール</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== 苦手ホール / 得意ホール ===== */}
      <section className="analysis-section">
        <h2>🔥 苦手 & 得意ホール</h2>
        <div className="hole-ranking-row">
          <div className="ranking-col">
            <h3>😰 苦手ホール</h3>
            {holeRanking.worst.map((h, i) => (
              <div key={h.holeNum} className="ranking-item worst" onClick={() => navigate(`/hole/${h.holeNum}`)}>
                <span className="rank">#{i + 1}</span>
                <span className="rank-hole">Hole {h.holeNum}</span>
                <span className="rank-info">Par {h.par} / 平均 {h.avg}</span>
                <span className="rank-diff">+{h.diff.toFixed(1)}</span>
              </div>
            ))}
          </div>
          <div className="ranking-col">
            <h3>💪 得意ホール</h3>
            {holeRanking.best.map((h, i) => (
              <div key={h.holeNum} className="ranking-item best" onClick={() => navigate(`/hole/${h.holeNum}`)}>
                <span className="rank">#{i + 1}</span>
                <span className="rank-hole">Hole {h.holeNum}</span>
                <span className="rank-info">Par {h.par} / 平均 {h.avg}</span>
                <span className="rank-diff">{h.diff >= 0 ? '+' : ''}{h.diff.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== トラブル統計 ===== */}
      <section className="analysis-section">
        <h2>⚠️ トラブル統計（全ラウンド合計）</h2>
        <div className="trouble-cards">
          <div className="trouble-card ob">
            <span className="trouble-icon">🚫</span>
            <span className="trouble-label">OB</span>
            <span className="trouble-value">{overallStats.totalOB}回</span>
            <span className="trouble-avg">平均 {(overallStats.totalOB / overallStats.totalRounds).toFixed(1)} / R</span>
          </div>
          <div className="trouble-card bunker">
            <span className="trouble-icon">🏖️</span>
            <span className="trouble-label">バンカー</span>
            <span className="trouble-value">{overallStats.totalBunker}回</span>
            <span className="trouble-avg">平均 {(overallStats.totalBunker / overallStats.totalRounds).toFixed(1)} / R</span>
          </div>
          <div className="trouble-card penalty">
            <span className="trouble-icon">🟡</span>
            <span className="trouble-label">ペナルティ</span>
            <span className="trouble-value">{overallStats.totalPenalty}回</span>
            <span className="trouble-avg">平均 {(overallStats.totalPenalty / overallStats.totalRounds).toFixed(1)} / R</span>
          </div>
        </div>
      </section>

      {/* ===== ナビゲーション ===== */}
      <div className="analysis-nav">
        <button className="btn btn-secondary" onClick={() => navigate('/')}>🏠 ホームへ</button>
        <button className="btn btn-secondary" onClick={() => navigate('/courses')}>⛳ コース分析へ</button>
      </div>
    </div>
  );
};

export default ScoreAnalysis;
