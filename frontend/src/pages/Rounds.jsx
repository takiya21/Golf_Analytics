import React, { useMemo, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/rounds.css';

const FW_OPTIONS = ['〇', '左', '右', 'ショート'];
const CLUBS = ['ドライバー', '3W', '5W', '4U', '5U', '6U', '2I', '3I', '4I', '5I', '6I', '7I', '8I', '9I', 'PW', 'AW', 'SW', 'パター'];

const Rounds = () => {
  const navigate = useNavigate();
  const { roundId } = useParams();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [editPlayDate, setEditPlayDate] = useState('');
  const [editCourseName, setEditCourseName] = useState('');

  // localStorage からラウンドデータを取得
  const rounds = useMemo(() => {
    const stored = JSON.parse(localStorage.getItem('golfys_rounds') || '[]');
    return stored.sort((a, b) => new Date(b.play_date) - new Date(a.play_date));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  // 各ラウンドのスコア統計を計算
  const roundStats = useMemo(() => {
    return rounds.map(round => {
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
        ...round,
        totalScore,
        totalPutts,
        holeCount,
        fairwayKept,
        fairwayRate: holeCount > 0 ? ((fairwayKept / holeCount) * 100).toFixed(1) : '-'
      };
    });
  }, [rounds]);

  // ラウンド詳細表示
  const selectedRound = useMemo(() => {
    if (!roundId) return null;
    return roundStats.find(r => String(r.id) === String(roundId));
  }, [roundId, roundStats]);

  // ラウンド削除
  const handleDelete = useCallback((id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('このラウンドデータを削除しますか？')) return;
    const stored = JSON.parse(localStorage.getItem('golfys_rounds') || '[]');
    const updated = stored.filter(r => String(r.id) !== String(id));
    localStorage.setItem('golfys_rounds', JSON.stringify(updated));
    if (roundId) {
      navigate('/rounds');
    }
    setRefreshKey(k => k + 1);
  }, [navigate, roundId]);

  // 編集モード開始
  const startEditing = useCallback(() => {
    if (!selectedRound) return;
    // ホールデータのディープコピー
    const holesCopy = {};
    for (const holeNum in selectedRound.holes) {
      holesCopy[holeNum] = { ...selectedRound.holes[holeNum] };
    }
    setEditData(holesCopy);
    setEditPlayDate(selectedRound.play_date || '');
    setEditCourseName(selectedRound.course_name || '');
    setIsEditing(true);
  }, [selectedRound]);

  // 編集キャンセル
  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setEditData(null);
    setEditPlayDate('');
    setEditCourseName('');
  }, []);

  // 編集中のホールデータ更新
  const updateEditHole = useCallback((holeNum, field, value) => {
    setEditData(prev => ({
      ...prev,
      [holeNum]: {
        ...(prev[holeNum] || {}),
        [field]: value
      }
    }));
  }, []);

  // ホール削除
  const deleteHole = useCallback((holeNum) => {
    if (!window.confirm(`ホール ${holeNum} のデータを削除しますか？`)) return;
    setEditData(prev => {
      const copy = { ...prev };
      delete copy[holeNum];
      return copy;
    });
  }, []);

  // 編集保存
  const saveEditing = useCallback(() => {
    if (!selectedRound || !editData) return;
    const stored = JSON.parse(localStorage.getItem('golfys_rounds') || '[]');
    const idx = stored.findIndex(r => String(r.id) === String(selectedRound.id));
    if (idx === -1) return;

    stored[idx] = {
      ...stored[idx],
      play_date: editPlayDate,
      course_name: editCourseName,
      holes: editData,
      updated_at: new Date().toISOString()
    };

    localStorage.setItem('golfys_rounds', JSON.stringify(stored));
    setIsEditing(false);
    setEditData(null);
    setRefreshKey(k => k + 1);
    alert('スコアを更新しました！');
  }, [selectedRound, editData, editPlayDate, editCourseName]);

  // ---- 編集中の合計計算 ----
  const editTotals = useMemo(() => {
    if (!editData) return { totalScore: 0, totalPutts: 0, fairwayKept: 0, holeCount: 0 };
    let totalScore = 0, totalPutts = 0, fairwayKept = 0, holeCount = 0;
    for (const holeNum in editData) {
      const hole = editData[holeNum];
      if (hole && hole.score) {
        totalScore += hole.score;
        totalPutts += hole.putts || 0;
        holeCount++;
        if (hole.fairway_kept === '〇') fairwayKept++;
      }
    }
    return { totalScore, totalPutts, fairwayKept, holeCount,
      fairwayRate: holeCount > 0 ? ((fairwayKept / holeCount) * 100).toFixed(1) : '-'
    };
  }, [editData]);

  // 詳細ビュー
  if (selectedRound) {
    const dataSource = isEditing ? editData : selectedRound.holes;
    const holeNumbers = Object.keys(dataSource || {})
      .map(Number)
      .sort((a, b) => a - b);

    const displayTotals = isEditing ? editTotals : {
      totalScore: selectedRound.totalScore,
      totalPutts: selectedRound.totalPutts,
      fairwayRate: selectedRound.fairwayRate
    };

    return (
      <div className="rounds-detail-page">
        <div className="rounds-detail-container">
          <div className="detail-header">
            <button className="btn-back" onClick={() => { cancelEditing(); navigate('/rounds'); }}>← ラウンド一覧に戻る</button>

            {isEditing ? (
              <div className="edit-header-fields">
                <div className="edit-field-group">
                  <label>コース名</label>
                  <input
                    type="text"
                    className="edit-input edit-input-wide"
                    value={editCourseName}
                    onChange={(e) => setEditCourseName(e.target.value)}
                  />
                </div>
                <div className="edit-field-group">
                  <label>プレー日</label>
                  <input
                    type="date"
                    className="edit-input"
                    value={editPlayDate}
                    onChange={(e) => setEditPlayDate(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <>
                <h1>{selectedRound.course_name || 'Unknown Course'}</h1>
                <p>📅 {selectedRound.play_date} ｜ スコア: {selectedRound.totalScore} ｜ パット: {selectedRound.totalPutts}</p>
              </>
            )}
          </div>

          <div className="scores-section">
            <div className="scores-section-header">
              <h2>⛳ ホール別スコア</h2>
              {!isEditing && (
                <button className="btn-edit" onClick={startEditing}>✏️ スコアを編集</button>
              )}
            </div>
            <div className="scores-table-wrapper">
              <table className="scores-table">
                <thead>
                  <tr>
                    <th>Hole</th>
                    <th>Par</th>
                    <th>Score</th>
                    <th>Putts</th>
                    <th>1打目</th>
                    <th>FWキープ</th>
                    <th>OB</th>
                    <th>Sand</th>
                    <th>Penalty</th>
                    {isEditing && <th>操作</th>}
                  </tr>
                </thead>
                <tbody>
                  {holeNumbers.map(num => {
                    const hole = dataSource[num];
                    if (isEditing) {
                      return (
                        <tr key={num}>
                          <td className="hole-num">{num}</td>
                          <td>
                            <input type="number" className="edit-input edit-input-sm"
                              min="3" max="5"
                              value={hole.par || ''}
                              onChange={(e) => updateEditHole(num, 'par', parseInt(e.target.value) || 0)}
                            />
                          </td>
                          <td>
                            <input type="number" className="edit-input edit-input-sm"
                              min="1" max="15"
                              value={hole.score || ''}
                              onChange={(e) => updateEditHole(num, 'score', parseInt(e.target.value) || 0)}
                            />
                          </td>
                          <td>
                            <input type="number" className="edit-input edit-input-sm"
                              min="0" max="10"
                              value={hole.putts || ''}
                              onChange={(e) => updateEditHole(num, 'putts', parseInt(e.target.value) || 0)}
                            />
                          </td>
                          <td>
                            <select className="edit-select"
                              value={hole.first_club || ''}
                              onChange={(e) => updateEditHole(num, 'first_club', e.target.value)}
                            >
                              <option value="">-</option>
                              {CLUBS.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </td>
                          <td>
                            <select className="edit-select"
                              value={hole.fairway_kept || ''}
                              onChange={(e) => updateEditHole(num, 'fairway_kept', e.target.value)}
                            >
                              <option value="">-</option>
                              {FW_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          </td>
                          <td>
                            <input type="number" className="edit-input edit-input-sm"
                              min="0" max="5"
                              value={hole.ob_count || ''}
                              onChange={(e) => updateEditHole(num, 'ob_count', parseInt(e.target.value) || 0)}
                              placeholder="0"
                            />
                          </td>
                          <td>
                            <input type="number" className="edit-input edit-input-sm"
                              min="0" max="5"
                              value={hole.bunker_count || ''}
                              onChange={(e) => updateEditHole(num, 'bunker_count', parseInt(e.target.value) || 0)}
                              placeholder="0"
                            />
                          </td>
                          <td>
                            <input type="number" className="edit-input edit-input-sm"
                              min="0" max="5"
                              value={hole.penalty_count || ''}
                              onChange={(e) => updateEditHole(num, 'penalty_count', parseInt(e.target.value) || 0)}
                              placeholder="0"
                            />
                          </td>
                          <td>
                            <button className="btn-hole-delete" onClick={() => deleteHole(num)} title="このホールを削除">✕</button>
                          </td>
                        </tr>
                      );
                    }
                    return (
                      <tr key={num}>
                        <td className="hole-num">{num}</td>
                        <td>{hole.par || '-'}</td>
                        <td className="score">{hole.score || '-'}</td>
                        <td>{hole.putts || '-'}</td>
                        <td>{hole.first_club || '-'}</td>
                        <td>{hole.fairway_kept || '-'}</td>
                        <td>{hole.ob_count || '-'}</td>
                        <td>{hole.bunker_count || '-'}</td>
                        <td>{hole.penalty_count || '-'}</td>
                      </tr>
                    );
                  })}
                  <tr style={{ fontWeight: 'bold', borderTop: '2px solid #333' }}>
                    <td>合計</td>
                    <td>{holeNumbers.reduce((sum, n) => sum + (dataSource[n]?.par || 0), 0)}</td>
                    <td className="score">{displayTotals.totalScore}</td>
                    <td>{displayTotals.totalPutts}</td>
                    <td></td>
                    <td>{displayTotals.fairwayRate}%</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    {isEditing && <td></td>}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="actions-section">
            {isEditing ? (
              <>
                <button className="btn-save" onClick={saveEditing}>💾 保存する</button>
                <button className="btn-cancel" onClick={cancelEditing}>キャンセル</button>
              </>
            ) : (
              <>
                <button className="btn-edit" onClick={startEditing}>✏️ スコアを編集</button>
                <button className="btn-danger" onClick={() => handleDelete(selectedRound.id)}>🗑 このラウンドを削除</button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 一覧ビュー
  return (
    <div className="rounds-page">
      <h1>📅 ラウンド履歴</h1>
      {roundStats.length > 0 ? (
        <div className="rounds-list">
          {roundStats.map(round => (
            <div key={round.id} className="round-card">
              <div
                className="round-card-main"
                onClick={() => navigate(`/rounds/${round.id}`)}
              >
                <div className="round-info">
                  <h3>{round.course_name || 'Unknown Course'}</h3>
                  <p className="date">{round.play_date}</p>
                  <p className="holes">{round.holeCount}ホール</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333', margin: 0 }}>{round.totalScore}</p>
                  <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>パット: {round.totalPutts}</p>
                  <p style={{ fontSize: '0.85rem', color: '#999', margin: 0 }}>FW: {round.fairwayRate}%</p>
                </div>
              </div>
              <div className="round-card-actions">
                <button
                  className="btn-card-edit"
                  title="編集"
                  onClick={(e) => { e.stopPropagation(); navigate(`/rounds/${round.id}`); setTimeout(() => startEditing(), 100); }}
                >✏️</button>
                <button
                  className="btn-card-delete"
                  title="削除"
                  onClick={(e) => handleDelete(round.id, e)}
                >🗑</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>ラウンドデータがありません</p>
          <p>スコアを登録して、ラウンド履歴を管理しましょう</p>
          <button onClick={() => navigate('/manual-score')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
            ✍️ スコアを登録する
          </button>
        </div>
      )}
    </div>
  );
};

export default Rounds;
