import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseService, statsService } from '../services/api';
import '../styles/courseSelect.css';

// 定数: lake-hamamatsu コースのホール情報
const LAKE_HAMAMATSU_HOLES = {
  1: { par: 4, yardage: 420 },
  2: { par: 4, yardage: 306 },
  3: { par: 3, yardage: 182 },
  4: { par: 4, yardage: 443 },
  5: { par: 5, yardage: 472 },
  6: { par: 4, yardage: 350 },
  7: { par: 3, yardage: 173 },
  8: { par: 4, yardage: 391 },
  9: { par: 4, yardage: 410 },
  10: { par: 4, yardage: 400 },
  11: { par: 3, yardage: 151 },
  12: { par: 5, yardage: 500 },
  13: { par: 4, yardage: 442 },
  14: { par: 4, yardage: 320 },
  15: { par: 4, yardage: 366 },
  16: { par: 3, yardage: 191 },
  17: { par: 5, yardage: 508 },
  18: { par: 4, yardage: 383 }
};

const CourseSelect = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseDetails, setCourseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const response = await courseService.getAllCourses();
      setCourses(response.data);
      if (response.data.length > 0) {
        selectCourse(response.data[0].id);
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectCourse = async (courseId) => {
    try {
      const response = await courseService.getCourseDetails(courseId);
      
      // lake-hamamatsu コースの場合は定数データを適用
      let courseData = response.data;
      if (courseData.name && courseData.name.includes('浜松')) {
        courseData = {
          ...courseData,
          holes: (courseData.holes || []).map((hole) => ({
            ...hole,
            par: LAKE_HAMAMATSU_HOLES[hole.hole_number]?.par || hole.par,
            yardage: LAKE_HAMAMATSU_HOLES[hole.hole_number]?.yardage || hole.yardage
          }))
        };
      }
      
      setCourseDetails(courseData);
      setSelectedCourse(courseId);
    } catch (error) {
      console.error('Failed to load course details:', error);
    }
  };

  if (loading) {
    return <div className="loading">読込中...</div>;
  }

  return (
    <div className="course-select-page">
      <div className="course-container">
        <h1>🏌️ コース選択</h1>

        {/* Course Tabs */}
        <div className="course-tabs">
          {courses.map(course => (
            <button
              key={course.id}
              className={`tab ${selectedCourse === course.id ? 'active' : ''}`}
              onClick={() => selectCourse(course.id)}
            >
              {course.name}
            </button>
          ))}
        </div>

        {/* Course Details */}
        {courseDetails && (
          <div className="course-details">
            <h2>{courseDetails.name}</h2>

            {/* Holes Grid */}
            <div className="holes-grid">
              {courseDetails.holes?.map(hole => (
                <div 
                  key={hole.id}
                  className="hole-card"
                  onClick={() => navigate(`/hole/${hole.id}`)}
                >
                  <div className="hole-image-container">
                    <img 
                      src={`http://localhost:5000/hole_img/lake-hamamatsu/Hole${hole.hole_number}_par${hole.par}_${hole.yardage}yard.webp`}
                      alt={`Hole ${hole.hole_number}`}
                      className="hole-image"
                      onError={(e) => {
                        console.error(`Failed to load image for Hole ${hole.hole_number}:`, e.target.src);
                        e.target.alt = 'Image not available';
                        e.target.className += ' error';
                      }}
                      onLoad={() => console.log(`Loaded image for Hole ${hole.hole_number}`)}
                    />
                    <div className="hole-overlay">
                      <span className="hole-badge">Hole {hole.hole_number}</span>
                      <span className="hole-par">Par {hole.par}</span>
                      <span className="hole-yard">{hole.yardage}y</span>
                    </div>
                  </div>
                  <div className="hole-info">
                    <div className="hole-stats">
                      <div className="stat">
                        <span className="label">Hole {hole.hole_number}</span>
                        <span className="value">Par {hole.par}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {courses.length === 0 && (
          <div className="empty-state">
            <p>登録されたコースがありません</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/upload')}
            >
              スコアを登録してコースを作成
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseSelect;
