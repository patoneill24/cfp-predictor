import { verifySession } from "@/lib/auth";
import { Prediction } from "@/lib/models/prediction";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

// Get Prediction Names
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
      .project({ name: 1 })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ predictions });
  } catch (error) {
    console.error('Get prediction names error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}