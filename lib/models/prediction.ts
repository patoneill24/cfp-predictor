import { ObjectId } from 'mongodb';

export interface Game {
  gameId: string;
  team1: string;
  team2: string;
  prediction: string; // winner
  title?: string; // optional title for the game
}

export interface ChampionshipGame {
  gameId: string;
  team1: string;
  team2: string;
  prediction: string; // winner
  predictedScore: {
    team1Score: number;
    team2Score: number;
  };
  title?: string; // optional title for the game
}

export interface Bracket {
  firstRound: Game[];
  quarterfinals: Game[];
  semifinals: Game[];
  championship: ChampionshipGame;
}

export interface Prediction {
  _id?: ObjectId;
  userId: ObjectId;
  userName: string; // user's email for display
  name: string; // custom name for the prediction
  createdAt: Date;
  updatedAt: Date;
  bracket: Bracket;
  score: number;
}
