# Quick Start Guide

## Get Started in 5 Minutes

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Set Up Environment Variables
Create a `.env.local` file with your MongoDB connection string:

```bash
CONNECTION_STRING=your-mongodb-connection-string-here
JWT_SECRET=any-random-secret-key
CRON_SECRET=any-random-secret-for-cron
```

### 3. Run the Development Server
```bash
pnpm dev
```

### 4. Open the App
Navigate to [http://localhost:3000](http://localhost:3000)

## First Time Usage

1. **Sign Up**: Enter your email on the landing page
2. **Check Console**: Since email service isn't configured yet, the OTP will be logged to your terminal console
3. **Verify**: Copy the 6-digit code from the console and enter it in the verification page
4. **Create Prediction**: Click "Create New Prediction" and build your bracket
5. **Save**: After selecting your championship winner, enter the predicted final score

## Important Notes

### Email in MVP
- OTP codes are **logged to the console** instead of being sent via email
- Check your terminal/console where `pnpm dev` is running to see the OTP codes
- To enable real email, integrate a service like Resend or SendGrid (see SETUP.md)

### MongoDB Setup
You can use:
- **Local MongoDB**: `mongodb://localhost:27017/cfp-predictor`
- **MongoDB Atlas** (free tier): Get connection string from [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

### Testing the Cron Job
To manually sync game results and update scores:

```bash
curl -X POST http://localhost:3000/api/cron/sync-results \
  -H "Authorization: Bearer your-cron-secret"
```

Replace `your-cron-secret` with the value from your `.env.local`

## What's Included

- ✅ Full authentication system with OTP
- ✅ Interactive bracket builder
- ✅ Dashboard to view all predictions
- ✅ Leaderboard with rankings
- ✅ Automatic score calculation
- ✅ API integration ready for College Football Data
- ✅ Mobile responsive design

## Next Steps

1. **Add Real Email**: Integrate Resend, SendGrid, or another email service
2. **Deploy**: Push to Vercel for production deployment
3. **Set Up Cron**: Use Vercel Cron Jobs to sync results daily
4. **Add API Key**: Get a free API key from [collegefootballdata.com](https://collegefootballdata.com)

## Troubleshooting

**Issue**: Can't connect to MongoDB
- **Solution**: Check your CONNECTION_STRING in `.env.local`
- Make sure MongoDB is running (if using local)

**Issue**: OTP not appearing
- **Solution**: Check the terminal/console where you ran `pnpm dev`
- Look for lines starting with `=== OTP EMAIL ===`

**Issue**: Build errors
- **Solution**: Make sure you have Node.js 18+ and pnpm installed
- Try deleting `node_modules` and `.next`, then run `pnpm install` again

## Support

For more detailed documentation, see:
- [SETUP.md](./SETUP.md) - Full setup instructions
- [Requirements](./requirments.md) - Complete feature specifications

---

Built with Next.js 16, React 19, MongoDB, and TypeScript
