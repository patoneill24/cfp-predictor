import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Prediction } from '@/lib/models/prediction';
import { verifySession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const db = await getDatabase();
    const predictionsCollection = db.collection<Prediction>('predictions');

    // Get all predictions sorted by score
    const predictions = await predictionsCollection
      .find({})
      .sort({ score: -1, createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await predictionsCollection.countDocuments({});

    // Add rank to each prediction
    const leaderboard = predictions.map((pred, index) => ({
      ...pred,
      rank: skip + index + 1,
      isCurrentUser: pred.userId.toString() === session.userId,
    }));

    return NextResponse.json({
      leaderboard,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
