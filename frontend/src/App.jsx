import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CourseSelect from './pages/CourseSelect';
import HoleDetail from './pages/HoleDetail';
import Rounds from './pages/Rounds';
import ManualScore from './pages/ManualScore';
import './styles/app.css';

function AppContent() {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo">⛳ Golfys</Link>
          <ul className="nav-menu">
            <li className="nav-item"><Link to="/" className="nav-link">ホーム</Link></li>
            <li className="nav-item"><Link to="/manual-score" className="nav-link">スコア登録</Link></li>
            <li className="nav-item"><Link to="/courses" className="nav-link">コース分析</Link></li>
          </ul>
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/courses" element={<CourseSelect />} />
          <Route path="/hole/:holeId" element={<HoleDetail />} />
          <Route path="/rounds" element={<Rounds />} />
          <Route path="/rounds/:roundId" element={<Rounds />} />
          <Route path="/manual-score" element={<ManualScore />} />
        </Routes>
      </main>

      <footer className="footer">
        <p>&copy; 2025 Golfys</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
