# College Football Playoff Prediction Application - Requirements

## Project Overview
A Full Stack Next.js application with MongoDB that allows users to create and track college football playoff bracket predictions, earn points for correct predictions, and compete on a leaderboard.

## Tech Stack
- **Frontend/Backend**: Next.js (App Router)
- **Database**: MongoDB
- **Authentication**: Email + OTP (One-Time Password)
- **Email Service**: SendGrid, Resend, or similar
- **External API**: College Football Data API (https://api.collegefootballdata.com/)
- **Styling**: Tailwind CSS (recommended)
- **Type Safety**: TypeScript

## Core Features

### 1. User Authentication

#### Sign Up Flow
- Users register with email only (no password)
- Generate 6-digit OTP and send via email
- OTP expires after 10 minutes
- Store unverified user temporarily until OTP confirmation
- Upon successful OTP verification:
  - Mark user as verified
  - Send welcome email
  - Create user session
  - Redirect to dashboard

#### Sign In Flow
- Users enter email
- Generate and send new OTP
- Verify OTP to authenticate
- Create session and redirect to dashboard

#### Session Management
- Use Next.js middleware for protected routes
- Session storage using JWT or similar
- Auto-logout after inactivity (optional enhancement)

### 2. Database Schema

#### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  verified: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

#### OTP Collection
```javascript
{
  _id: ObjectId,
  email: String (required),
  code: String (required, 6 digits),
  expiresAt: Date (required),
  used: Boolean (default: false),
  createdAt: Date
}
```

#### Predictions Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: Users),
  userName: String (user's email for display),
  createdAt: Date,
  updatedAt: Date,
  bracket: {
    firstRound: [
      {
        gameId: String,
        team1: String,
        team2: String,
        prediction: String (winner)
      }
    ],
    quarterfinals: [...],
    semifinals: [...],
    championship: {
      gameId: String,
      team1: String,
      team2: String,
      prediction: String (winner),
      predictedScore: {
        team1Score: Number,
        team2Score: Number
      }
    }
  },
  score: Number (default: 0)
}
```

#### GameResults Collection
```javascript
{
  _id: ObjectId,
  gameId: String (unique),
  round: String (firstRound, quarterfinals, semifinals, championship),
  team1: String,
  team2: String,
  team1Score: Number,
  team2Score: Number,
  winner: String,
  completed: Boolean,
  gameDate: Date,
  lastUpdated: Date
}
```

### 3. Pages & Routes

#### `/` - Landing/Login Page
- Email input form
- "Send OTP" button
- Information about the application
- Public route

#### `/verify` - OTP Verification Page
- OTP input (6 digits)
- Resend OTP option
- Auto-submit on 6 digits entered
- Public route

#### `/dashboard` - User Dashboard (Protected)
- Grid/list of user's prediction tiles
- Each tile shows:
  - Prediction name/ID
  - Current score
  - Championship winner team logo
  - Created date
  - "View Details" button
- "Create New Prediction" button (prominent CTA)
- Display user's email in header
- Logout button

#### `/create` - Create Prediction Page (Protected)
- Interactive bracket builder
- Round-by-round selection interface
- Team logos and names
- Visual bracket tree structure
- Submit button disabled until championship winner selected
- On championship winner selection:
  - Modal appears
  - Shows selected championship winner
  - Input fields for final score prediction (both teams)
  - Confirm & Save button

#### `/leaderboard` - Leaderboard Page (Protected)
- Sortable table with columns:
  - Rank
  - User (email/username)
  - Prediction ID
  - Score
  - Championship Pick
  - Created Date
- Current user's predictions highlighted (different background color)
- Pagination for large datasets
- Real-time score updates

#### `/prediction/[id]` - View Prediction Details (Protected)
- View full bracket for any prediction
- Show predicted winners for each round
- Show actual results (if available)
- Indicate correct/incorrect predictions
- Display score breakdown
- Read-only for other users' predictions
- Edit capability for own predictions (optional enhancement)

### 4. Scoring System

#### Point Distribution
- **Correct First Round Prediction**: 5 points
- **Correct Quarterfinal Prediction**: 5 points
- **Correct Semifinal Prediction**: 5 points
- **Correct Championship Winner**: 5 points
- **Exact Championship Score**: +100 bonus points
- **Championship Score within 5 points (each team)**: +25 bonus points

#### Score Calculation Logic
```
1. Compare each game prediction with actual results
2. Award 5 points for each correct winner prediction
3. For championship game:
   a. If winner correct: +5 points
   b. If exact score match: +100 points
   c. If team1 score within 5 points: +25 points
   d. If team2 score within 5 points: +25 points
   e. Maximum championship game points: 155 (5 + 100 + 25 + 25)
```

### 5. Background Jobs & Data Sync

#### Nightly Cron Job
- Schedule: Run daily at 2:00 AM EST
- Endpoint: `/api/cron/sync-results`
- Functionality:
  1. Fetch latest game results from College Football Data API
  2. Update GameResults collection with new/updated results
  3. Trigger score recalculation for all predictions
  4. Log sync results and any errors

#### Score Recalculation
- Triggered after game results update
- Process:
  1. Fetch all predictions from database
  2. For each prediction:
     - Compare bracket predictions with actual results
     - Calculate new score
     - Update prediction document with new score
  3. Update lastUpdated timestamp

#### API Integration
- Use College Football Data API (https://api.collegefootballdata.com/)
- Required endpoints:
  - `/games` - Get playoff game schedules
  - `/games/teams` - Get game results by team
- Store API key in environment variables
- Implement error handling and retry logic
- Rate limiting awareness

### 6. Email Functionality

#### Email Types
1. **OTP Email**
   - Subject: "Your Login Code"
   - Content: 6-digit code, expiration time
   - Clear call-to-action

2. **Welcome Email**
   - Subject: "Welcome to CFB Playoff Predictions!"
   - Content: App overview, getting started guide
   - Link to create first prediction

#### Email Service Setup
- Use Resend, SendGrid, or AWS SES
- Store API keys in environment variables
- Email templates in `/emails` directory
- HTML and plain text versions

### 7. API Routes

#### Authentication
- `POST /api/auth/signup` - Send OTP for new user
- `POST /api/auth/verify` - Verify OTP and create session
- `POST /api/auth/login` - Send OTP for existing user
- `POST /api/auth/logout` - Destroy session
- `GET /api/auth/me` - Get current user info

#### Predictions
- `GET /api/predictions` - Get all user's predictions
- `POST /api/predictions` - Create new prediction
- `GET /api/predictions/[id]` - Get specific prediction
- `PUT /api/predictions/[id]` - Update prediction (before games start)
- `DELETE /api/predictions/[id]` - Delete prediction

#### Leaderboard
- `GET /api/leaderboard` - Get ranked predictions with pagination

#### Game Results
- `GET /api/results` - Get all game results
- `POST /api/cron/sync-results` - Sync with external API (protected by cron secret)

### 8. Environment Variables

```
# Database
MONGODB_URI=mongodb://...

# Authentication
JWT_SECRET=...
SESSION_SECRET=...

# Email Service
EMAIL_API_KEY=...
EMAIL_FROM=noreply@yourdomain.com

# External API
COLLEGE_FOOTBALL_API_KEY=...
COLLEGE_FOOTBALL_API_URL=https://api.collegefootballdata.com

# Cron Job
CRON_SECRET=... (for protecting cron endpoints)

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 9. UI/UX Requirements

#### Design Principles
- Clean, modern interface
- Mobile-responsive (all pages)
- College football themed colors
- Fast loading times
- Intuitive navigation

#### Components to Build
- `BracketBuilder` - Interactive bracket creation
- `PredictionTile` - Dashboard preview card
- `LeaderboardTable` - Sortable table with highlighting
- `TeamLogo` - Display team logos
- `ScoreDisplay` - Visual score representation
- `AuthGuard` - Protected route wrapper
- `Modal` - Championship confirmation modal
- `OTPInput` - 6-digit code input with auto-focus

#### Accessibility
- ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader friendly
- Color contrast compliance (WCAG AA)

### 10. Security Considerations

- Validate all user inputs (client and server)
- Sanitize data before database insertion
- Rate limiting on authentication endpoints
- CSRF protection
- XSS prevention
- SQL/NoSQL injection prevention
- Secure session management
- Environment variable protection
- API route authentication checks

### 11. Testing Strategy (Optional but Recommended)

- Unit tests for utility functions (scoring logic)
- Integration tests for API routes
- E2E tests for critical user flows (sign up, create prediction)
- Test OTP generation and validation
- Test score calculation accuracy

### 12. Deployment Considerations

#### Recommended Platform
- Vercel (optimal for Next.js)
- MongoDB Atlas (managed MongoDB)

#### Cron Job Setup
- Vercel Cron Jobs
- Alternative: External service like GitHub Actions or Render Cron

#### Pre-Deployment Checklist
- [ ] Environment variables configured
- [ ] Database indexes created (email, gameId, userId)
- [ ] Email service tested
- [ ] API rate limits understood
- [ ] Error logging setup (Sentry or similar)
- [ ] Cron job tested
- [ ] Mobile responsiveness verified

### 13. Future Enhancements (Phase 2)

- User profiles with avatars
- Bracket sharing via unique links
- Social features (comments, likes)
- Multiple bracket templates (by conference)
- Push notifications for game updates
- Historical data and statistics
- Admin dashboard for managing results
- Custom scoring rules
- Group competitions/pools

## Development Workflow

### Phase 1: Foundation (Week 1)
1. Setup Next.js project with TypeScript
2. Configure MongoDB connection
3. Implement authentication system
4. Build email functionality
5. Create basic UI layout

### Phase 2: Core Features (Week 2)
1. Build bracket creation interface
2. Implement prediction storage
3. Create dashboard and leaderboard
4. Add viewing other predictions

### Phase 3: Integration (Week 3)
1. Integrate College Football Data API
2. Build scoring calculation logic
3. Implement cron job for data sync
4. Test score updates

### Phase 4: Polish (Week 4)
1. UI/UX improvements
2. Mobile optimization
3. Performance optimization
4. Bug fixes and testing
5. Deployment

## Success Criteria

- [ ] Users can sign up and authenticate via OTP
- [ ] Users can create unlimited predictions
- [ ] Bracket builder is intuitive and functional
- [ ] Scores update automatically based on real game results
- [ ] Leaderboard displays accurate rankings
- [ ] All pages are mobile-responsive
- [ ] Application handles 1000+ concurrent users
- [ ] Email delivery is reliable
- [ ] Cron job runs successfully daily

## Notes for AI Agents

- Prioritize TypeScript for type safety
- Use Server Components where possible for performance
- Implement proper error handling throughout
- Add loading states for better UX
- Use React Hook Form for form management
- Implement optimistic UI updates where appropriate
- Follow Next.js 14+ best practices (App Router)
- Use MongoDB aggregation pipelines for complex queries
- Cache frequently accessed data (team logos, game schedules)
- Implement proper logging for debugging