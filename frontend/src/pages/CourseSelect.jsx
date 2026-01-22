import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/courseSelect.css';

const CourseSelect = () => {
  const navigate = useNavigate();

  // Lake Hamamatsu コースデータ
  const course = { 
    id: 'lake-hamamatsu', 
    name: 'レイク浜松カントリークラブ',
    par: 72
  };

  const holes = Array.from({ length: 18 }, (_, i) => {
    const holeNum = i + 1;
    const parArray = [4, 4, 3, 4, 5, 4, 3, 4, 5, 4, 3, 5, 4, 4, 4, 3, 5, 4];
    const yardageArray = [420, 306, 182, 443, 472, 350, 173, 391, 492, 400, 151, 500, 442, 320, 366, 191, 508, 383];
    const par = parArray[i];
    const yardage = yardageArray[i];
    const basePath = import.meta.env.BASE_URL;
    
    return {
      hole_number: holeNum,
      par: par,
      yardage: yardage,
      image: `${basePath}hole_img/lake-hamamatsu/Hole${holeNum}_par${par}_${yardage}yard.webp`
    };
  });

  return (
    <div className="course-select-page">
      <h1>🏌️ {course.name}</h1>
      <p className="course-info">Par {course.par} | 18 Holes</p>
      
      <div className="holes-grid">
        {holes.map(hole => (
          <div 
            key={hole.hole_number} 
            className="hole-card" 
            onClick={() => navigate(`/hole/${hole.hole_number}`)}
          >
            <div className="hole-card-image">
              <img src={hole.image} alt={`Hole ${hole.hole_number}`} />
            </div>
            <div className="hole-card-info">
              <h3>Hole {hole.hole_number}</h3>
              <p>Par {hole.par}</p>
              <p>{hole.yardage}y</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseSelect;
