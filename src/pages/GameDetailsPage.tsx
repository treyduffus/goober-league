import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Trash2, User } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

const GameDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getGameById, getPlayerById, removeGame, getSeasonById } = useAppContext();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const game = getGameById(id || '');
  
  if (!game) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-600 mb-4">Game not found</p>
        <button 
          onClick={() => navigate('/games')}
          className="btn-primary"
        >
          Back to Games
        </button>
      </div>
    );
  }
  
  const season = getSeasonById(game.seasonId);
  
  const team1Players = game.team1Players.map(id => getPlayerById(id)!);
  const team2Players = game.team2Players.map(id => getPlayerById(id)!);
  
  const team1Won = game.team1Score > game.team2Score;
  const team2Won = game.team2Score > game.team1Score;
  const isTie = game.team1Score === game.team2Score;
  
  const date = new Date(game.date);
  const formattedDate = date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const formattedTime = date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
  
  const handleDelete = () => {
    removeGame(game.id);
    navigate('/games');
  };
  
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <button
          onClick={() => navigate('/games')}
          className="flex items-center text-primary-600 font-medium hover:underline"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to All Games
        </button>
      </div>
      
      <div className="card mb-6">
        <div className="px-6 py-4 flex justify-between items-center border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Game Details</h1>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="btn flex items-center text-sm py-1 bg-red-500 text-white hover:bg-red-600 focus:ring-red-400"
          >
            <Trash2 size={16} className="mr-1" />
            Delete
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center">
              <Calendar size={18} className="text-gray-500 mr-2" />
              <span className="text-gray-700">{formattedDate}</span>
            </div>
            <div className="flex items-center">
              <Clock size={18} className="text-gray-500 mr-2" />
              <span className="text-gray-700">{formattedTime}</span>
            </div>
            {season && (
              <div className="bg-primary-50 px-3 py-1 rounded-full text-sm text-primary-700 font-medium">
                {season.name}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Team 1 */}
            <div className={`rounded-lg p-6 ${
              team1Won ? 'bg-green-50 border border-green-100' : 
              isTie ? 'bg-gray-50 border border-gray-200' : 
              'bg-gray-50 border border-gray-200'
            }`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Team 1</h2>
                <div>
                  <span className={`text-3xl font-bold ${
                    team1Won ? 'text-green-600' : 'text-gray-700'
                  }`}>
                    {game.team1Score}
                  </span>
                  {team1Won && (
                    <span className="ml-2 text-sm bg-green-600 text-white px-2 py-1 rounded">
                      Winner
                    </span>
                  )}
                </div>
              </div>
              
              <h3 className="text-sm font-medium text-gray-500 mb-2">Players</h3>
              <div className="space-y-2">
                {team1Players.map(player => (
                  <div 
                    key={player.id}
                    className="flex items-center p-2 bg-white rounded-md shadow-sm cursor-pointer hover:bg-gray-50"
                    onClick={() => navigate(`/players/${player.id}`)}
                  >
                    <div className="mr-3 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center">
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">{player.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Team 2 */}
            <div className={`rounded-lg p-6 ${
              team2Won ? 'bg-green-50 border border-green-100' : 
              isTie ? 'bg-gray-50 border border-gray-200' : 
              'bg-gray-50 border border-gray-200'
            }`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Team 2</h2>
                <div>
                  <span className={`text-3xl font-bold ${
                    team2Won ? 'text-green-600' : 'text-gray-700'
                  }`}>
                    {game.team2Score}
                  </span>
                  {team2Won && (
                    <span className="ml-2 text-sm bg-green-600 text-white px-2 py-1 rounded">
                      Winner
                    </span>
                  )}
                </div>
              </div>
              
              <h3 className="text-sm font-medium text-gray-500 mb-2">Players</h3>
              <div className="space-y-2">
                {team2Players.map(player => (
                  <div 
                    key={player.id}
                    className="flex items-center p-2 bg-white rounded-md shadow-sm cursor-pointer hover:bg-gray-50"
                    onClick={() => navigate(`/players/${player.id}`)}
                  >
                    <div className="mr-3 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center">
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">{player.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Player Performance */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800 flex items-center">
            <User size={18} className="mr-2 text-primary-600" />
            Player Performance
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {[...team1Players, ...team2Players]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(player => {
              const inTeam1 = team1Players.some(p => p.id === player.id);
              const won = (inTeam1 && team1Won) || (!inTeam1 && team2Won);
              const lost = (inTeam1 && team2Won) || (!inTeam1 && team1Won);
              
              return (
                <div 
                  key={player.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                  onClick={() => navigate(`/players/${player.id}`)}
                >
                  <div className="flex items-center">
                    <div className="mr-3 w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center">
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{player.name}</p>
                      <p className="text-sm text-gray-500">
                        Team {inTeam1 ? '1' : '2'}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    {won && (
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">
                        Won
                      </span>
                    )}
                    {lost && (
                      <span className="inline-block px-2 py-1 bg-red-100 text-red-800 rounded text-sm font-medium">
                        Lost
                      </span>
                    )}
                    {isTie && (
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm font-medium">
                        Tie
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
      
      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full animate-slide-up">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Game</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this game? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
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

export default GameDetailsPage;