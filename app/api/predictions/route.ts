import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Prediction } from '@/lib/models/prediction';
import { verifySession } from '@/lib/auth';
import { ObjectId } from 'mongodb';

// GET all predictions for the current user
export async function GET() {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();
    const predictionsCollection = db.collection<Prediction>('predictions');

    const predictions = await predictionsCollection
      .find({ userId: new ObjectId(session.userId) })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ predictions });
  } catch (error) {
    console.error('Get predictions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create a new prediction
export async function POST(request: NextRequest) {
  return NextResponse.json({ error: 'Playoffs have started, creating new predictions is disabled.' }, { status: 503 });
  // try {
  //   return NextResponse.json({ error: 'Playoffs have started, creating new predictions is disabled.' }, { status: 503 });
  //   const session = await verifySession();
  //   if (!session) {
  //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  //   }

  //   const { bracket, name } = await request.json();

  //   if (!bracket) {
  //     return NextResponse.json(
  //       { error: 'Bracket data is required' },
  //       { status: 400 }
  //     );
  //   }

  //   if (!name || typeof name !== 'string' || !name.trim()) {
  //     return NextResponse.json(
  //       { error: 'Prediction name is required' },
  //       { status: 400 }
  //     );
  //   }

  //   // Validate bracket structure
  //   if (
  //     !bracket.firstRound ||
  //     !bracket.quarterfinals ||
  //     !bracket.semifinals ||
  //     !bracket.championship
  //   ) {
  //     return NextResponse.json(
  //       { error: 'Invalid bracket structure' },
  //       { status: 400 }
  //     );
  //   }

  //   const db = await getDatabase();
  //   const predictionsCollection = db.collection<Prediction>('predictions');

  //   const prediction: Prediction = {
  //     userId: new ObjectId(session.userId),
  //     userName: session.email,
  //     name: name.trim(),
  //     bracket,
  //     score: 0,
  //     createdAt: new Date(),
  //     updatedAt: new Date(),
  //   };

  //   const result = await predictionsCollection.insertOne(prediction);

  //   return NextResponse.json({
  //     success: true,
  //     predictionId: result.insertedId.toString(),
  //   });
  // } catch (error) {
  //   console.error('Create prediction error:', error);
  //   return NextResponse.json(
  //     { error: 'Internal server error' },
  //     { status: 500 }
  //   );
  // }
}
