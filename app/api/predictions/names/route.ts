import { verifySession } from "@/lib/auth";
import { Prediction } from "@/lib/models/prediction";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

// Get Prediction Names
export async function GET(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();
    const predictionsCollection = db.collection<Prediction>('predictions');

    const predictions = await predictionsCollection
      .find({})
      .project({ name: 1 }) // Only fetch the name field
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