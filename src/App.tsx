import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import PlayersPage from './pages/PlayersPage';
import CreateGamePage from './pages/CreateGamePage';
import GameHistoryPage from './pages/GameHistoryPage';
import SeasonPage from './pages/SeasonPage';
import PlayerDetailsPage from './pages/PlayerDetailsPage';
import GameDetailsPage from './pages/GameDetailsPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="players" element={<PlayersPage />} />
            <Route path="players/:id" element={<PlayerDetailsPage />} />
            <Route path="create-game" element={<CreateGamePage />} />
            <Route path="games" element={<GameHistoryPage />} />
            <Route path="games/:id" element={<GameDetailsPage />} />
            <Route path="seasons" element={<SeasonPage />} />
            <Route path="404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;