import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import '../styles/dashboard.css';

const Dashboard = () => {
  // localStorage からラウンドデータを取得
  const rounds = useMemo(() => {
    const stored = JSON.parse(localStorage.getItem('golfys_rounds') || '[]');
    return stored.sort((a, b) => new Date(a.play_date) - new Date(b.play_date));
  }, []);

  // 基本統計の計算
  const stats = useMemo(() => {
    if (rounds.length === 0) {
      return {
        total_rounds: 0,
        avg_score: '-',
        avg_putts: '-',
        fairway_kept_rate: '-',
        best_score: '-',
        courses_played: 0
      };
    }

    // 各ラウンドの合計スコアと合計パット数を計算
    const roundStats = rounds.map(round => {
      let totalScore = 0;
      let totalPutts = 0;
      let holeCount = 0;
      let fairwayKept = 0;

      for (const holeNum in round.holes) {
        const hole = round.holes[holeNum];
        if (hole && hole.score) {
          totalScore += hole.score;
          totalPutts += hole.putts || 0;
          holeCount++;
          if (hole.fairway_kept === '〇') fairwayKept++;
        }
      }

      return {
        id: round.id,
        play_date: round.play_date,
        course_name: round.course_name,
        totalScore,
        totalPutts,
        holeCount,
        fairwayKept
      };
    });

    const avgScore = (roundStats.reduce((sum, r) => sum + r.totalScore, 0) / roundStats.length).toFixed(1);
    const avgPutts = (roundStats.reduce((sum, r) => sum + r.totalPutts, 0) / roundStats.length).toFixed(1);
    const bestScore = Math.min(...roundStats.map(r => r.totalScore));
    
    const totalFairways = roundStats.reduce((sum, r) => sum + r.holeCount, 0);
    const totalFairwayKept = roundStats.reduce((sum, r) => sum + r.fairwayKept, 0);
    const fairwayKeptRate = totalFairways > 0 ? ((totalFairwayKept / totalFairways) * 100).toFixed(1) : '-';

    const uniqueCourses = new Set(roundStats.map(r => r.course_name)).size;

    return {
      total_rounds: roundStats.length,
      avg_score: avgScore,
      avg_putts: avgPutts,
      fairway_kept_rate: fairwayKeptRate,
      best_score: bestScore === Infinity ? '-' : bestScore,
      courses_played: uniqueCourses,
      roundStats
    };
  }, [rounds]);

  // スコア推移グラフ用データ
  const chartData = useMemo(() => {
    if (!stats.roundStats) return [];
    return stats.roundStats.map((r, idx) => ({
      date: new Date(r.play_date).toLocaleDateString('ja-JP'),
      score: r.totalScore,
      putts: r.totalPutts,
      scoreRest: Math.max(0, r.totalScore - r.totalPutts),
      roundIndex: idx + 1
    }));
  }, [stats]);

  // 最近のラウンド（最大5件）
  const recentRounds = useMemo(() => {
    return stats.roundStats ? stats.roundStats.slice(-5).reverse() : [];
  }, [stats]);

  // カスタムラベルレンダー関数
  const renderLabel = (props) => {
    const { x, y, width, height, value } = props;
    return (
      <text
        x={x + width / 2}
        y={y + height / 2}
        fill="#fff"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="12"
        fontWeight="bold"
      >
        {value}
      </text>
    );
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>⛳ Golfys</h1>
        <p>ゴルフスコア管理・分析ツール</p>
      </header>

      <div className="dashboard-container">
        <section className="stats-summary">
          <h2>📊 基本統計</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">総ラウンド数</div>
              <div className="stat-value">{stats?.total_rounds || 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">平均スコア</div>
              <div className="stat-value">{stats?.avg_score || '-'}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">平均パット数</div>
              <div className="stat-value">{stats?.avg_putts || '-'}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">FWキープ率</div>
              <div className="stat-value">{stats?.fairway_kept_rate || '-'}%</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">ベストスコア</div>
              <div className="stat-value">{stats?.best_score || '-'}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">プレーコース数</div>
              <div className="stat-value">{stats?.courses_played || 0}</div>
            </div>
          </div>
        </section>

        {chartData.length > 0 && (
          <section className="score-trend-section">
            <h2>📈 スコア推移</h2>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip 
                    cursor={{ fill: 'rgba(102, 126, 234, 0.1)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length > 0) {
                        const data = payload[0].payload;
                        return (
                          <div style={{ backgroundColor: '#fff', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
                            <p style={{ margin: '0', fontSize: '12px' }}>{data.date}</p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '12px', fontWeight: 'bold' }}>スコア: {data.score}</p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '12px', fontWeight: 'bold' }}>パット: {data.putts}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="putts" 
                    fill="#f59e0b"
                    stackId="stack1"
                    radius={[0, 0, 0, 0]}
                    label={renderLabel}
                  />
                  <Bar 
                    dataKey="scoreRest" 
                    fill="#667eea"
                    stackId="stack1"
                    radius={[8, 8, 0, 0]}
                    label={renderLabel}
                  />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '12px', color: '#999' }}>
                下段：パット数（オレンジ） / 上段：スコア（青）
              </div>
            </div>
          </section>
        )}

        <section className="action-area">
          <h2>🎯 アクション</h2>
          <div className="button-group">
            <Link to="/manual-score" className="btn btn-primary">✍️ スコアを手動入力</Link>
            <Link to="/courses" className="btn btn-secondary">🏌️ コースを選択して分析</Link>
          </div>
        </section>

        <section className="recent-rounds">
          <h2>📅 最近のラウンド</h2>
          {recentRounds.length > 0 ? (
            <>
              <div className="rounds-preview">
                {recentRounds.map(round => (
                  <div key={round.id} className="round-preview-card">
                    <div className="round-preview-info">
                      <h3>{round.course_name || 'Unknown Course'}</h3>
                      <p className="date">{round.play_date}</p>
                      <p className="score">スコア: {round.totalScore}</p>
                      <p className="putts">パット: {round.totalPutts}</p>
                    </div>
                  </div>
                ))}
              </div>
              {stats.total_rounds > 5 && (
                <Link to="/rounds" className="link-more">すべてのラウンドを表示 →</Link>
              )}
            </>
          ) : (
            <p>ラウンドデータがありません。スコアを登録してください。</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
