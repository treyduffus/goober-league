import React, { useState, useEffect } from 'react';
import { Calendar, ChevronRight, Plus, Trophy, BarChart3, Trash2 } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { GamePlayer } from '../types';
import { calculatePlayerStats } from '../utils/stats';

const SeasonPage: React.FC = () => {
  const { seasons, currentSeason, addSeason, updateSeason, removeSeason, games, players, gamePlayers, handleSetCurrentSeason } = useAppContext();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
  });
  const [seasonGameIds, setSeasonGameIds] = useState<Set<number>>(new Set());
  const [seasonGamePlayers, setSeasonGamePlayers] = useState<GamePlayer[]>([]);
  
  const handleAddSeason = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      addSeason(
        formData.name.trim(),
        new Date(formData.startDate).toISOString(),
        new Date(formData.endDate).toISOString(),
      );
      setFormData({
        name: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
      });
      setShowAddForm(false);
    }
  };
  
  const handleDeleteSeason = (seasonId: number) => {
    removeSeason(seasonId);
    setShowDeleteConfirm(null);
  };
  
  // Get stats for each season
  const seasonsWithStats = seasons.map(season => {
    const seasonGames = games.filter(game => game.seasonId === season.id);
    const seasonGameIds = seasonGames.map(game => game.id);
    // Get players who played in this season
    const seasonPlayerIds = new Set<number>();

    if (gamePlayers) {
      gamePlayers.forEach(gp => {
        if (seasonGameIds.includes(gp.gameId)) {
          seasonPlayerIds.add(gp.playerId);
        }
      });
    }
    
    return {
      ...season,
      gameCount: seasonGames.length,
      playerCount: seasonPlayerIds.size,
      isCurrent: currentSeason?.id === season.id,
    };
  });
  
  // Get season details for current season
  const seasonDetails = currentSeason ? {
    id: currentSeason.id,
    games: games.filter(game => game.seasonId === currentSeason.id),
  } : null;

  useEffect(() => {
    if (!seasonDetails || !gamePlayers) return;
  
    const gameIds = new Set(seasonDetails.games.map(game => game.id));
    setSeasonGameIds(gameIds);
  
    const filteredGamePlayers = gamePlayers.filter(gp => gameIds.has(gp.gameId));
    setSeasonGamePlayers(filteredGamePlayers);
  }, []);
  
  const topPerformers = seasonDetails ? (() => {
    // Build a quick lookup for game scores
    const gameScoreMap = new Map<number, { team1Score: number; team2Score: number }>();
    seasonDetails.games.forEach(game => {
      gameScoreMap.set(game.id, {
        team1Score: game.team1Score,
        team2Score: game.team2Score
      });
    });
  
    // Filter relevant games for this season
    const seasonGames = seasonDetails.games;
    
    // Calculate stats for each player
    const playerStats = players.map(player => {
      const { gamesPlayed, wins, losses, winRate } = calculatePlayerStats(
        player.id,
        seasonGames,
        gamePlayers,
        currentSeason?.id // or seasonDetails.id if you want to match seasonDetails
      );
  
      return {
        id: player.id,
        name: player.name,
        games: gamesPlayed,
        wins,
        winRate
      };
    });
  
    // Get top 5 performers
    return playerStats
      .filter(player => player.games >= 2)
      .sort((a, b) => b.winRate - a.winRate || b.games - a.games)
      .slice(0, 5);
  
  })() : [];
  
  
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mr-4">Seasons</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center mt-2 sm:mt-0"
        >
          <Plus size={18} className="mr-1" />
          New Season
        </button>
      </div>
      
      {/* Add Season Form */}
      {showAddForm && (
        <div className="card mb-6 p-4 animate-slide-down">
          <form onSubmit={handleAddSeason}>
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <Calendar size={20} className="mr-2 text-primary-600" />
              Create New Season
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="seasonName" className="label">
                  Season Name
                </label>
                <input
                  id="seasonName"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="input"
                  placeholder="e.g., Summer 2025"
                  autoFocus
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="label">
                    Start Date
                  </label>
                  <input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="input"
                  />
                </div>
                
                <div>
                  <label htmlFor="endDate" className="label">
                    End Date
                  </label>
                  <input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="input"
                    min={formData.startDate}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({
                    name: '',
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
                  });
                }}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={!formData.name.trim() || !formData.startDate || !formData.endDate}
              >
                Create Season
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Seasons List */}
        <div className="md:col-span-1">
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-800">All Seasons</h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {seasonsWithStats.map(season => (
                <div
                  key={season.id}
                  className={`p-4 ${
                    season.isCurrent ? 'bg-primary-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <button
                      className="flex-1 text-left"
                      onClick={() => handleSetCurrentSeason(season)}
                    >
                      <p className={`font-medium ${season.isCurrent ? 'text-primary-700' : ''}`}>
                        {season.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(season.start_date)} - {formatDate(season.end_date)}
                      </p>
                    </button>
                    <div className="flex items-center ml-4">
                      {season.isCurrent && (
                        <span className="mr-2 text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">
                          Current
                        </span>
                      )}
                      <button
                        onClick={() => setShowDeleteConfirm(season.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-gray-50 rounded p-2">
                      <span className="text-gray-600">Games:</span>
                      <span className="ml-1 font-medium">{season.gameCount}</span>
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                      <span className="text-gray-600">Players:</span>
                      <span className="ml-1 font-medium">{season.playerCount}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {seasons.length === 0 && (
                <div className="p-6 text-center text-gray-500">
                  <p>No seasons created yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Season Details */}
        <div className="md:col-span-2">
          {currentSeason ? (
            <div className="space-y-6">
              <div className="card">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center">
                  <Calendar size={20} className="text-primary-600 mr-2" />
                  <h2 className="text-lg font-medium text-gray-800">{currentSeason.name} Overview</h2>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-primary-50 rounded-lg p-4 border border-primary-100">
                      <p className="text-sm font-medium text-primary-700">Time Period</p>
                      <p className="text-lg font-semibold">
                        {formatDate(currentSeason.start_date)} to {formatDate(currentSeason.end_date)}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-sm font-medium text-gray-700">Games Played</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {seasonDetails?.games.length || 0}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-sm font-medium text-gray-700">Active Players</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {seasonGamePlayers.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Top Performers */}
              <div className="card">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center">
                  <Trophy size={20} className="text-secondary-500 mr-2" />
                  <h2 className="text-lg font-medium text-gray-800">Top Performers</h2>
                </div>
                
                {topPerformers.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {topPerformers.map((player, index) => (
                      <div key={player.id} className="p-4 flex items-center">
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center mr-3 text-white font-bold
                          ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-700' : 'bg-gray-300'}
                        `}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{player.name}</p>
                          <p className="text-sm text-gray-500">
                            {player.wins} wins in {player.games} games
                          </p>
                        </div>
                        <div>
                          <span className="inline-block px-2 py-1 bg-primary-100 text-primary-800 rounded text-sm font-medium">
                            {player.winRate}% win rate
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    <p>No player statistics available for this season yet</p>
                    {seasonDetails?.games.length === 0 && (
                      <button
                        onClick={() => window.location.href = '/create-game'}
                        className="btn-primary mt-4"
                      >
                        Create First Game
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              {/* Recent Games */}
              <div className="card">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center">
                  <BarChart3 size={20} className="text-primary-600 mr-2" />
                  <h2 className="text-lg font-medium text-gray-800">Recent Games</h2>
                </div>
                
                {seasonDetails?.games.length ? (
                  <div className="divide-y divide-gray-200">
                    {seasonDetails.games
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 5)
                      .map(game => {
                        const date = new Date(game.date);
                        const formattedDate = date.toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        });
                        
                        return (
                          <div
                            key={game.id}
                            className="p-4 hover:bg-gray-50 cursor-pointer"
                            onClick={() => window.location.href = `/games/${game.id}`}
                          >
                            <div className="flex justify-between items-center">
                              <p className="text-sm text-gray-500">{formattedDate}</p>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-medium">Team 1</p>
                                <p className={`text-xl font-bold ${game.team1Score > game.team2Score ? 'text-green-600' : 'text-gray-700'}`}>
                                  {game.team1Score}
                                </p>
                              </div>
                              <div className="px-4">
                                <span className="text-sm font-medium text-gray-500">vs</span>
                              </div>
                              <div className="flex-1 text-right">
                                <p className="font-medium">Team 2</p>
                                <p className={`text-xl font-bold ${game.team2Score > game.team1Score ? 'text-green-600' : 'text-gray-700'}`}>
                                  {game.team2Score}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    <p>No games played in this season yet</p>
                    <button
                      onClick={() => window.location.href = '/create-game'}
                      className="btn-primary mt-4"
                    >
                      Create First Game
                    </button>
                  </div>
                )}
                
                {(seasonDetails?.games.length || 0) > 5 && (
                  <div className="p-4 border-t border-gray-200">
                    <a 
                      href="/games" 
                      className="text-primary-600 font-medium hover:underline"
                    >
                      View All Games
                    </a>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No Season Selected</h3>
              <p className="text-gray-500 mb-6">
                Select a season from the list or create a new one.
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary"
              >
                Create First Season
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full animate-slide-up">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Season</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this season? This will also delete all games associated with this season. This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteSeason(showDeleteConfirm)}
                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeasonPage;