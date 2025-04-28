export interface Player {
  id: number;
  name: string;
}

export interface Game {
  id: number;
  date: string;
  team1Score: number;
  team2Score: number;
  team1Captain: number;
  team2Captain: number;
  seasonId: number;
}

export interface Season {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  is_current_season: boolean;
}

export interface GamePlayer {
  gameId: number;
  playerId: number;
  team: number
}

export type TeamNumber = 1 | 2;

export interface PlayerWithStats extends Player {
  recentPerformance?: number;
}