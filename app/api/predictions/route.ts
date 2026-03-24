import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Prediction } from '@/lib/models/prediction';
import { verifySession } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import { isStoredCbbBracket } from '@/lib/basketball-bracket-storage';
import { Sport } from '@/app/dashboard/page';

// GET all predictions for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();
    const predictionsCollection = db.collection<Prediction>('predictions');

    const { searchParams } = new URL(request.url);
    const sport = searchParams.get('sport') as Sport;
    const filter = sport === 'cbb' ? { sport: 'cbb' as const } : { sport: { $ne: 'cbb' as const } };
    const predictions = await predictionsCollection
      .find({ userId: new ObjectId(session.userId), ...filter })
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

function isCfbBracketShape(bracket: unknown): bracket is Prediction['bracket'] {
  if (!bracket || typeof bracket !== 'object') return false;
  const b = bracket as Prediction['bracket'];
  return (
    Array.isArray(b.firstRound) &&
    b.firstRound.length === 4 &&
    Array.isArray(b.quarterfinals) &&
    b.quarterfinals.length === 4 &&
    Array.isArray(b.semifinals) &&
    b.semifinals.length === 2 &&
    !!b.championship
  );
}

// POST create a new prediction
export async function POST(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { bracket, name, sport: sportRaw } = body as {
      bracket?: unknown;
      name?: string;
      sport?: string;
    };

    const sport = sportRaw === 'cbb' ? 'cbb' : 'cfb';

    if (!bracket) {
      return NextResponse.json({ error: 'Bracket data is required' }, { status: 400 });
    }

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Prediction name is required' }, { status: 400 });
    }

    if (sport === 'cfb') {
      return NextResponse.json(
        { error: 'Playoffs have started, creating new predictions is disabled.' },
        { status: 503 }
      );
    }

    if (sport === 'cbb') {
      if (!isStoredCbbBracket(bracket as Prediction['bracket'])) {
        return NextResponse.json({ error: 'Invalid March Madness bracket structure' }, { status: 400 });
      }
    } else if (!isCfbBracketShape(bracket)) {
      return NextResponse.json({ error: 'Invalid bracket structure' }, { status: 400 });
    }

    const db = await getDatabase();
    const predictionsCollection = db.collection<Prediction>('predictions');

    const dup = await predictionsCollection.findOne({
      userId: new ObjectId(session.userId),
      sport,
      name: { $regex: new RegExp(`^${name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    });
    if (dup) {
      return NextResponse.json(
        { error: 'You already have a prediction with that name for this sport.' },
        { status: 400 }
      );
    }

    const count = await predictionsCollection.countDocuments({
      userId: new ObjectId(session.userId),
      sport,
    });
    if (count >= 5) {
      return NextResponse.json(
        { error: 'You have reached the maximum of 5 predictions for this sport.' },
        { status: 400 }
      );
    }

    const prediction: Prediction = {
      userId: new ObjectId(session.userId),
      userName: session.email,
      name: name.trim(),
      sport,
      bracket: bracket as Prediction['bracket'],
      score: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await predictionsCollection.insertOne(prediction);

    return NextResponse.json({
      success: true,
      predictionId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error('Create prediction error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
