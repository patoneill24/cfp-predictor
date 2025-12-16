import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { User, OTP } from '@/lib/models/user';
import { generateOTP } from '@/lib/auth';
import { sendOTPEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const usersCollection = db.collection<User>('users');
    const otpCollection = db.collection<OTP>('otp');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser && existingUser.verified) {
      return NextResponse.json(
        { error: 'User already exists. Please login instead.' },
        { status: 400 }
      );
    }

    // Generate OTP
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP
    await otpCollection.insertOne({
      email,
      code,
      expiresAt,
      used: false,
      createdAt: new Date(),
    });

    // Send OTP email
    await sendOTPEmail(email, code);

    // If user doesn't exist, create unverified user
    if (!existingUser) {
      await usersCollection.insertOne({
        email,
        verified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent to your email',
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
