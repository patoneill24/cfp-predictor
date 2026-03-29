import { BasketballGameResult, BasketballGameRound} from "./models/gameResult";

const CBB_API_URL = 'https://api.collegebasketballdata.com';
// college basketball is the same api as college football, so we use the same key
const CBB_API_KEY = process.env.CFB_API_KEY;

export interface CBBGame {
  id: number;
  season: number;
  week: number;
  season_type: string;
  start_date: string;
  homeTeam: string;
  awayTeam: string;
  homePoints: number | null;
  awayPoints: number | null;
  status: string;
  gameNotes: string | null;
}

export async function fetchBasketballPlayoffGames(): Promise<CBBGame[]> {
  try {
    const headers: HeadersInit = {
      'Accept': 'application/json',
    };

    if (CBB_API_KEY) {
      headers['Authorization'] = `Bearer ${CBB_API_KEY}`;
    }

    // Fetch playoff games (typically postseason)
    // get the start date: yesterday in in ISO 8601 format
    // end date: today in in ISO 8601 format
    const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const endDate = new Date().toISOString();
    // retrieve just the games that are final and are in the NCAA tournament that has finished
    const response = await fetch(
      `${CBB_API_URL}/games?startDateRange=${startDate}&endDateRange=${endDate}&seasonType=postseason&status=final&tournament=NCAA`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`CBB API error: ${response.status}`);
    }

    const games: CBBGame[] = await response.json();

    return games;
  } catch (error) {
    console.error('Error fetching CBB games:', error);
    throw error;
  }
}

export async function mapCBBGameToResult(game: CBBGame, round: BasketballGameRound): Promise<BasketballGameResult> {
  const winner = game.status === 'final' && game.homePoints !== null && game.awayPoints !== null
    ? (game.homePoints > game.awayPoints ? game.homeTeam : game.awayTeam)
    : null;

    if (game.homeTeam.includes("State")) {
      game.homeTeam = game.homeTeam.replace("State", "St.");
    }
    if (game.awayTeam.includes("State")) {
      game.awayTeam = game.awayTeam.replace("State", "St.");
    }

    const n = game.gameNotes;
    if (n?.includes('East Region')) game.gameNotes = 'East Region';
    else if (n?.includes('South Region')) game.gameNotes = 'South Region';
    else if (n?.includes('Midwest Region')) game.gameNotes = 'Midwest Region';
    else if (n?.includes('West Region')) game.gameNotes = 'West Region'
    else game.gameNotes = 'Test';

  return {
    gameId: `${game.id}`,
    round: round as BasketballGameRound,
    sport: 'cbb',
    team1: game.homeTeam,
    team2: game.awayTeam,
    title: game.gameNotes || undefined,
    team1Score: game.homePoints,
    team2Score: game.awayPoints,
    winner,
    completed: game.status === 'final',
    gameDate: new Date(game.start_date),
    lastUpdated: new Date(),
  };
}