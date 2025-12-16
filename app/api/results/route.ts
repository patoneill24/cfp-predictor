import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { GameResult } from '@/lib/models/gameResult';
import { verifySession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();
    const resultsCollection = db.collection<GameResult>('gameResults');

    const results = await resultsCollection
      .find({})
      .sort({ gameDate: 1 })
      .toArray();

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Get results error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
