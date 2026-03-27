import { ObjectId } from 'mongodb';

export type GameRound = 'firstRound' | 'quarterfinals' | 'semifinals' | 'championship';

export type BasketballGameRound = 'Sweet 16' | 'Elite Eight' | 'Final Four' | 'Championship';

export interface GameResult {
  _id?: ObjectId;
  gameId: string;
  round: GameRound;
  team1: string;
  team2: string;
  title?: string;
  team1Score: number | null;
  team2Score: number | null;
  winner: string | null;
  completed: boolean;
  gameDate: Date;
  lastUpdated: Date;
}

export interface BasketballGameResult {
  _id?: ObjectId;
  gameId: string;
  round: BasketballGameRound;
  sport: string;
  team1: string;
  team2: string;
  title?: string;
  team1Score: number | null;
  team2Score: number | null;
  winner: string | null;
  completed: boolean;
  gameDate: Date;
  lastUpdated: Date;
}
