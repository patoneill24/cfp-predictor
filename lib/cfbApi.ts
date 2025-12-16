const CFB_API_URL = process.env.COLLEGE_FOOTBALL_API_URL || 'https://api.collegefootballdata.com';
const CFB_API_KEY = process.env.COLLEGE_FOOTBALL_API_KEY;

export interface CFBGame {
  id: number;
  season: number;
  week: number;
  season_type: string;
  start_date: string;
  home_team: string;
  away_team: string;
  home_points: number | null;
  away_points: number | null;
  completed: boolean;
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
      `${CFB_API_URL}/games?year=${year}&seasonType=postseason&division=fbs`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`CFB API error: ${response.status}`);
    }

    const games: CFBGame[] = await response.json();

    // Filter for playoff games (you may need to adjust this logic based on actual API response)
    // For now, we'll return all postseason games
    return games.filter(game =>
      game.home_team && game.away_team &&
      (game.completed || game.home_points !== null || game.away_points !== null)
    );
  } catch (error) {
    console.error('Error fetching CFB games:', error);
    throw error;
  }
}

export function mapCFBGameToResult(game: CFBGame, round: string) {
  const winner = game.completed && game.home_points !== null && game.away_points !== null
    ? (game.home_points > game.away_points ? game.home_team : game.away_team)
    : null;

  return {
    gameId: `cfb-${game.id}`,
    round: round as any,
    team1: game.home_team,
    team2: game.away_team,
    team1Score: game.home_points,
    team2Score: game.away_points,
    winner,
    completed: game.completed,
    gameDate: new Date(game.start_date),
    lastUpdated: new Date(),
  };
}
