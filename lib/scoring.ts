import { Bracket } from './models/prediction';
import { GameResult } from './models/gameResult';

export function calculateScore(bracket: Bracket, results: GameResult[]): number {
  let totalScore = 0;

  // Create a map of gameId to result for quick lookup
  const resultsMap = new Map<string, GameResult>();
  results.forEach(result => {
    if (result.completed && result.winner) {
      resultsMap.set(result.gameId, result);
    }
  });

  // Score first round (5 points each)
  bracket.firstRound.forEach(game => {
    const result = resultsMap.get(game.gameId);
    if (result && result.winner === game.prediction) {
      totalScore += 5;
    }
  });

  // Score quarterfinals (5 points each)
  bracket.quarterfinals.forEach(game => {
    const result = resultsMap.get(game.gameId);
    if (result && result.winner === game.prediction) {
      totalScore += 5;
    }
  });

  // Score semifinals (5 points each)
  bracket.semifinals.forEach(game => {
    const result = resultsMap.get(game.gameId);
    if (result && result.winner === game.prediction) {
      totalScore += 5;
    }
  });

  // Score championship
  const championshipResult = resultsMap.get(bracket.championship.gameId);
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
