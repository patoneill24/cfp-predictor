import { ObjectId } from 'mongodb';

export type GameRound = 'firstRound' | 'quarterfinals' | 'semifinals' | 'championship';

export interface GameResult {
  _id?: ObjectId;
  gameId: string;
  round: GameRound;
  team1: string;
  team2: string;
  team1Score: number | null;
  team2Score: number | null;
  winner: string | null;
  completed: boolean;
  gameDate: Date;
  lastUpdated: Date;
}
