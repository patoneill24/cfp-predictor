// Load environment variables FIRST before any other imports
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env') });

// Now import the rest
import { getDatabase } from '../mongodb';
import { GameResult } from '../models/gameResult';

async function seedTestData() {
  const db = await getDatabase();
  const collection = db.collection<GameResult>('gameResults');

  const fakeGameResults: GameResult[] = [
    {
      gameId: 'fr1',
      round: 'firstRound',
      team1: 'Oregon',
      team2: 'JMU',
      team1Score: null,
      team2Score: null,
      winner: 'Oregon',
      completed: false,
      gameDate: new Date('2024-12-20'),
      lastUpdated: new Date(),
    },
    {
      gameId: 'fr2',
      round: 'firstRound',
      team1: 'Alabama',
      team2: 'Oklahoma',
      team1Score: null,
      team2Score: null,
      winner: 'Alabama',
      completed: false,
      gameDate: new Date('2024-12-21'),
      lastUpdated: new Date(),
    },
    {
      gameId: 'fr3',
      round: 'firstRound',
      team1: 'Tulane',
      team2: 'Ole Miss',
      team1Score: null,
      team2Score: null,
      winner: 'Tulane',
      completed: false,
      gameDate: new Date('2024-12-21'),
      lastUpdated: new Date(),
    },
    {
      gameId: 'fr4',
      round: 'firstRound',
      team1: 'Miami',
      team2: 'Texas A&M',
      team1Score: null,
      team2Score: null,
      winner: 'Texas A&M',
      completed: false,
      gameDate: new Date('2024-12-22'),
      lastUpdated: new Date(),
    },
  ];

  const result = await collection.insertMany(fakeGameResults);
  console.log(`Inserted ${result.insertedCount} game results`);
  
  process.exit(0);
}

seedTestData().catch(console.error);
