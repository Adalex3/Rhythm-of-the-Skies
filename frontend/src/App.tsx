import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import LoginPage from './pages/LoginPage.tsx';
import MainPage from './pages/MainPage.tsx';
import PreferencesPage from './pages/PreferencesPage.tsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/preferences" element={<PreferencesPage />} />
      </Routes>
    </Router>
  );
}

export default App;