import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseService, roundService } from '../services/api';
import '../styles/manualScore.css';

const ManualScore = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [courseDetails, setCourseDetails] = useState(null);
  const [playDate, setPlayDate] = useState(new Date().toISOString().split('T')[0]);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      loadCourseDetails(selectedCourseId);
    }
  }, [selectedCourseId]);

  const loadCourses = async () => {
    try {
      const response = await courseService.getAllCourses();
      setCourses(response.data);
      if (response.data.length > 0) {
        setSelectedCourseId(response.data[0].id);
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCourseDetails = async (courseId) => {
    try {
      const response = await courseService.getCourseDetails(courseId);
      setCourseDetails(response.data);
      // Initialize scores object
      const initialScores = {};
      response.data.holes?.forEach(hole => {
        initialScores[hole.hole_number] = {
          score: '',
          putts: '',
          firstClub: '',
          fairwayKept: false,
          obCount: 0,
          bunkerCount: 0,
          onePenalty: 0
        };
      });
      setScores(initialScores);
    } catch (error) {
      console.error('Failed to load course details:', error);
    }
  };

  const handleScoreChange = (hole, field, value) => {
    setScores({
      ...scores,
      [hole]: {
        ...scores[hole],
        [field]: value
      }
    });
  };

  const handleSubmit = async () => {
    if (!selectedCourseId || !playDate) {
      alert('コースと日付は必須です');
      return;
    }

    setSubmitting(true);
    try {
      // Create round with manual scores
      const response = await roundService.createRound(selectedCourseId, playDate);
      
      // Update scores
      await roundService.updateRound(response.data.id, scores);
      
      alert('スコアが正常に登録されました');
      navigate(`/rounds/${response.data.id}`);
    } catch (error) {
      console.error('Failed to submit scores:', error);
      alert('スコア登録に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">読込中...</div>;
  }

  if (courses.length === 0) {
    return (
      <div className="manual-score-page">
        <div className="manual-score-container">
          <h1>スコア手動登録</h1>
          <div className="empty-state">
            <p>登録されたコースがありません</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/upload')}
            >
              画像からコースを作成
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="manual-score-page">
      <div className="manual-score-container">
        <h1>⛳ スコア手動登録</h1>

        {/* Course Selection Section */}
        <section className="course-section">
          <h2>コース選択</h2>
          <select 
            value={selectedCourseId || ''}
            onChange={(e) => setSelectedCourseId(parseInt(e.target.value))}
            className="course-select"
          >
            <option value="">-- コースを選択してください --</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </section>

        {/* Date Section */}
        <section className="date-section">
          <h2>プレー日</h2>
          <input 
            type="date" 
            value={playDate}
            onChange={(e) => setPlayDate(e.target.value)}
            className="date-input"
          />
        </section>

        {/* Scores Entry Section */}
        {courseDetails && (
          <section className="scores-entry-section">
            <h2>スコア入力</h2>
            <div className="scores-table-wrapper">
              <table className="scores-entry-table">
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
                    <th>ペナ</th>
                  </tr>
                </thead>
                <tbody>
                  {courseDetails.holes?.map(hole => (
                    <tr key={hole.hole_number}>
                      <td className="hole-num">{hole.hole_number}</td>
                      <td>{hole.par}</td>
                      <td>
                        <input 
                          type="number" 
                          value={scores[hole.hole_number]?.score || ''}
                          onChange={(e) => handleScoreChange(hole.hole_number, 'score', e.target.value)}
                          placeholder="--"
                          className="score-input"
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          value={scores[hole.hole_number]?.putts || ''}
                          onChange={(e) => handleScoreChange(hole.hole_number, 'putts', e.target.value)}
                          placeholder="--"
                          className="score-input"
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          value={scores[hole.hole_number]?.firstClub || ''}
                          onChange={(e) => handleScoreChange(hole.hole_number, 'firstClub', e.target.value)}
                          placeholder="クラブ"
                          className="score-input"
                        />
                      </td>
                      <td>
                        <input 
                          type="checkbox" 
                          checked={scores[hole.hole_number]?.fairwayKept || false}
                          onChange={(e) => handleScoreChange(hole.hole_number, 'fairwayKept', e.target.checked)}
                          className="score-checkbox"
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          value={scores[hole.hole_number]?.obCount || 0}
                          onChange={(e) => handleScoreChange(hole.hole_number, 'obCount', parseInt(e.target.value) || 0)}
                          placeholder="0"
                          className="score-input score-input-small"
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          value={scores[hole.hole_number]?.bunkerCount || 0}
                          onChange={(e) => handleScoreChange(hole.hole_number, 'bunkerCount', parseInt(e.target.value) || 0)}
                          placeholder="0"
                          className="score-input score-input-small"
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          value={scores[hole.hole_number]?.onePenalty || 0}
                          onChange={(e) => handleScoreChange(hole.hole_number, 'onePenalty', parseInt(e.target.value) || 0)}
                          placeholder="0"
                          className="score-input score-input-small"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Action Buttons */}
        <div className="button-group">
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-secondary"
            disabled={submitting}
          >
            ← キャンセル
          </button>
          <button 
            onClick={handleSubmit} 
            className="btn btn-primary"
            disabled={submitting || !selectedCourseId}
          >
            {submitting ? '登録中...' : '✅ スコアを登録'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualScore;
