import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Trophy, UserPlus, X } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { calculatePlayerStats } from '../utils/stats';

const PlayersPage: React.FC = () => {
  const { players, addPlayer, games, gamePlayers } = useAppContext();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlayerName.trim()) {
      addPlayer(newPlayerName.trim());
      setNewPlayerName('');
      setShowAddForm(false);
    }
  };

  const filteredPlayers = players
    .filter(player => 
      player.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mr-4">Players</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center mt-2 sm:mt-0"
        >
          <Plus size={18} className="mr-1" />
          Add Player
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search players..."
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

      {/* Add Player Form */}
      {showAddForm && (
        <div className="card mb-6 p-4 animate-slide-down">
          <form onSubmit={handleAddPlayer}>
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <UserPlus size={20} className="mr-2 text-primary-600" />
              Add New Player
            </h3>
            <div className="mb-4">
              <label htmlFor="playerName" className="label">
                Player Name
              </label>
              <input
                id="playerName"
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                className="input"
                placeholder="Enter player name"
                autoFocus
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewPlayerName('');
                }}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={!newPlayerName.trim()}
              >
                Add Player
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Players List */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">
            All Players ({filteredPlayers.length})
          </h2>
        </div>

        {filteredPlayers.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredPlayers.map((player) => {
              const { gamesPlayed, wins, losses, winRate } = calculatePlayerStats(
                player.id,
                games,
                gamePlayers
              );

              return (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/players/${player.id}`)}
                >
                  <div className="flex items-center">
                    <div className="mr-3 w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center">
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{player.name}</p>
                      <p className="text-sm text-gray-500">
                        {gamesPlayed} games played
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {gamesPlayed > 0 && (
                      <div className="mr-4 text-right">
                        <div className="flex items-center text-secondary-600">
                          <Trophy size={16} className="mr-1" />
                          <span className="font-medium">{winRate}%</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {wins}W - {losses}L
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            {searchTerm ? (
              <p>No players match your search</p>
            ) : (
              <div>
                <p className="mb-4">No players added yet</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="btn-primary"
                >
                  Add Your First Player
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayersPage;