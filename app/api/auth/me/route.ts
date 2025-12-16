import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { User } from '@/lib/models/user';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const usersCollection = db.collection<User>('users');

    const user = await usersCollection.findOne({
      _id: new ObjectId(session.userId),
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user._id!.toString(),
        email: user.email,
        verified: user.verified,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
