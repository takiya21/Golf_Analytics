import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import '../styles/holeDetail.css';

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
    if (holeHistory.length === 0) {
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
        fairwayShortRate: 0
      };
    }

    const scores = holeHistory.map(h => h.score);
    const putts = holeHistory.map(h => h.putts);

    const bestScore = Math.min(...scores);
    const avgScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2);
    const avgPutts = (putts.reduce((a, b) => a + b, 0) / putts.length).toFixed(2);
    const roundCount = scores.length;

    // スコア分類
    const birdieOrBetterCount = scores.filter(s => s <= hole.par - 1).length;
    const parCount = scores.filter(s => s === hole.par).length;
    const bogeyCount = scores.filter(s => s === hole.par + 1).length;
    const doubleBogeyCount = scores.filter(s => s === hole.par + 2).length;
    const tripleBogeyCount = scores.filter(s => s === hole.par + 3).length;
    const extraBogeyCount = scores.filter(s => s >= hole.par + 4).length;

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
  }, [holeHistory, hole.par]);

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
    <div className="hole-detail-page">
      <div className="hole-detail-container">
        {/* ホール画像セクション */}
        <div className="hole-image-section">
          <img src={hole.image} alt={`Hole ${hole.hole_number}`} className="hole-image-large" />
          <div className="hole-info-overlay hole-info-top">
            <h1>{courseData.name}</h1>
          </div>
          <div className="hole-info-overlay hole-info-bottom">
            <h2>Hole {hole.hole_number}</h2>
            <div className="hole-specs">
              <span>Par {hole.par}</span>
              <span>{hole.yardage} yards</span>
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="hole-content">
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

          {/* ナビゲーションボタン */}
          <div className="navigation-buttons">
            {prevHole && (
              <button className="btn btn-secondary" onClick={() => navigate(`/hole/${prevHole}`)}>
                ← Hole {prevHole}
              </button>
            )}
            <button className="btn btn-tertiary" onClick={() => navigate('/courses')}>
              コース一覧に戻る
            </button>
            {nextHole && (
              <button className="btn btn-secondary" onClick={() => navigate(`/hole/${nextHole}`)}>
                Hole {nextHole} →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoleDetail;
