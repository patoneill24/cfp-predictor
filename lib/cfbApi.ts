import { GameRound } from "./models/gameResult";

const CFB_API_URL = 'https://api.collegefootballdata.com';
const CFB_API_KEY = process.env.CFB_API_KEY;

export interface CFBGame {
  id: number;
  season: number;
  week: number;
  season_type: string;
  start_date: string;
  homeTeam: string;
  awayTeam: string;
  homePoints: number | null;
  awayPoints: number | null;
  completed: boolean;
  notes: string | null;
}

export async function fetchPlayoffGames(year: number): Promise<CFBGame[]> {
  try {
    const headers: HeadersInit = {
      'Accept': 'application/json',
    };

    if (CFB_API_KEY) {
      headers['Authorization'] = `Bearer ${CFB_API_KEY}`;
    }

    // Fetch playoff games (typically postseason)
    const response = await fetch(
      `${CFB_API_URL}/games?year=${year}&seasonType=postseason&classification=fbs`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`CFB API error: ${response.status}`);
    }

    const games: CFBGame[] = await response.json();

    // Filter for playoff games (you may need to adjust this logic based on actual API response)
    // For now, we'll return all postseason games
    return games.filter(game =>
      game.homeTeam && game.awayTeam &&
      (game.completed || game.homePoints !== null || game.awayPoints !== null) && game.notes?.includes('Playoff')
    );
  } catch (error) {
    console.error('Error fetching CFB games:', error);
    throw error;
  }
}

export async function mapCFBGameToResult(game: CFBGame, round: GameRound) {
  const winner = game.completed && game.homePoints !== null && game.awayPoints !== null
    ? (game.homePoints > game.awayPoints ? game.homeTeam : game.awayTeam)
    : null;

    //Edge case: College football API data lists JMU  as 'James Madison' 
    // but on our site we use 'JMU'
    if (game.homeTeam === 'James Madison') {
      game.homeTeam = 'JMU';
    }
    if (game.awayTeam === 'James Madison') {
      game.awayTeam = 'JMU';
    }
  return {
    gameId: `${game.id}`,
    round: round as GameRound,
    team1: game.homeTeam,
    team2: game.awayTeam,
    team1Score: game.homePoints,
    team2Score: game.awayPoints,
    winner,
    completed: game.completed,
    gameDate: new Date(game.start_date),
    lastUpdated: new Date(),
  };
}
