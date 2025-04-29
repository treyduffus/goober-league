import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Calendar, Filter, PlusCircle, Search, X } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

const GameHistoryPage: React.FC = () => {
  const { games, players, currentSeason, seasons, gamePlayers } = useAppContext();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeason, setFilterSeason] = useState<number | null>(
    currentSeason ? currentSeason.id : null
  );
  
  const filteredGames = games
    .filter(game => {
      if (filterSeason) {
        return game.seasonId === filterSeason;
      }
      return true;
    })
    .filter(game => {
      if (!searchTerm) return true;
    
      const searchLower = searchTerm.toLowerCase();
    
      const relatedGamePlayers = gamePlayers.filter(gp => gp.gameId === game.id);
    
      // Only continue if we have gamePlayers and players loaded
      const playerNames = relatedGamePlayers.length && players.length
        ? relatedGamePlayers
            .map(gp => players.find(p => p.id === gp.playerId)?.name || '')
            .join(' ')
        : '';
    
      return (
        playerNames.toLowerCase().includes(searchLower) ||
        game.team1Score.toString().includes(searchLower) ||
        game.team2Score.toString().includes(searchLower)
      );
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Group games by date
  const groupedGames: Record<string, typeof filteredGames> = {};
  
  filteredGames.forEach(game => {
    const date = new Date(game.date);
    const dateKey = date.toISOString().split('T')[0];
    
    if (!groupedGames[dateKey]) {
      groupedGames[dateKey] = [];
    }
    
    groupedGames[dateKey].push(game);
  });
  
  // Get player names for a team
  const getTeamPlayerNames = (gameId: number, team: number) => {
    return gamePlayers
      .filter(gp => gp.gameId === gameId && gp.team === team)
      .map(gp => players.find(p => p.id === gp.playerId)?.name || 'Unknown')
      .join(', ');
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mr-4">Game History</h1>
        <button
          onClick={() => navigate('/create-game')}
          className="btn-primary flex items-center mt-2 sm:mt-0"
        >
          <PlusCircle size={18} className="mr-1" />
          New Game
        </button>
      </div>
      
      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search games or players..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setSearchTerm('')}
              >
                <X size={18} className="text-gray-400" />
              </button>
            )}
          </div>
          
          <div className="sm:w-64">
            <div className="flex items-center relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar size={18} className="text-gray-400" />
              </div>
              <select
                className="input pl-10 appearance-none pr-8"
                value={filterSeason || ''}
                onChange={(e) => setFilterSeason(parseInt(e.target.value) || null)}
              >
                <option value="">All Seasons</option>
                {seasons.map(season => (
                  <option key={season.id} value={season.id}>
                    {season.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Filter size={18} className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Game List */}
      {Object.keys(groupedGames).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedGames).map(([dateKey, dateGames]) => (
            <div key={dateKey} className="card">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-medium text-gray-800">
                  {formatDate(dateKey)}
                </h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {dateGames.map(game => (
                  <div
                    key={game.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/games/${game.id}`)}
                  >
                    <div className="mb-2">
                      <span className="text-sm text-gray-500">
                        {new Date(game.date).toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="font-medium">Team 1</p>
                        <p className="text-sm text-gray-600 mb-1 line-clamp-1">
                          {getTeamPlayerNames(game.id, 1)}
                        </p>
                        <p className={`text-xl font-bold ${game.team1Score > game.team2Score ? 'text-green-600' : 'text-gray-700'}`}>
                          {game.team1Score}
                        </p>
                      </div>
                      
                      <div className="px-4 flex flex-col items-center">
                        <Trophy 
                          size={18} 
                          className={`mb-1 ${
                            game.team1Score > game.team2Score 
                              ? 'text-yellow-500 -rotate-12' 
                              : game.team2Score > game.team1Score 
                                ? 'text-yellow-500 rotate-12' 
                                : 'text-gray-300'
                          }`} 
                        />
                        <span className="text-sm font-medium text-gray-500">vs</span>
                      </div>
                      
                      <div className="flex-1 text-right">
                        <p className="font-medium">Team 2</p>
                        <p className="text-sm text-gray-600 mb-1 line-clamp-1">
                          {getTeamPlayerNames(game.id, 2)}
                        </p>
                        <p className={`text-xl font-bold ${game.team2Score > game.team1Score ? 'text-green-600' : 'text-gray-700'}`}>
                          {game.team2Score}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center">
          <Trophy size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Games Found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || filterSeason !== currentSeason?.id
              ? 'No games match your search criteria'
              : 'No games have been played yet'}
          </p>
          <button
            onClick={() => navigate('/create-game')}
            className="btn-primary inline-flex items-center"
          >
            <PlusCircle size={18} className="mr-1" />
            Create First Game
          </button>
        </div>
      )}
    </div>
  );
};

export default GameHistoryPage;