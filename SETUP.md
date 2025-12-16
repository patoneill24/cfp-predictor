# College Football Playoff Predictor - MVP

A full-stack Next.js application that allows users to create and track college football playoff bracket predictions, earn points for correct predictions, and compete on a leaderboard.

## Features

- **Email + OTP Authentication**: Passwordless authentication with one-time codes
- **Interactive Bracket Builder**: Create playoff predictions with an intuitive UI
- **Scoring System**: Earn points for correct predictions (5 pts per round, up to 155 pts for perfect championship prediction)
- **Leaderboard**: Compete with other users
- **Real-time Updates**: Automatic score calculation based on game results
- **Dashboard**: View and manage all your predictions

## Tech Stack

- **Frontend/Backend**: Next.js 16 (App Router) with React 19
- **Database**: MongoDB
- **Authentication**: JWT with email OTP
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- MongoDB instance (local or cloud)

### Installation

1. Clone the repository and install dependencies:

```bash
pnpm install
```

2. Set up environment variables:

Create a `.env.local` file in the root directory with your MongoDB connection string:

```env
CONNECTION_STRING=mongodb://localhost:27017/cfp-predictor
JWT_SECRET=your-secret-key-here
CRON_SECRET=your-cron-secret-here
```

See `.env.example` for all available environment variables.

3. Run the development server:

```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/           # Authentication endpoints
│   │   ├── predictions/    # Prediction CRUD endpoints
│   │   ├── leaderboard/    # Leaderboard endpoint
│   │   ├── results/        # Game results endpoint
│   │   └── cron/           # Background job for syncing results
│   ├── dashboard/          # User dashboard page
│   ├── create/             # Bracket creation page
│   ├── leaderboard/        # Leaderboard page
│   ├── prediction/[id]/    # Prediction detail page
│   ├── verify/             # OTP verification page
│   └── page.tsx            # Landing/login page
├── components/
│   ├── bracket.tsx         # Interactive bracket component
│   ├── matchupCard.tsx     # Matchup display component
│   └── teamButton.tsx      # Team selection button
├── lib/
│   ├── mongodb.ts          # MongoDB connection
│   ├── auth.ts             # Authentication utilities
│   ├── email.ts            # Email service
│   ├── cfbApi.ts           # College Football Data API integration
│   ├── scoring.ts          # Score calculation logic
│   └── models/             # TypeScript types/interfaces
└── middleware.ts           # Route protection middleware
```

## Key Features Explained

### Authentication Flow

1. User enters email on landing page
2. System generates 6-digit OTP (valid for 10 minutes)
3. OTP is sent via email (currently logged to console in MVP)
4. User enters OTP to verify
5. JWT session is created

### Prediction Creation

1. Users select winners round-by-round
2. Winners advance automatically to next round
3. After selecting championship winner, users predict the final score
4. Bracket is saved to database

### Scoring System

- **First Round**: 5 points per correct prediction
- **Quarterfinals**: 5 points per correct prediction
- **Semifinals**: 5 points per correct prediction
- **Championship Winner**: 5 points
- **Exact Championship Score**: +100 bonus points
- **Championship Score within 5 points**: +25 points per team

Maximum possible score: 155 points

### Background Jobs

The `/api/cron/sync-results` endpoint:
- Fetches latest game results from College Football Data API
- Updates game results in database
- Recalculates scores for all predictions
- Should be called daily via cron job (e.g., Vercel Cron Jobs)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CONNECTION_STRING` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret key for JWT tokens |
| `CRON_SECRET` | Yes | Secret to protect cron endpoints |
| `COLLEGE_FOOTBALL_API_KEY` | No | API key for collegefootballdata.com |
| `EMAIL_API_KEY` | No | Email service API key (Resend, SendGrid, etc.) |
| `EMAIL_FROM` | No | From email address |

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Send OTP for new user
- `POST /api/auth/login` - Send OTP for existing user
- `POST /api/auth/verify` - Verify OTP and create session
- `POST /api/auth/logout` - Destroy session
- `GET /api/auth/me` - Get current user info

### Predictions
- `GET /api/predictions` - Get all user's predictions
- `POST /api/predictions` - Create new prediction
- `GET /api/predictions/[id]` - Get specific prediction
- `DELETE /api/predictions/[id]` - Delete prediction

### Leaderboard
- `GET /api/leaderboard` - Get ranked predictions with pagination

### Results
- `GET /api/results` - Get all game results
- `POST /api/cron/sync-results` - Sync with external API and update scores

## Database Collections

### users
Stores user accounts with email and verification status.

### otp
Stores one-time passwords for authentication.

### predictions
Stores user bracket predictions with scores.

### gameResults
Stores actual game results for score calculation.

## Deployment

### Recommended Setup

1. **Vercel** for hosting the Next.js app
2. **MongoDB Atlas** for managed MongoDB
3. **Vercel Cron Jobs** for scheduled result syncing

### Deployment Steps

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy
5. Set up Vercel Cron Job to call `/api/cron/sync-results` daily

## TODO for Production

- [ ] Integrate real email service (Resend, SendGrid, etc.)
- [ ] Add rate limiting to auth endpoints
- [ ] Implement proper error logging (Sentry)
- [ ] Add database indexes for performance
- [ ] Implement bracket editing (before games start)
- [ ] Add push notifications for game updates
- [ ] Create admin dashboard for manual result updates
- [ ] Add user profiles and avatars
- [ ] Implement social sharing features

## Known Limitations (MVP)

- Email OTPs are logged to console instead of being sent
- No email service integration
- Basic error handling
- No rate limiting
- Championship score prediction is required but not validated against actual bracket matchup
- The bracket component needs to be enhanced to support the onSave callback properly

## Contributing

This is an MVP. Feel free to fork and enhance!

## License

MIT
