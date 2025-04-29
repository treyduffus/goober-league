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
  removePlayer: (id: number) => void;
  addGame: (gameData: Omit<Game, 'id' | 'date'>, team1PlayerIds: number[], team2PlayerIds: number[]) => void;
  updateGame: (updatedGame: Game) => void;
  removeGame: (id: number) => void;
  addSeason: (name: string, startDate: string, endDate: string) => void;
  updateSeason: (updatedSeason: Season) => void;
  removeSeason: (id: number) => void;
  setCurrentSeason: (seasonId: number) => void;
  getPlayerById: (id: number) => Player | undefined;
  getGameById: (id: number) => Game | undefined;
  getSeasonById: (id: number) => Season | undefined;
  handleSetCurrentSeason: (season : Season) => void;
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
        const name = `${monthName} ${year}`;
        const startDate = currentDate.toISOString()
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString()
        addSeason(name, startDate, endDate)
      } else {
        setSeasons(data);

      }
    }
  };

  useEffect(() => {
    async function loadSeasons() {
      await fetchSeasons();
    }
    loadSeasons();
  }, []);
  
  useEffect(() => {
    if (seasons.length > 0) {
      const current = seasons.find(season => season.is_current_season);
      if (current) {
        setCurrentSeason(current);
      }
    }
  }, [seasons]);

  useEffect(() => {
    const fetchGamePlayers = async () => {
      const { data } = await supabase.from("Game_Player").select();
      if (data) {
        setGamePlayers(data);
      }
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

    const newPlayer = data[0];

    setPlayers(prev => [...prev, newPlayer]);
  };

  const handleSetCurrentSeason = async (season: Season) => {
    // 1. Clear the flag on all seasons
    const { error: resetError } = await supabase
      .from("Season")
      .update({ is_current_season: false })
      .eq("is_current_season", true); // only update currently set ones
  
    if (resetError) {
      console.error("Failed to reset previous current season:", resetError);
      return;
    }
  
    // 2. Set the new current season
    const { error: updateError } = await supabase
      .from("Season")
      .update({ is_current_season: true })
      .eq("id", season.id);
  
    if (updateError) {
      console.error("Failed to set new current season:", updateError);
      return;
    }
  
    // 3. Update local state
    const tempSeason = {
      ...season,
      is_current_season: true,
    };
  
    setCurrentSeason(tempSeason);
  };

  const addSeason = async (name: string, startDate: string, endDate: string) => {

    const {data, error} = await supabase
      .from("Season")
      .insert({
        name: name,
        start_date: startDate,
        end_date: endDate
      })
      .select();

    console.log("Insert result:", data);
    console.error("Insert error:", error);

    const newSeason = data[0];
    
    setSeasons(prev => [...prev, newSeason]);
    setCurrentSeason(newSeason);
  };

  const addGame = async (
    gameData: Omit<Game, 'id' | 'date'>,
    team1PlayerIds: number[], 
    team2PlayerIds: number[]
  ) => {
    // Step 1: Insert the game
    const { data, error } = await supabase
      .from("Game")
      .insert(gameData)
      .select()
      .single(); // <-- use single() because you are inserting 1 row
  
    if (error || !data) {
      console.error("Insert Game error:", error);
      return;
    }
  
    const newGame = data;
  
    // Step 2: Prepare gamePlayer insert payload
    const gamePlayerEntries = [
      ...team1PlayerIds.map(playerId => ({
        game_id: newGame.id,
        player_id: playerId,
        team: 1
      })),
      ...team2PlayerIds.map(playerId => ({
        game_id: newGame.id,
        player_id: playerId,
        team: 2
      }))
    ];
  
    // Step 3: Insert players into GamePlayer
    const { error: gamePlayerError } = await supabase
      .from("Game_Player")
      .insert(gamePlayerEntries);
  
    if (gamePlayerError) {
      console.error("Insert GamePlayer error:", gamePlayerError);
      return;
    }
  
    // Step 4: Update local state
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
      .from("Season")
      .update(updatedSeason)
      .eq('id', updatedSeason.id)
      .select();


    console.log("Update result:", data);
    console.error("Update error:", error);

    setSeasons(prev => 
      prev.map(season => season.id === updatedSeason.id ? updatedSeason : season)
    );

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
    setCurrentSeason,
    gamePlayers,
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
    handleSetCurrentSeason,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};