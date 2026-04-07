import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { BasketballGameResult, BasketballGameRound} from '@/lib/models/gameResult';
import { Prediction } from '@/lib/models/prediction';
import { calculateBasketballScore } from '@/lib/scoring';
import { sendScoreUpdateEmail } from '@/lib/email';
import { fetchBasketballPlayoffGames, mapCBBGameToResult } from '@/lib/cbbApi';

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();
    const basketballResultsCollection = db.collection<BasketballGameResult>('basketballResults');
    const predictionsCollection = db.collection<Prediction>('predictions');

    // Fetch 2025 playoff games from CFB API
    const games = await fetchBasketballPlayoffGames();

    console.log(`Fetched ${games.length} playoff games from CFB API`);

    // Update or insert game results
    let updatedCount = 0;
    for (const game of games) {
      const notes = game.gameNotes;
      let round: BasketballGameRound;
      if (notes?.includes('Sweet 16')) {
        round = 'Sweet 16';
      } else if (notes?.includes('Elite 8')) {
        round = 'Elite Eight';
      } else if (notes?.includes('Final Four')) {
        round = 'Final Four';
      } else if (notes?.includes('Championship')) {
        round = 'Championship';
      } else {
        throw new Error(`Unknown round: ${notes}`);
      }

      const gameResult = await mapCBBGameToResult(game, round as BasketballGameRound);

      await basketballResultsCollection.updateOne(
        { gameId: gameResult.gameId },
        { $set: gameResult },
        { upsert: true }
      );
      updatedCount++;
    }

    console.log(`Updated ${updatedCount} game results`);

    // Recalculate scores for all predictions
    const allResults = await basketballResultsCollection.find({}).toArray();
    const predictions = await predictionsCollection
      .find({ sport: 'cbb' })
      .toArray();

    const predictionsSorted = predictions.sort((a, b) => b.score - a.score);

    const rankings = predictionsSorted.map((pred, index) => ({
      rank: index + 1,
      ...pred,
    }));

    let scoresUpdated = 0;
    for (const prediction of rankings) {
      const newScore = calculateBasketballScore(prediction.bracket, allResults);
    
      if (newScore !== prediction.score) {
        // Send email notification about score update
        try {
          await predictionsCollection.updateOne(
                { _id: prediction._id },
                {
                  $set: {
                    score: newScore,
                    updatedAt: new Date(),
                  },
                }
              );
          await sendScoreUpdateEmail(
            prediction.userName,
            prediction.name,
            newScore,
          );
            // Add delay between emails to avoid Resend rate limits (2 emails/sec on free tier)
            await new Promise(resolve => setTimeout(resolve, 600));
        } catch (error) {
          console.error(`Error updating prediction score and sending score update email to ${prediction.userName}:`, error);
        }
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