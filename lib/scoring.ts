import { Bracket } from './models/prediction';
import { BasketballGameResult, GameResult } from './models/gameResult';

export function calculateScore(bracket: Bracket, results: GameResult[]): number {
  let totalScore = 0;

  // Create a map using string key for quick lookup
  // Key format: "team1|team2|round"
  const resultsMap = new Map<string, GameResult>();
  results.forEach(result => {
    if (result.completed && result.winner) {
      let key = '';
      if (result.round === 'firstRound') {
        key = `${result.team1.trim()}|${result.team2.trim()}|${result.round}`;
      } else {
        key = `${result.title}|${result.round}`;
      }
      resultsMap.set(key, result);
    }
  });

  const getResult = (team1: string, team2: string, round: string, title?: string): GameResult | undefined => {
    // Try both team orderings (only if round is not based on title)
    if (title) {
      const keyTitle = `${title}|${round}`;
      return resultsMap.get(keyTitle);
    }
    const key1 = `${team1.trim()}|${team2.trim()}|${round}`;
    const key2 = `${team2.trim()}|${team1.trim()}|${round}`;
    return resultsMap.get(key1) || resultsMap.get(key2);
  };

  // Score first round (5 points each)
  bracket.firstRound.forEach(game => {
    const result = getResult(game.team1, game.team2, 'firstRound');
    if (result && result.winner?.trim() === game.prediction?.trim()) {
      totalScore += 5;
    }
  });

  // Score quarterfinals (5 points each)
  bracket.quarterfinals.forEach(game => {
    const result = getResult(game.team1, game.team2, 'quarterfinals', game.title);
    if (result && result.winner === game.prediction) {
      totalScore += 5;
    }
  });

  // Score semifinals (5 points each)
  bracket.semifinals.forEach(game => {
    const result = getResult(game.team1, game.team2, 'semifinals', game.title);
    if (result && result.winner === game.prediction) {
      totalScore += 5;
    }
  });

  const championshipResult = getResult(
    bracket.championship.team1,
    bracket.championship.team2,
    'championship',
    bracket.championship.title ?? 'National Championship'
  );
  if (championshipResult && championshipResult.completed) {
    if (championshipResult.winner === bracket.championship.prediction) {
      totalScore += 5;

      if (
        championshipResult.team1Score === bracket.championship.predictedScore.team1Score &&
        championshipResult.team2Score === bracket.championship.predictedScore.team2Score
      ) {
        totalScore += 100;
      } else {
        if (
          championshipResult.team1Score !== null &&
          Math.abs(championshipResult.team1Score - bracket.championship.predictedScore.team1Score) <= 5
        ) {
          totalScore += 25;
        }

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

export function calculateBasketballScore(bracket: Bracket, results: BasketballGameResult[]): number {
  let totalScore = 0;
  const resultsMap = new Map<string, BasketballGameResult>();
  results.forEach(result => {
    if (result.completed && result.winner) {
      let key = '';
      if (result.round === 'Sweet 16') {
        key = `${result.team1.trim()}|${result.team2.trim()}|${result.round}`;
      } else {
        key = `${result.title}|${result.round}`;
      }
      resultsMap.set(key, result);
    }
  });

  const getBasketballResult = (
    team1: string,
    team2: string,
    round: string,
    title?: string
  ): BasketballGameResult | undefined => {
    if (title) {
      const keyTitle = `${title}|${round}`;
      return resultsMap.get(keyTitle);
    }
    const key1 = `${team1.trim()}|${team2.trim()}|${round}`;
    const key2 = `${team2.trim()}|${team1.trim()}|${round}`;
    return resultsMap.get(key1) || resultsMap.get(key2);
  };

  // Score Sweet 16 (5 points each)
  bracket.firstRound.forEach(game => {
    const result = getBasketballResult(game.team1, game.team2, 'Sweet 16');
    if (result && result.winner?.trim() === game.prediction?.trim()) {
      totalScore += 5;
    }
  });

  // Score Elite Eight (5 points each)
  bracket.quarterfinals.forEach(game => {
    const result = getBasketballResult(game.team1, game.team2, 'Elite Eight', game.title);
    if (result && result.winner?.trim() === game.prediction?.trim()) {
      totalScore += 5;
    }
  });

  // Score Final Four (5 points each)
  bracket.semifinals.forEach(game => {
    const result = getBasketballResult(game.team1, game.team2, 'Final Four', game.title);
    if (result && result.winner?.trim() === game.prediction?.trim()) {
      totalScore += 5;
    }
  });

  const championshipResult = getBasketballResult(
    bracket.championship.team1,
    bracket.championship.team2,
    'Championship',
    bracket.championship.title ?? 'NCAA Championship'
  );
  if (championshipResult && championshipResult.completed) {
    if (championshipResult.winner === bracket.championship.prediction) {
      totalScore += 5;

      if (
        championshipResult.team1Score === bracket.championship.predictedScore.team1Score &&
        championshipResult.team2Score === bracket.championship.predictedScore.team2Score
      ) {
        totalScore += 100;
      } else {
        if (
          championshipResult.team1Score !== null &&
          Math.abs(championshipResult.team1Score - bracket.championship.predictedScore.team1Score) <= 5
        ) {
          totalScore += 25;
        }

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
