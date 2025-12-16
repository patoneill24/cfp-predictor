import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Prediction } from '@/lib/models/prediction';
import { verifySession } from '@/lib/auth';
import { ObjectId } from 'mongodb';

// GET a specific prediction
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid prediction ID' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const predictionsCollection = db.collection<Prediction>('predictions');

    const prediction = await predictionsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!prediction) {
      return NextResponse.json(
        { error: 'Prediction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ prediction });
  } catch (error) {
    console.error('Get prediction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE a prediction
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid prediction ID' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const predictionsCollection = db.collection<Prediction>('predictions');

    const result = await predictionsCollection.deleteOne({
      _id: new ObjectId(id),
      userId: new ObjectId(session.userId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Prediction not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete prediction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
