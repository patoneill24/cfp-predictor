import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { BasketballGameResult, GameResult } from '@/lib/models/gameResult';
import { verifySession } from '@/lib/auth';
import { Sport } from '@/app/dashboard/page';

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const sport = searchParams.get('sport') as Sport;

    const db = await getDatabase();
    const resultsCollection = db.collection<GameResult | BasketballGameResult>(sport === 'cbb' ? 'basketballResults' : 'gameResults');

    // football does not have a sport field, so we need to filter for the sport
    const filter = sport === 'cbb' ? { sport: 'cbb' as const } : { sport: { $ne: 'cbb' as const } };
    const results = await resultsCollection
      .find(filter)
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
