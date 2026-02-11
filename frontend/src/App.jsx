import React, { createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import { useJsApiLoader } from '@react-google-maps/api';
import Dashboard from './pages/Dashboard';
import CourseSelect from './pages/CourseSelect';
import HoleDetail from './pages/HoleDetail';

// holeId が変わるたびに HoleDetail を完全に再マウントさせるラッパー
function HoleDetailWrapper() {
  const { holeId } = useParams();
  return <HoleDetail key={holeId} />;
}
import Rounds from './pages/Rounds';
import ManualScore from './pages/ManualScore';
import ScoreAnalysis from './pages/ScoreAnalysis';
import './styles/app.css';

// Google Maps のロード状態を共有する Context
export const GoogleMapsContext = createContext({ isLoaded: false, loadError: null });

function GoogleMapsProvider({ children }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const hasValidKey = apiKey && apiKey !== 'YOUR_API_KEY_HERE';

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: hasValidKey ? apiKey : '',
    id: 'google-map-script',
  });

  return (
    <GoogleMapsContext.Provider value={{ isLoaded: hasValidKey && isLoaded, loadError, hasValidKey }}>
      {children}
    </GoogleMapsContext.Provider>
  );
}

function AppContent() {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo">⛳ Golfys</Link>
          <ul className="nav-menu">
            <li className="nav-item"><Link to="/" className="nav-link">ホーム</Link></li>
            <li className="nav-item"><Link to="/manual-score" className="nav-link">スコア登録</Link></li>
            <li className="nav-item"><Link to="/analysis" className="nav-link">スコア分析</Link></li>
            <li className="nav-item"><Link to="/courses" className="nav-link">コース分析</Link></li>
          </ul>
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/courses" element={<CourseSelect />} />
          <Route path="/hole/:holeId" element={<HoleDetailWrapper />} />
          <Route path="/rounds" element={<Rounds />} />
          <Route path="/rounds/:roundId" element={<Rounds />} />
          <Route path="/manual-score" element={<ManualScore />} />
          <Route path="/analysis" element={<ScoreAnalysis />} />
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
    <GoogleMapsProvider>
      <Router basename="/Golf_Analytics">
        <AppContent />
      </Router>
    </GoogleMapsProvider>
  );
}

export default App;
