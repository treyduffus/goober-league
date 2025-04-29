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
  }, [])

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

        // Nullify team1Captain
    const { error: updateCaptain1Error } = await supabase
    .from("Game")
    .update({ team1Captain: null })
    .eq("team1Captain", id);

    // Nullify team2Captain
    const { error: updateCaptain2Error } = await supabase
    .from("Game")
    .update({ team2Captain: null })
    .eq("team2Captain", id);

    if (updateCaptain1Error) {
      console.error("Failed to nullify captain references:", updateCaptain1Error);
      return;
    }

    if (updateCaptain2Error) {
      console.error("Failed to nullify captain references:", updateCaptain2Error);
      return;
    }

      // Step 2: Delete related GamePlayer records
    const { error: deleteGPError } = await supabase
    .from("Game_Player")
    .delete()
    .eq("player_id", id);

    if (deleteGPError) {
      console.error("Failed to delete GamePlayer entries:", deleteGPError);
      return;
    }

     // Step 3: Delete the Player
    const { error: deletePlayerError } = await supabase
    .from("Player")
    .delete()
    .eq("id", id);

    if (deletePlayerError) {
      console.error("Failed to delete Player:", deletePlayerError);
      return;
    }

    // Step 4: Update local state
    setPlayers(prev => prev.filter(player => player.id !== id));
  

  }

  const removeGame = async (id: number) => {
    // Step 1: Delete related GamePlayer entries
    const { error: deleteGPError } = await supabase
      .from("Game_Player")
      .delete()
      .eq("game_id", id);
  
    if (deleteGPError) {
      console.error("Failed to delete GamePlayer entries:", deleteGPError);
      return;
    }
  
    // Step 2: Delete the Game itself
    const { error: deleteGameError } = await supabase
      .from("Game")
      .delete()
      .eq("id", id);
  
    if (deleteGameError) {
      console.error("Failed to delete Game:", deleteGameError);
      return;
    }
  
    // Step 3: Update local state
    setGames(prev => prev.filter(game => game.id !== id));
  };

  // WARNING DELETES ALL GAMES WITHIN SEASON 
  const removeSeason = async (id: number) => {
    // Fetch all games linked to the season
    const { data: gamesToDelete, error: fetchError } = await supabase
      .from("Game")
      .select("id")
      .eq("seasonId", id);
  
    if (fetchError) {
      console.error("Error fetching games for season:", fetchError);
      return;
    }
  
    for (const game of gamesToDelete ?? []) {
      await removeGame(game.id); // Assumes removeGame handles its own foreign key deletions
    }
  
    // Now delete the season
    const { error } = await supabase
      .from("Season")
      .delete()
      .eq("id", id);
  
    if (error) {
      console.error("Delete season error:", error);
      return;
    }
  
    setSeasons(prev => prev.filter(season => season.id !== id));
  
    if (currentSeason?.id === id) {
      if (seasons.length > 0) {
        setCurrentSeason(seasons[0]);
      } else {
        fetchSeasons();
      }
    }
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