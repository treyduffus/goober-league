import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Users, Trophy, BarChart3 } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

const HomePage: React.FC = () => {
  const { players, games, currentSeason } = useAppContext();
  const navigate = useNavigate();
  
  // Filter games by current season
  const seasonGames = games.filter(game => game.seasonId === currentSeason?.id);
  
  // Calculate top players
  const playersWithStats = players.map(player => {
    const playerGames = seasonGames.filter(
      game => game.team1Players.includes(player.id) || game.team2Players.includes(player.id)
    );
    
    const wins = playerGames.filter(game => {
      const inTeam1 = game.team1Players.includes(player.id);
      return (inTeam1 && game.team1Score > game.team2Score) || 
             (!inTeam1 && game.team2Score > game.team1Score);
    }).length;
    
    return {
      ...player,
      seasonGames: playerGames.length,
      seasonWins: wins,
      winRate: playerGames.length > 0 ? Math.round((wins / playerGames.length) * 100) : 0
    };
  });
  
  const topPlayers = [...playersWithStats]
    .filter(player => player.seasonGames > 0)
    .sort((a, b) => b.winRate - a.winRate)
    .slice(0, 3);

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Volleyball League Manager
        </h1>
      </div>
      
      {currentSeason && (
        <div className="md:hidden mb-6">
          <div className="bg-primary-50 rounded-lg p-4 border border-primary-100">
            <p className="text-sm font-medium text-primary-700">Current Season</p>
            <p className="text-lg font-semibold">{currentSeason.name}</p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <button
          onClick={() => navigate('/create-game')}
          className="card h-40 flex flex-col items-center justify-center p-6 bg-primary-50 border-2 border-dashed border-primary-300 text-primary-700 hover:bg-primary-100 transition-colors"
        >
          <PlusCircle size={36} className="mb-2" />
          <span className="text-lg font-semibold">Create New Game</span>
          <span className="text-sm mt-1">Set up teams and record scores</span>
        </button>
        
        <div 
          className="card h-40 flex flex-col justify-between p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/players')}
        >
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-gray-800">Players</h3>
            <Users className="text-primary-600" size={24} />
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{players.length}</p>
            <p className="text-sm text-gray-500">Total registered players</p>
          </div>
        </div>
        
        <div 
          className="card h-40 flex flex-col justify-between p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/games')}
        >
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-gray-800">Games</h3>
            <Trophy className="text-secondary-500" size={24} />
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{seasonGames.length}</p>
            <p className="text-sm text-gray-500">Games in current season</p>
          </div>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <BarChart3 size={20} className="mr-2 text-primary-600" />
            Current Season Stats
          </h2>
        </div>
        
        {seasonGames.length > 0 ? (
          <div className="card overflow-visible">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-800">Top Performers</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {topPlayers.length > 0 ? (
                topPlayers.map((player, index) => (
                  <div 
                    key={player.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50"
                    onClick={() => navigate(`/players/${player.id}`)}
                  >
                    <div className="flex items-center">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center mr-3 text-white font-bold
                        ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-700'}
                      `}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{player.name}</p>
                        <p className="text-sm text-gray-500">
                          {player.seasonWins} wins in {player.seasonGames} games
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-1 bg-primary-100 text-primary-800 rounded text-sm font-medium">
                        {player.winRate}% win rate
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No player stats available yet
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500 mb-3">No games played in this season yet</p>
            <button 
              onClick={() => navigate('/create-game')}
              className="btn-primary"
            >
              Create First Game
            </button>
          </div>
        )}
      </div>
      
      {/* Recent Games */}
      {seasonGames.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Recent Games</h2>
            <button 
              onClick={() => navigate('/games')}
              className="text-primary-600 text-sm font-medium hover:underline"
            >
              View All
            </button>
          </div>
          
          <div className="card">
            <div className="divide-y divide-gray-200">
              {seasonGames.slice(-3).reverse().map(game => {
                const date = new Date(game.date);
                const formattedDate = date.toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                });
                
                return (
                  <div 
                    key={game.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/games/${game.id}`)}
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
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;