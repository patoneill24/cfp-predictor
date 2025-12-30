import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { GameResult, GameRound } from '@/lib/models/gameResult';
import { Prediction } from '@/lib/models/prediction';
import { fetchPlayoffGames, mapCFBGameToResult } from '@/lib/cfbApi';
import { calculateScore } from '@/lib/scoring';
import { addGameTitles } from '@/lib/add-game-titles';

export const quarterfinalTitles = [
  'Orange Bowl',
  'Rose Bowl',
  'Sugar Bowl',
  'Cotton Bowl',
];

export const semifinalTitles = [
  'Peach Bowl',
  'Fiesta Bowl',
];

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();
    const resultsCollection = db.collection<GameResult>('gameResults');
    const predictionsCollection = db.collection<Prediction>('predictions');

    // // Fetch current year playoff games
    const currentYear = new Date().getFullYear();
    const games = await fetchPlayoffGames(currentYear);

    console.log(`Fetched ${games.length} playoff games from CFB API`);

    // Update or insert game results
    let updatedCount = 0;
    for (const game of games) {
      let round: GameRound = 'firstRound';
      switch(true) {
        case quarterfinalTitles.some(title => game.notes?.includes(title)):
          round = 'quarterfinals';
          break;
        case semifinalTitles.some(title => game.notes?.includes(title)):
          round = 'semifinals';
          break;
        case game.notes?.includes('Championship'):
          round = 'championship';
          break;
        default:
          round = 'firstRound';
      }

      const gameResult = await mapCFBGameToResult(game, round);

      await resultsCollection.updateOne(
        { gameId: gameResult.gameId },
        { $set: gameResult },
        { upsert: true }
      );
      updatedCount++;
    }

    console.log(`Updated ${updatedCount} game results`);

    // Recalculate scores for all predictions
    const allResults = await resultsCollection.find({}).toArray();
    const predictions = await predictionsCollection.find({}).toArray();

    let scoresUpdated = 0;
    for (const prediction of predictions) {
      const newScore = calculateScore(prediction.bracket,allResults);

      // one time update to add titles to games in brackets, can be removed later
      const updatedPrediction = addGameTitles(prediction);

      await predictionsCollection.updateOne(
        { _id: prediction._id },
        { $set: { bracket: updatedPrediction.bracket } }
      );

      if (newScore !== prediction.score) {
        await predictionsCollection.updateOne(
          { _id: prediction._id },
          {
            $set: {
              score: newScore,
              updatedAt: new Date(),
            },
          }
        );
        scoresUpdated++;
      }
    }

    console.log(`Updated ${scoresUpdated} prediction scores`);

    return NextResponse.json({
      success: true,
      scoresUpdated,
    });
  } catch (error) {
    console.error('Sync results error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

// Also allow GET for manual testing
export async function GET(request: NextRequest) {
  return POST(request);
}
