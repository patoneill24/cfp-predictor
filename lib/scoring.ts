import { Bracket } from './models/prediction';
import { GameResult } from './models/gameResult';

export function calculateScore(bracket: Bracket, results: GameResult[]): number {
  let totalScore = 0;

  // Create a map using string key for quick lookup
  // Key format: "team1|team2|round"
  const resultsMap = new Map<string, GameResult>();
  results.forEach(result => {
    if (result.completed && result.winner) {
      const key = `${result.team1.trim()}|${result.team2.trim()}|${result.round}`;
      resultsMap.set(key, result);
    }
  });

  const getResult = (team1: string, team2: string, round: string): GameResult | undefined => {
    // Try both team orderings
    const key1 = `${team1.trim()}|${team2.trim()}|${round}`;
    const key2 = `${team2.trim()}|${team1.trim()}|${round}`;
    return resultsMap.get(key1) || resultsMap.get(key2);
  };

  console.log(`Results Map: ${JSON.stringify(Array.from(resultsMap.entries()), null, 2)}`);
  // Score first round (5 points each)
  bracket.firstRound.forEach(game => {
    console.log(`Scoring first round game: ${game.team1} vs ${game.team2} with prediction ${game.prediction}`);
    const result = getResult(game.team1, game.team2, 'firstRound');
    console.log(`Found result: ${JSON.stringify(result, null, 2)}`);
    if (result && result.winner?.trim() === game.prediction?.trim()) {
      totalScore += 5;
    }else{
      console.log(`No match for first round game: ${game.team1} vs ${game.team2} with prediction ${game.prediction}`);
    }
  });

  // Score quarterfinals (5 points each)
  bracket.quarterfinals.forEach(game => {
    const result = getResult(game.team1, game.team2, 'quarterfinals');
    if (result && result.winner === game.prediction) {
      totalScore += 5;
    }
  });

  // Score semifinals (5 points each)
  bracket.semifinals.forEach(game => {
    const result = getResult(game.team1, game.team2, 'semifinals');
    if (result && result.winner === game.prediction) {
      totalScore += 5;
    }
  });

  // Score championship
  const championshipResult = getResult(bracket.championship.team1, bracket.championship.team2, 'championship');
  if (championshipResult && championshipResult.completed) {
    // Correct winner: 5 points
    if (championshipResult.winner === bracket.championship.prediction) {
      totalScore += 5;

      // Check for exact score match: +100 points
      if (
        championshipResult.team1Score === bracket.championship.predictedScore.team1Score &&
        championshipResult.team2Score === bracket.championship.predictedScore.team2Score
      ) {
        totalScore += 100;
      } else {
        // Check team1 score within 5 points: +25 points
        if (
          championshipResult.team1Score !== null &&
          Math.abs(championshipResult.team1Score - bracket.championship.predictedScore.team1Score) <= 5
        ) {
          totalScore += 25;
        }

        // Check team2 score within 5 points: +25 points
        if (
          championshipResult.team2Score !== null &&
          Math.abs(championshipResult.team2Score - bracket.championship.predictedScore.team2Score) <= 5
        ) {
          totalScore += 25;
        }
      }
    }
  }

  return totalScore;
}
