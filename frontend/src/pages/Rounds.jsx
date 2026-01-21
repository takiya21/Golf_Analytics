import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roundService } from '../services/api';
import '../styles/rounds.css';

const Rounds = () => {
  const { roundId } = useParams();
  const navigate = useNavigate();
  const [rounds, setRounds] = useState([]);
  const [currentRound, setCurrentRound] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDetailView, setIsDetailView] = useState(!!roundId);

  useEffect(() => {
    loadRounds();
  }, []);

  useEffect(() => {
    if (roundId && rounds.length > 0) {
      const round = rounds.find(r => r.id === parseInt(roundId));
      if (round) {
        loadRoundDetails(roundId);
      }
    }
  }, [roundId, rounds]);

  const loadRounds = async () => {
    try {
      const response = await roundService.getAllRounds();
      setRounds(response.data);
    } catch (error) {
      console.error('Failed to load rounds:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRoundDetails = async (id) => {
    try {
      const response = await roundService.getRoundDetails(id);
      setCurrentRound(response.data);
    } catch (error) {
      console.error('Failed to load round details:', error);
    }
  };

  const handleDeleteRound = async (id) => {
    if (!window.confirm('このラウンドを削除してもよろしいですか？')) {
      return;
    }

    try {
      await roundService.deleteRound(id);
      setRounds(rounds.filter(r => r.id !== id));
      if (currentRound?.id === id) {
        setCurrentRound(null);
        setIsDetailView(false);
        navigate('/rounds');
      }
    } catch (error) {
      console.error('Failed to delete round:', error);
      alert('ラウンドの削除に失敗しました');
    }
  };

  if (loading) {
    return <div className="loading">読込中...</div>;
  }

  if (isDetailView && currentRound) {
    return (
      <div className="rounds-detail-page">
        <div className="rounds-detail-container">
          {/* Header */}
          <div className="detail-header">
            <button className="btn-back" onClick={() => navigate('/rounds')}>← ラウンド一覧に戻る</button>
            <h1>{currentRound.course_name || 'Unknown Course'}</h1>
            <p>{currentRound.play_date}</p>
          </div>

          {/* Scores Table */}
          <section className="scores-section">
            <h2>スコア詳細</h2>
            {currentRound.scores && currentRound.scores.length > 0 ? (
              <div className="scores-table-wrapper">
                <table className="scores-table">
                  <thead>
                    <tr>
                      <th>ホール</th>
                      <th>Par</th>
                      <th>スコア</th>
                      <th>パット</th>
                      <th>1打目</th>
                      <th>FW</th>
                      <th>OB</th>
                      <th>バンカー</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRound.scores.map((score, idx) => (
                      <tr key={idx}>
                        <td className="hole-num">{score.hole_number}</td>
                        <td>{score.par}</td>
                        <td className="score">{score.score || '-'}</td>
                        <td>{score.putts || '-'}</td>
                        <td>{score.first_club || '-'}</td>
                        <td>{score.fairway_kept ? '✓' : '-'}</td>
                        <td>{score.ob_count || 0}</td>
                        <td>{score.bunker_count || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>スコアデータがありません</p>
            )}
          </section>

          {/* Actions */}
          <section className="actions-section">
            <button 
              className="btn btn-danger"
              onClick={() => handleDeleteRound(currentRound.id)}
            >
              ❌ ラウンドを削除
            </button>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="rounds-page">
      <div className="rounds-container">
        <h1>📅 すべてのラウンド</h1>

        {rounds.length > 0 ? (
          <div className="rounds-list">
            {rounds.map(round => (
              <div 
                key={round.id}
                className="round-card"
                onClick={() => navigate(`/rounds/${round.id}`)}
              >
                <div className="round-info">
                  <h3>{round.course_name || 'Unknown Course'}</h3>
                  <p className="date">{round.play_date}</p>
                  <p className="holes">{round.hole_count || 0} ホール</p>
                </div>
                <div className="round-actions">
                  <button 
                    className="btn-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRound(round.id);
                    }}
                    title="削除"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>ラウンドデータがありません</p>
            <p>新しいラウンドを登録してみましょう</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rounds;
