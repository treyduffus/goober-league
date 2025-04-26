export interface Player {
  id: string;
  name: string;
}

export interface Game {
  id: string;
  date: string;
  team1Score: number;
  team2Score: number;
  team1Captain: string;
  team2Captain: string;
  seasonId: string;
}

export interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  is_current_season: boolean;
}

export type TeamNumber = 1 | 2;

export interface PlayerWithStats extends Player {
  recentPerformance?: number;
}