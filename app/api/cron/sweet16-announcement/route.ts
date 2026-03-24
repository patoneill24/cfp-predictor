import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { User } from '@/lib/models/user';
import { sendSweet16AnnouncementEmail } from '@/lib/email';

function verifyCron(request: NextRequest): NextResponse | null {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function POST(request: NextRequest) {
  const unauthorized = verifyCron(request);
  if (unauthorized) return unauthorized;

  try {
    const db = await getDatabase();
    const usersCollection = db.collection<User>('users');
    const users = await usersCollection.find({ verified: true }).toArray();

    let sent = 0;
    const errors: { email: string; message: string }[] = [];

    for (const user of users) {
      try {
        await sendSweet16AnnouncementEmail(user.email);
        sent++;
        await new Promise((resolve) => setTimeout(resolve, 600));
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`Sweet 16 announcement failed for ${user.email}:`, err);
        errors.push({ email: user.email, message });
      }
    }

    return NextResponse.json({
      success: true,
      recipientCount: users.length,
      sent,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Sweet 16 announcement cron error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
