import { Resend } from 'resend';
export async function sendOTPEmail(email: string, code: string) {
  // For MVP, we'll just log to console. In production, integrate with Resend, SendGrid, etc.
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not set in environment variables');
  }
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: 'Bracket-IQ <otp@mail.bracket-iq.app>',
    to: email,
    subject: 'Your Login Code',
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Login Code</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-collapse: collapse; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color: #2563eb; padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Bracket-IQ</h1>
              <p style="margin: 8px 0 0 0; color: #bfdbfe; font-size: 14px; font-weight: 400;">Built for Fans Who Think Ahead</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 48px 40px;">
              <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: 600;">Your Login Code</h2>
              <p style="margin: 0 0 32px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">Enter the verification code below to access your account:</p>

              <!-- OTP Code Box -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 24px; background-color: #f9fafb; border-radius: 8px; border: 2px dashed #d1d5db;">
                    <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1e3a8a; font-family: 'Courier New', monospace;">${code}</div>
                  </td>
                </tr>
              </table>

              <p style="margin: 32px 0 0 0; color: #9ca3af; font-size: 14px; line-height: 1.6;">
                <strong style="color: #6b7280;">This code expires in 10 minutes.</strong><br>
                If you didn't request this code, please ignore this email.
              </p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" style="margin-top: 24px; background-color: #2563eb; color: #ffffff; padding: 12px 24px; font-size: 16px; font-weight: 600; border: none; border-radius: 8px; cursor: pointer; text-decoration: none; display: inline-block;">
                Log In to Bracket-IQ
              </a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5; text-align: center;">
                © ${new Date().getFullYear()} Bracket-IQ. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
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
    to: email,
    subject: 'Welcome to Bracket-IQ!',
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Bracket-IQ</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-collapse: collapse; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color: #2563eb; padding: 48px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 36px; font-weight: 700; letter-spacing: -0.5px;">Welcome to Bracket-IQ!</h1>
              <p style="margin: 12px 0 0 0; color: #bfdbfe; font-size: 16px; font-weight: 400;">Built for Fans Who Think Ahead</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 48px 40px;">
              <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: 600;">Thanks for Joining Us!</h2>
              <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                We're excited to have you on board. Bracket-IQ is your ultimate tool for making informed CFB playoff predictions and staying ahead of the competition.
              </p>

              <!-- Feature Highlights -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 32px 0;">
                <tr>
                  <td style="padding: 20px; background-color: #f0f9ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
                    <h3 style="margin: 0 0 8px 0; color: #1e3a8a; font-size: 18px; font-weight: 600;">🎯 Smart Predictions</h3>
                    <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                      Show off your Football IQ by giving your best playoff predictions using our intuitive platform.
                    </p>
                  </td>
                </tr>
                <tr><td style="height: 16px;"></td></tr>
                <tr>
                  <td style="padding: 20px; background-color: #f0fdf4; border-radius: 8px; border-left: 4px solid #10b981;">
                    <h3 style="margin: 0 0 8px 0; color: #065f46; font-size: 18px; font-weight: 600;">📊 Live Updates</h3>
                    <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                      Stay up to date with latest playoff scores and compare your predictions in real-time.
                    </p>
                  </td>
                </tr>
                <tr><td style="height: 16px;"></td></tr>
                <tr>
                  <td style="padding: 20px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                    <h3 style="margin: 0 0 8px 0; color: #92400e; font-size: 18px; font-weight: 600;">🏆 Track Your Success</h3>
                    <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                      Monitor your prediction accuracy and compete with other fans on our global leaderboard.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 32px 0 0 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                Ready to get started? Log in to your account and make your first prediction!
              </p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" style="margin-top: 24px; background-color: #2563eb; color: #ffffff; padding: 12px 24px; font-size: 16px; font-weight: 600; border: none; border-radius: 8px; cursor: pointer; text-decoration: none; display: inline-block;">
                Log In to Bracket-IQ
              </a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px; line-height: 1.5; text-align: center;">
                Questions? We're here to help.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5; text-align: center;">
                © ${new Date().getFullYear()} Bracket-IQ. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    scheduledAt: fiveMinutesFromNow,
  });
  return true;
}


export async function sendScoreUpdateEmail(email: string, predictionName: string, newScore: number) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not set in environment variables');
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  // send the email 9 hours from now (the cron job runs at 1 am (MST), so the email will arrive at 10 am)
  const nineHoursFromNow = new Date(Date.now() + 1000 * 60 * 60 * 9).toISOString();

  await resend.emails.send({
    from: 'Bracket-IQ <update@mail.bracket-iq.app>',
    to: email,
    subject: `(Fixed Link) Your Prediction "${predictionName}" Score Updated!`,
    html: `
      <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Bracket-IQ</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-collapse: collapse; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color: #2563eb; padding: 48px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 36px; font-weight: 700; letter-spacing: -0.5px;">Bracket-IQ</h1>
              <p style="margin: 12px 0 0 0; color: #bfdbfe; font-size: 16px; font-weight: 400;">Built for Fans Who Think Ahead</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 48px 40px;">
              <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: 600;">You're on the Board!</h2>
              <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                Great news! Your College Football Playoff prediction "<strong>${predictionName}</strong>" has a score of <strong>${newScore} points</strong>.
              </p>
              <p style="margin: 32px 0 0 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                Check out how your prediction compares to other fans and keep climbing the leaderboard!
              </p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" style="margin-top: 24px; background-color: #2563eb; color: #ffffff; padding: 12px 24px; font-size: 16px; font-weight: 600; border: none; border-radius: 8px; cursor: pointer; text-decoration: none; display: inline-block;">
                View My Prediction
              </a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px; line-height: 1.5; text-align: center;">
                Questions? We're here to help.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5; text-align: center;">
                © ${new Date().getFullYear()} Bracket-IQ. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  scheduledAt: nineHoursFromNow,
  });

  return true;
}