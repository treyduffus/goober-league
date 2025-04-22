import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Save, Trash2, X } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

const PlayerDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPlayerById, updatePlayer, removePlayer, games } = useAppContext();
  
  const player = getPlayerById(id || '');
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  if (!player) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-600 mb-4">Player not found</p>
        <button 
          onClick={() => navigate('/players')}
          className="btn-primary"
        >
          Back to Players
        </button>
      </div>
    );
  }
  
  const playerGames = games
    .filter(game => 
      game.team1Players.includes(player.id) || 
      game.team2Players.includes(player.id)
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const startEdit = () => {
    setEditName(player.name);
    setEditing(true);
  };
  
  const cancelEdit = () => {
    setEditing(false);
    setEditName('');
  };
  
  const saveEdit = () => {
    if (editName.trim()) {
      updatePlayer({
        ...player,
        name: editName.trim()
      });
      setEditing(false);
    }
  };
  
  const handleDelete = () => {
    removePlayer(player.id);
    navigate('/players');
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <button
          onClick={() => navigate('/players')}
          className="flex items-center text-primary-600 font-medium hover:underline"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to All Players
        </button>
      </div>
      
      <div className="card mb-6">
        <div className="px-6 py-4 flex justify-between items-center border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Player Profile</h1>
          <div className="flex space-x-2">
            {!editing ? (
              <>
                <button
                  onClick={startEdit}
                  className="btn-outline flex items-center text-sm py-1"
                >
                  <Edit size={16} className="mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="btn flex items-center text-sm py-1 bg-red-500 text-white hover:bg-red-600 focus:ring-red-400"
                >
                  <Trash2 size={16} className="mr-1" />
                  Delete
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={cancelEdit}
                  className="btn-outline flex items-center text-sm py-1"
                >
                  <X size={16} className="mr-1" />
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  className="btn-primary flex items-center text-sm py-1"
                >
                  <Save size={16} className="mr-1" />
                  Save
                </button>
              </>
            )}
          </div>
        </div>
        
        <div className="p-6">
          {editing ? (
            <div className="mb-4">
              <label htmlFor="playerName" className="label">
                Player Name
              </label>
              <input
                id="playerName"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="input"
                autoFocus
              />
            </div>
          ) : (
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-2xl font-bold mr-4">
                {player.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{player.name}</h2>
                <p className="text-gray-500">{player.gamesPlayed} games played</p>
              </div>
            </div>
          )}
          
          {!editing && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <p className="text-sm font-medium text-green-700">Wins</p>
                <p className="text-2xl font-bold text-green-800">{player.wins}</p>
              </div>
              
              <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                <p className="text-sm font-medium text-red-700">Losses</p>
                <p className="text-2xl font-bold text-red-800">{player.losses}</p>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <p className="text-sm font-medium text-blue-700">Win Rate</p>
                <p className="text-2xl font-bold text-blue-800">{player.winRate}%</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {!editing && (
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-800">Recent Games</h2>
          </div>
          
          {playerGames.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {playerGames.slice(0, 5).map(game => {
                const date = new Date(game.date);
                const formattedDate = date.toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                });
                
                const isTeam1 = game.team1Players.includes(player.id);
                const won = isTeam1 
                  ? game.team1Score > game.team2Score 
                  : game.team2Score > game.team1Score;
                
                return (
                  <div 
                    key={game.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/games/${game.id}`)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${won ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className={`text-sm font-medium ${won ? 'text-green-700' : 'text-red-700'}`}>
                          {won ? 'Won' : 'Lost'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{formattedDate}</p>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex-1">
                        <p className={`font-medium ${isTeam1 ? 'font-bold' : ''}`}>Team 1</p>
                        <p className={`text-xl font-bold ${game.team1Score > game.team2Score ? 'text-green-600' : 'text-gray-700'}`}>
                          {game.team1Score}
                        </p>
                      </div>
                      <div className="px-4">
                        <span className="text-sm font-medium text-gray-500">vs</span>
                      </div>
                      <div className="flex-1 text-right">
                        <p className={`font-medium ${!isTeam1 ? 'font-bold' : ''}`}>Team 2</p>
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
              <p>This player hasn't played any games yet</p>
            </div>
          )}
          
          {playerGames.length > 5 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => navigate('/games')}
                className="text-primary-600 font-medium hover:underline"
              >
                View All Games
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full animate-slide-up">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Player</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete {player.name}? This action cannot be undone.
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

export default PlayerDetailsPage;