import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { User, OTP } from '@/lib/models/user';
import { createSession } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const usersCollection = db.collection<User>('users');
    const otpCollection = db.collection<OTP>('otp');

    // Find valid OTP
    const otpRecord = await otpCollection.findOne({
      email,
      code,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    // Mark OTP as used
    await otpCollection.updateOne(
      { _id: otpRecord._id },
      { $set: { used: true } }
    );

    // Get or update user
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // If user is not verified, verify them and send welcome email
    let isNewUser = false;
    if (!user.verified) {
      await usersCollection.updateOne(
        { email },
        {
          $set: {
            verified: true,
            updatedAt: new Date(),
          },
        }
      );
      await sendWelcomeEmail(email);
      isNewUser = true;
    }

    // Create session
    await createSession(user._id!.toString(), email);

    return NextResponse.json({
      success: true,
      message: 'Verification successful',
      isNewUser,
      user: {
        id: user._id!.toString(),
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
