import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/courseSelect.css';

const CourseSelect = () => {
  const navigate = useNavigate();

  // ダミーコースデータ
  const courses = [
    { id: 'lake-hamamatsu', name: 'Lake Hamamatsu' }
  ];

  const holes = Array.from({ length: 18 }, (_, i) => ({
    hole_number: i + 1,
    par: [4, 4, 3, 4, 5, 4, 3, 4, 5, 4, 3, 5, 4, 4, 4, 3, 5, 4][i],
    yardage: [420, 306, 182, 443, 472, 350, 173, 391, 492, 400, 151, 500, 442, 320, 366, 191, 508, 383][i]
  }));

  return (
    <div className="course-select-page">
      <h1>🏌️ コース選択</h1>
      
      <div className="courses-list">
        {courses.map(course => (
          <div key={course.id} className="course-card">
            <h2>{course.name}</h2>
            <p>18 ホール</p>
          </div>
        ))}
      </div>

      <div className="holes-grid">
        {holes.map(hole => (
          <div key={hole.hole_number} className="hole-card" onClick={() => navigate(`/hole/${hole.hole_number}`)}>
            <h3>ホール {hole.hole_number}</h3>
            <p>Par {hole.par}</p>
            <p>{hole.yardage}y</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseSelect;
