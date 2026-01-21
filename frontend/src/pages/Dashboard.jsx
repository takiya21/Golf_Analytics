import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { statsService, roundService } from '../services/api';
import '../styles/dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsResponse, roundsResponse] = await Promise.all([
        statsService.getOverallStats(),
        roundService.getAllRounds()
      ]);
      setStats(statsResponse.data);
      setRounds(roundsResponse.data.slice(0, 5)); // Get 5 most recent rounds
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">読込中...</div>;
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <h1>⛳ Golfys</h1>
        <p>視覚的なコース攻略とデータ分析を融合させたゴルフスコア管理ツール</p>
      </header>

      {/* Main Content */}
      <div className="dashboard-container">
        {/* Stats Summary */}
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

        {/* Action Buttons */}
        <section className="action-area">
          <h2>🎯 アクション</h2>
          <div className="button-group">
            <Link to="/upload" className="btn btn-primary">
              📸 画像からスコアを登録
            </Link>
            <Link to="/manual-score" className="btn btn-secondary">
              ✍️ スコアを手動入力
            </Link>
            <Link to="/courses" className="btn btn-secondary">
              🏌️ コースを選択して分析
            </Link>
          </div>
        </section>

        {/* Recent Rounds */}
        <section className="recent-rounds">
          <h2>📅 最近のラウンド</h2>
          {rounds.length > 0 ? (
            <>
              <div className="rounds-preview">
                {rounds.map(round => (
                  <Link 
                    key={round.id}
                    to={`/rounds/${round.id}`} 
                    className="round-preview-card"
                  >
                    <div className="round-preview-info">
                      <h3>{round.course_name || 'Unknown Course'}</h3>
                      <p className="date">{round.play_date}</p>
                      <p className="holes">{round.hole_count || 0} ホール</p>
                    </div>
                  </Link>
                ))}
              </div>
              <Link to="/rounds" className="link-more">
                すべてのラウンドを表示 →
              </Link>
            </>
          ) : (
            <p>ラウンドデータがありません</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
