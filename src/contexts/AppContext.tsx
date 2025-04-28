import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from "../client";
import { v4 as uuidv4 } from 'uuid';
import { Player, Game, Season, GamePlayer } from '../types';

interface AppContextType {
  players: Player[];
  games: Game[];
  seasons: Season[];
  gamePlayers: GamePlayer[];
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


  const [players, setPlayers] = useState<Player[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]); 
  const [currentSeason, setCurrentSeason] = useState<Season>();
  const [gamePlayers, setGamePlayers] = useState<GamePlayer[]>([]);

  // Getters

  useEffect(() => {
    const fetchPlayers = async () => {
      const { data } = await supabase.from("Player").select();
      if (data) {
        setPlayers(data);
      }
    };
  
    fetchPlayers();
  }, []);

  useEffect(() => {
    const fetchGames = async () => {
      const { data } = await supabase.from("Game").select();
      if (data) {
        setGames(data);
      }
    };
  
    fetchGames();
  }, []);

  const fetchSeasons = async () => {
    const { data } = await supabase.from("Season").select();
    if (data) {
      if (data.length == 0){

        const currentDate = new Date();
        const monthName = currentDate.toLocaleString('default', { month: 'long' });
        const year = currentDate.getFullYear();
        const initialSeason: Season = {
          id: uuidv4(),
          name: `${monthName} ${year}`,
          start_date: currentDate.toISOString(),
          end_date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString(),
          is_current_season: true
        };
        addSeason(initialSeason)
      } else {
        setSeasons(data);
      }
    }
  };

  useEffect(() => {
    fetchSeasons();
    setCurrentSeason(seasons.find(season => season.is_current_season))
  }, []);

  useEffect(() => {
    const fetchGamePlayers = async () => {
      const { data } = await supabase.from("GamePlayer").select();
      setGamePlayers(data);
    }
    fetchGamePlayers();
  })

  // Add / Posts

  const addPlayer = async (name: string) => {

    const {data, error} = await supabase
      .from("Player")
      .insert({name: name})
      .select();

    console.log("Insert result:", data);
    console.error("Insert error:", error);

    const newPlayer = data;

    setPlayers(prev => [...prev, newPlayer]);
  };

  const addSeason = async (seasonData: Omit<Season, 'id'>) => {

    const {data, error} = await supabase
      .from("Season")
      .insert(seasonData)
      .select();

    console.log("Insert result:", data);
    console.error("Insert error:", error);

    const newSeason = data;
    
    setSeasons(prev => [...prev, newSeason]);
    setCurrentSeason(newSeason);
  };

  const addGame = async (gameData: Omit<Game, 'id' | 'date'>) => {

    const {data, error} = await supabase
      .from("Game")
      .insert(gameData)
      .select(); 

    console.log("Insert result:", data);
    console.error("Insert error:", error);

    const newGame = data; 

    setGames(prev => [...prev, newGame]);
  };

  // Updates 
  const updatePlayer = async (updatedPlayer: Player) => {
    const {data, error} = await supabase
      .from("Player")
      .update(updatedPlayer)
      .eq('id', updatePlayer.id)
      .select();


    console.log("Update result:", data);
    console.error("Update error:", error);

    setPlayers(prev => 
      prev.map(player => player.id === updatedPlayer.id ? updatedPlayer : player)
    );
  };

  const updateGame = async (updatedGame: Game) => {
    const {data, error} = await supabase
      .from("Game")
      .update(updatedGame)
      .eq('id', updateGame.id)
      .select();

    console.log("Update result:", data);
    console.error("Update error:", error);

    setGames(prev => 
      prev.map(game => game.id === updatedGame.id ? updatedGame : game)
    );
  };

  const updateSeason = async (updatedSeason: Season) => {
    const {data, error} = await supabase
      .from("Game")
      .update(updatedSeason)
      .eq('id', updatedSeason.id)
      .select();


    console.log("Update result:", data);
    console.error("Update error:", error);

    setSeasons(prev => 
      prev.map(season => season.id === updatedSeason.id ? updatedSeason : season)
    );

    if (currentSeason?.id === updatedSeason.id) {
      setCurrentSeason(updatedSeason);
    }
  };


  // Deletes

  const removePlayer = async (id: number) => {

    const {error} = await supabase
      .from("Player")
      .delete()
      .eq('id', id)

    console.error("Delete error:", error);

    setPlayers(prev => prev.filter(player => player.id !== id));
  };

  
  const removeGame = async (id: number) => {

    const {error} = await supabase
      .from("Game")
      .delete()
      .eq('id', id)

    console.error("Delete error:", error);

    setGames(prev => prev.filter(game => game.id !== id));
  };


  const removeSeason = async (id: number) => {

    const {error} = await supabase
      .from("Season")
      .delete()
      .eq('id', id)

    console.error("Delete error:", error);

    setSeasons(prev => prev.filter(season => season.id !== id));
    
    if (currentSeason?.id === id) {
      if(seasons.length > 0) {
        setCurrentSeason(seasons[0])
      } else {
        fetchSeasons()
      }
    }
    
    // Remove all games associated with this season
    // Not sure if I want this functionaility 
    // setGames(prev => prev.filter(game => game.seasonId !== id));
  };

  const getPlayerById = (id: number) => players.find(player => player.id === id);
  const getGameById = (id: number) => games.find(game => game.id === id);
  const getSeasonById = (id: number) => seasons.find(season => season.id === id);

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
    getPlayerById,
    getGameById,
    getSeasonById,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};