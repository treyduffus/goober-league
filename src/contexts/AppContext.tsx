import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Player, Game, Season } from '../types';

interface AppContextType {
  players: Player[];
  games: Game[];
  seasons: Season[];
  currentSeason: Season | null;
  addPlayer: (name: string) => void;
  updatePlayer: (updatedPlayer: Player) => void;
  removePlayer: (id: string) => void;
  addGame: (game: Omit<Game, 'id' | 'date'>) => void;
  updateGame: (updatedGame: Game) => void;
  removeGame: (id: string) => void;
  addSeason: (season: Omit<Season, 'id'>) => void;
  updateSeason: (updatedSeason: Season) => void;
  removeSeason: (id: string) => void;
  setCurrentSeason: (seasonId: string) => void;
  getPlayerById: (id: string) => Player | undefined;
  getGameById: (id: string) => Game | undefined;
  getSeasonById: (id: string) => Season | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  
  const [players, setPlayers] = useState<Player[]>(() => {
    const storedPlayers = localStorage.getItem('volleyPlayers');
    return storedPlayers ? JSON.parse(storedPlayers) : [];
  });

  const [games, setGames] = useState<Game[]>(() => {
    const storedGames = localStorage.getItem('volleyGames');
    return storedGames ? JSON.parse(storedGames) : [];
  });

  const [seasons, setSeasons] = useState<Season[]>(() => {
    const storedSeasons = localStorage.getItem('volleySeasons');
    const parsedSeasons = storedSeasons ? JSON.parse(storedSeasons) : [];
    
    if (parsedSeasons.length === 0) {
      const currentDate = new Date();
      const monthName = currentDate.toLocaleString('default', { month: 'long' });
      const year = currentDate.getFullYear();
      const initialSeason: Season = {
        id: uuidv4(),
        name: `${monthName} ${year}`,
        startDate: currentDate.toISOString(),
        endDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString(),
      };
      return [initialSeason];
    }
    
    return parsedSeasons;
  });

  const [currentSeason, setCurrentSeason] = useState<Season | null>(() => {
    const storedCurrentSeasonId = localStorage.getItem('volleyCurrentSeasonId');
    if (storedCurrentSeasonId && seasons.length > 0) {
      return seasons.find(season => season.id === storedCurrentSeasonId) || seasons[0];
    }
    return seasons.length > 0 ? seasons[0] : null;
  });

  useEffect(() => {
    localStorage.setItem('volleyPlayers', JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem('volleyGames', JSON.stringify(games));
  }, [games]);

  useEffect(() => {
    localStorage.setItem('volleySeasons', JSON.stringify(seasons));
  }, [seasons]);

  useEffect(() => {
    if (currentSeason) {
      localStorage.setItem('volleyCurrentSeasonId', currentSeason.id);
    }
  }, [currentSeason]);

  const addPlayer = (name: string) => {
    const newPlayer: Player = {
      id: uuidv4(),
      name,
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      pointsScored: 0,
    };
    setPlayers(prev => [...prev, newPlayer]);
  };

  const updatePlayer = (updatedPlayer: Player) => {
    setPlayers(prev => 
      prev.map(player => player.id === updatedPlayer.id ? updatedPlayer : player)
    );
  };

  const removePlayer = (id: string) => {
    setPlayers(prev => prev.filter(player => player.id !== id));
  };

  const addGame = (gameData: Omit<Game, 'id' | 'date'>) => {
    const newGame: Game = {
      id: uuidv4(),
      date: new Date().toISOString(),
      ...gameData,
      seasonId: currentSeason?.id || '',
    };
    
    setGames(prev => [...prev, newGame]);
    
    // Update player stats
    const team1Won = newGame.team1Score > newGame.team2Score;
    const updatePlayerStats = (playerId: string, won: boolean) => {
      setPlayers(prev => 
        prev.map(player => {
          if (player.id === playerId) {
            const gamesPlayed = player.gamesPlayed + 1;
            const wins = won ? player.wins + 1 : player.wins;
            const losses = !won ? player.losses + 1 : player.losses;
            return {
              ...player,
              gamesPlayed,
              wins,
              losses,
              winRate: gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0,
            };
          }
          return player;
        })
      );
    };
    
    newGame.team1Players.forEach(playerId => {
      updatePlayerStats(playerId, team1Won);
    });
    
    newGame.team2Players.forEach(playerId => {
      updatePlayerStats(playerId, !team1Won);
    });
  };

  const updateGame = (updatedGame: Game) => {
    setGames(prev => 
      prev.map(game => game.id === updatedGame.id ? updatedGame : game)
    );
  };

  const removeGame = (id: string) => {
    setGames(prev => prev.filter(game => game.id !== id));
  };

  const addSeason = (seasonData: Omit<Season, 'id'>) => {
    const newSeason: Season = {
      id: uuidv4(),
      ...seasonData
    };
    
    setSeasons(prev => [...prev, newSeason]);
    setCurrentSeason(newSeason);
  };

  const updateSeason = (updatedSeason: Season) => {
    setSeasons(prev => 
      prev.map(season => season.id === updatedSeason.id ? updatedSeason : season)
    );
    
    if (currentSeason?.id === updatedSeason.id) {
      setCurrentSeason(updatedSeason);
    }
  };

  const removeSeason = (id: string) => {
    setSeasons(prev => prev.filter(season => season.id !== id));
    
    if (currentSeason?.id === id) {
      const remainingSeasons = seasons.filter(season => season.id !== id);
      setCurrentSeason(remainingSeasons.length > 0 ? remainingSeasons[0] : null);
    }
    
    // Remove all games associated with this season
    setGames(prev => prev.filter(game => game.seasonId !== id));
  };

  const setCurrentSeasonById = (seasonId: string) => {
    const season = seasons.find(s => s.id === seasonId);
    if (season) {
      setCurrentSeason(season);
    }
  };

  const getPlayerById = (id: string) => players.find(player => player.id === id);
  const getGameById = (id: string) => games.find(game => game.id === id);
  const getSeasonById = (id: string) => seasons.find(season => season.id === id);

  const value = {
    players,
    games,
    seasons,
    currentSeason,
    addPlayer,
    updatePlayer,
    removePlayer,
    addGame,
    updateGame,
    removeGame,
    addSeason,
    updateSeason,
    removeSeason,
    setCurrentSeason: setCurrentSeasonById,
    getPlayerById,
    getGameById,
    getSeasonById,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};