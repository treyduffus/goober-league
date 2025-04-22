import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shuffle, Users, User, CheckCircle, XCircle } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { Player, TeamNumber, PlayerWithStats } from '../types';

const CreateGamePage: React.FC = () => {
  const { players, addGame, games, currentSeason } = useAppContext();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<'select' | 'teams' | 'score'>('select');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [team1Players, setTeam1Players] = useState<string[]>([]);
  const [team2Players, setTeam2Players] = useState<string[]>([]);
  const [team1Score, setTeam1Score] = useState<string>('0');
  const [team2Score, setTeam2Score] = useState<string>('0');
  const [team1Captain, setTeam1Captain] = useState<string>('');
  const [team2Captain, setTeam2Captain] = useState<string>('');
  
  // Calculate player stats for team balancing
  const playersWithStats: PlayerWithStats[] = players.map(player => {
    // Get recent games for this player
    const playerGames = games
      .filter(game => 
        game.team1Players.includes(player.id) || 
        game.team2Players.includes(player.id)
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10); // Consider only the last 10 games
    
    // Calculate recent win rate
    const recentWins = playerGames.filter(game => {
      const inTeam1 = game.team1Players.includes(player.id);
      return (inTeam1 && game.team1Score > game.team2Score) || 
             (!inTeam1 && game.team2Score > game.team1Score);
    }).length;
    
    const recentPerformance = playerGames.length > 0 
      ? (recentWins / playerGames.length) 
      : 0.5; // Default to 0.5 if no games played
    
    return {
      ...player,
      recentPerformance,
    };
  });
  
  // Auto-balance teams
  const balanceTeams = () => {
    if (selectedPlayers.length < 2) return;
    
    // Get the selected players with their stats
    const playersToBalance = selectedPlayers.map(id => 
      playersWithStats.find(p => p.id === id)!
    );
    
    // Sort by performance (best to worst)
    playersToBalance.sort((a, b) => 
      (b.recentPerformance || 0.5) - (a.recentPerformance || 0.5)
    );
    
    const team1: string[] = [];
    const team2: string[] = [];
    let team1Strength = 0;
    let team2Strength = 0;
    
    // Distribute players using a greedy approach
    playersToBalance.forEach(player => {
      if (team1Strength <= team2Strength) {
        team1.push(player.id);
        team1Strength += player.recentPerformance || 0.5;
      } else {
        team2.push(player.id);
        team2Strength += player.recentPerformance || 0.5;
      }
    });
    
    setTeam1Players(team1);
    setTeam2Players(team2);
    
    // Set initial captains to first player of each team
    if (team1.length > 0) setTeam1Captain(team1[0]);
    if (team2.length > 0) setTeam2Captain(team2[0]);
  };
  
  const togglePlayerSelection = (playerId: string) => {
    setSelectedPlayers(prev => 
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };
  
  const moveToTeams = () => {
    if (selectedPlayers.length < 2) return;
    
    // Auto-balance on first entry to the teams screen
    if (team1Players.length === 0 && team2Players.length === 0) {
      balanceTeams();
    }
    
    setStep('teams');
  };
  
  const moveToScore = () => {
    if (team1Players.length === 0 || team2Players.length === 0) return;
    if (!team1Captain || !team2Captain) return;
    setStep('score');
  };
  
  const movePlayerBetweenTeams = (playerId: string, fromTeam: TeamNumber, toTeam: TeamNumber) => {
    if (fromTeam === 1 && toTeam === 2) {
      setTeam1Players(prev => prev.filter(id => id !== playerId));
      setTeam2Players(prev => [...prev, playerId]);
      if (team1Captain === playerId) setTeam1Captain(team1Players[0] || '');
    } else if (fromTeam === 2 && toTeam === 1) {
      setTeam2Players(prev => prev.filter(id => id !== playerId));
      setTeam1Players(prev => [...prev, playerId]);
      if (team2Captain === playerId) setTeam2Captain(team2Players[0] || '');
    }
  };
  
  const handleScoreChange = (team: TeamNumber, value: string) => {
    // Only allow numbers and empty string
    if (!/^\d*$/.test(value)) return;
    
    if (team === 1) {
      setTeam1Score(value);
    } else {
      setTeam2Score(value);
    }
  };
  
  const saveGame = () => {
    if (!currentSeason) return;
    
    const score1 = parseInt(team1Score) || 0;
    const score2 = parseInt(team2Score) || 0;
    
    addGame({
      team1Players,
      team2Players,
      team1Score: score1,
      team2Score: score2,
      team1Captain,
      team2Captain,
      seasonId: currentSeason.id,
    });
    
    navigate('/games');
  };
  
  // Reset teams when selected players change
  useEffect(() => {
    if (step === 'select') {
      setTeam1Players([]);
      setTeam2Players([]);
      setTeam1Captain('');
      setTeam2Captain('');
    }
  }, [selectedPlayers, step]);
  
  const getPlayerById = (id: string): Player | undefined => 
    players.find(player => player.id === id);
  
  const renderPlayerList = () => (
    <div className="card">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-800 flex items-center">
          <Users size={20} className="mr-2 text-primary-600" />
          Select Players
        </h2>
        <span className="bg-primary-100 text-primary-800 text-sm font-medium px-2 py-1 rounded">
          {selectedPlayers.length} selected
        </span>
      </div>
      
      {players.length > 0 ? (
        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {players.map(player => (
            <div 
              key={player.id}
              className={`flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer
                ${selectedPlayers.includes(player.id) ? 'bg-primary-50' : ''}
              `}
              onClick={() => togglePlayerSelection(player.id)}
            >
              <div className="flex items-center">
                <div className="mr-3 w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center">
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium">{player.name}</span>
              </div>
              <div>
                {selectedPlayers.includes(player.id) ? (
                  <CheckCircle className="text-primary-600 h-6 w-6" />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center text-gray-500">
          <p className="mb-4">No players added yet</p>
          <button
            onClick={() => navigate('/players')}
            className="btn-primary"
          >
            Add Players
          </button>
        </div>
      )}
    </div>
  );
  
  const renderTeamAssignment = () => (
    <div className="card">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-800">Assign Teams</h2>
        <button
          onClick={balanceTeams}
          className="btn-outline flex items-center text-sm"
        >
          <Shuffle size={16} className="mr-1" />
          Auto-Balance
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
        {/* Team 1 */}
        <div className="p-4">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800">Team 1</h3>
            <div className="mt-2">
              <label className="label">Team Captain</label>
              <select 
                className="input"
                value={team1Captain}
                onChange={(e) => setTeam1Captain(e.target.value)}
              >
                <option value="">Select captain</option>
                {team1Players.map(playerId => {
                  const player = getPlayerById(playerId);
                  return (
                    <option key={playerId} value={playerId}>
                      {player?.name}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            {team1Players.map(playerId => {
              const player = getPlayerById(playerId);
              return (
                <div 
                  key={playerId}
                  className={`flex items-center justify-between p-2 rounded-md ${
                    playerId === team1Captain ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="mr-2 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm">
                      {player?.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-medium text-sm">{player?.name}</span>
                      {playerId === team1Captain && (
                        <span className="ml-2 text-xs bg-primary-100 text-primary-800 px-1.5 py-0.5 rounded">
                          Captain
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => movePlayerBetweenTeams(playerId, 1, 2)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              );
            })}
            
            {team1Players.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                <p>No players assigned</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Team 2 */}
        <div className="p-4">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800">Team 2</h3>
            <div className="mt-2">
              <label className="label">Team Captain</label>
              <select 
                className="input"
                value={team2Captain}
                onChange={(e) => setTeam2Captain(e.target.value)}
              >
                <option value="">Select captain</option>
                {team2Players.map(playerId => {
                  const player = getPlayerById(playerId);
                  return (
                    <option key={playerId} value={playerId}>
                      {player?.name}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            {team2Players.map(playerId => {
              const player = getPlayerById(playerId);
              return (
                <div 
                  key={playerId}
                  className={`flex items-center justify-between p-2 rounded-md ${
                    playerId === team2Captain ? 'bg-secondary-50 border border-secondary-200' : 'bg-gray-50'
                  }`}
                >
                  <button
                    onClick={() => movePlayerBetweenTeams(playerId, 2, 1)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <div className="flex items-center">
                    <div className="mr-2 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm">
                      {player?.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-medium text-sm">{player?.name}</span>
                      {playerId === team2Captain && (
                        <span className="ml-2 text-xs bg-secondary-100 text-secondary-800 px-1.5 py-0.5 rounded">
                          Captain
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {team2Players.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                <p>No players assigned</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderScoreEntry = () => (
    <div className="card">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-800">Enter Final Score</h2>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Team 1 Score */}
          <div className="bg-primary-50 rounded-lg p-4 border border-primary-100">
            <h3 className="font-semibold text-primary-800 mb-2">
              Team 1
              {team1Captain && (
                <span className="ml-2 text-sm bg-primary-100 text-primary-800 px-2 py-1 rounded">
                  Captain: {getPlayerById(team1Captain)?.name}
                </span>
              )}
            </h3>
            <div className="flex flex-wrap gap-1 mb-4">
              {team1Players.map(playerId => {
                const player = getPlayerById(playerId);
                return (
                  <span 
                    key={playerId}
                    className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-800 rounded text-sm"
                  >
                    <User size={14} className="mr-1" />
                    {player?.name}
                  </span>
                );
              })}
            </div>
            
            <div className="mt-4">
              <label className="label">Score</label>
              <input
                type="text"
                value={team1Score}
                onChange={(e) => handleScoreChange(1, e.target.value)}
                className="input text-center text-2xl font-bold"
                placeholder="0"
              />
            </div>
          </div>
          
          {/* Team 2 Score */}
          <div className="bg-secondary-50 rounded-lg p-4 border border-secondary-100">
            <h3 className="font-semibold text-secondary-800 mb-2">
              Team 2
              {team2Captain && (
                <span className="ml-2 text-sm bg-secondary-100 text-secondary-800 px-2 py-1 rounded">
                  Captain: {getPlayerById(team2Captain)?.name}
                </span>
              )}
            </h3>
            <div className="flex flex-wrap gap-1 mb-4">
              {team2Players.map(playerId => {
                const player = getPlayerById(playerId);
                return (
                  <span 
                    key={playerId}
                    className="inline-flex items-center px-2 py-1 bg-secondary-100 text-secondary-800 rounded text-sm"
                  >
                    <User size={14} className="mr-1" />
                    {player?.name}
                  </span>
                );
              })}
            </div>
            
            <div className="mt-4">
              <label className="label">Score</label>
              <input
                type="text"
                value={team2Score}
                onChange={(e) => handleScoreChange(2, e.target.value)}
                className="input text-center text-2xl font-bold"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Game</h1>
      </div>
      
      <div className="card p-4 mb-6">
        <div className="flex justify-between relative">
          <div className="flex-1 text-center">
            <div 
              className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                step === 'select' ? 'bg-primary-600 text-white' : 'bg-primary-100 text-primary-700'
              }`}
            >
              1
            </div>
            <span className={`text-sm mt-1 block ${step === 'select' ? 'font-medium' : ''}`}>
              Select Players
            </span>
          </div>
          
          <div className="flex-1 text-center">
            <div 
              className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                step === 'teams' ? 'bg-primary-600 text-white' : 'bg-primary-100 text-primary-700'
              }`}
            >
              2
            </div>
            <span className={`text-sm mt-1 block ${step === 'teams' ? 'font-medium' : ''}`}>
              Create Teams
            </span>
          </div>
          
          <div className="flex-1 text-center">
            <div 
              className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                step === 'score' ? 'bg-primary-600 text-white' : 'bg-primary-100 text-primary-700'
              }`}
            >
              3
            </div>
            <span className={`text-sm mt-1 block ${step === 'score' ? 'font-medium' : ''}`}>
              Enter Score
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-10">
            <div 
              className="h-full bg-primary-600 transition-all duration-300"
              style={{ 
                width: step === 'select' ? '0%' : step === 'teams' ? '50%' : '100%' 
              }}
            ></div>
          </div>
        </div>
      </div>
      
      {step === 'select' && renderPlayerList()}
      {step === 'teams' && renderTeamAssignment()}
      {step === 'score' && renderScoreEntry()}
      
      <div className="mt-6 flex justify-between">
        {step !== 'select' && (
          <button
            onClick={() => setStep(step === 'teams' ? 'select' : 'teams')}
            className="btn-outline"
          >
            Back
          </button>
        )}
        
        <div className="ml-auto">
          {step === 'select' && (
            <button
              onClick={moveToTeams}
              disabled={selectedPlayers.length < 2}
              className="btn-primary"
            >
              Continue
            </button>
          )}
          
          {step === 'teams' && (
            <button
              onClick={moveToScore}
              disabled={
                team1Players.length === 0 || 
                team2Players.length === 0 ||
                !team1Captain ||
                !team2Captain
              }
              className="btn-primary"
            >
              Continue
            </button>
          )}
          
          {step === 'score' && (
            <button
              onClick={saveGame}
              disabled={!team1Score || !team2Score}
              className="btn-primary"
            >
              Save Game
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Arrow components for team movement
const ArrowRight = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowLeft = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 12H5M5 12L12 5M5 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default CreateGamePage;