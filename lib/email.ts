import { Resend } from 'resend';
export async function sendOTPEmail(email: string, code: string) {
  // For MVP, we'll just log to console. In production, integrate with Resend, SendGrid, etc.
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not set in environment variables');
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  console.log(`\n=== OTP EMAIL ===`);
  console.log(`To: ${email}`);
  console.log(`Code: ${code}`);
  console.log(`Expires: 10 minutes`);
  console.log(`=================\n`);

  await resend.emails.send({
    from: 'Bracket-IQ <otp@mail.bracket-iq.app>',
    to: ['delivered@resend.dev','bounced@resend.dev','complained@resend.dev'],
    subject: 'Your Login Code',
    html: `<p>Your verification code is: <strong>${code}</strong></p><p>This code expires in 10 minutes.</p>`,
  });

  return true;
}

export async function sendWelcomeEmail(email: string) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not set in environment variables');
  }
  const resend = new Resend(process.env.RESEND_API_KEY);

  // Schedule email to be sent 5 minutes from now

  const fiveMinutesFromNow = new Date(Date.now() + 1000 * 60 * 5).toISOString();
  await resend.emails.send({
    from: 'Bracket-IQ <welcome@mail.bracket-iq.app>',
    to: ['delivered@resend.dev','bounced@resend.dev','complained@resend.dev'],
    subject: 'Welcome to CFB Playoff Predictions!',
    html: '<p>Thank you for signing up for CFB Playoff Predictions! We are excited to have you on board.</p>',
    scheduledAt: fiveMinutesFromNow,
  });
  console.log(`\n=== WELCOME EMAIL ===`);
  console.log(`To: ${email}`);
  console.log(`Subject: Welcome to CFB Playoff Predictions!`);
  console.log(`=====================\n`);
  return true;
}
