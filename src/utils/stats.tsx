import {Game, GamePlayer } from '../types';

export const calculatePlayerStats = (playerId: number, games: Game[], gamePlayers: GamePlayer[], seasonId?: number) => {
    // 1. Find all games player played in

    // If this player hasent played yet 
    // if (!gamePlayers) {
    //     const gamesPlayed = 0;
    //     const wins = 0;
    //     const losses = 0;
    //     const winRate = 0;

    //     return { gamesPlayed, wins, losses, winRate };
    // }

    const playerGames = gamePlayers.filter(gp => gp.player_id === playerId);
    
    let wins = 0;
    let losses = 0;
    
    for (const pg of playerGames) {
        const game = games.find(g => g.id === pg.game_id);
        if (!game) continue;
        
        // if (seasonId && game.seasonId !== seasonId) continue; // Skip if filtering by season

        const playerTeam = pg.team;
        const playerScore = parseInt(playerTeam) === 1 ? game.team1Score : game.team2Score;
        const opponentScore = parseInt(playerTeam) === 1 ? game.team2Score : game.team1Score;
        
        if (playerScore > opponentScore) {
            wins++;
        } else {
            losses++;
        }
        
    }

    const gamesPlayed = wins + losses;
    let winRate = gamesPlayed > 0 ? wins / gamesPlayed : 0;
    winRate = Math.round(winRate * 100);


    return { gamesPlayed, wins, losses, winRate };
} 