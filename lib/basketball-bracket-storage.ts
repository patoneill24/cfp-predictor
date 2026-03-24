import type { Team } from '@/components/bracket';
import type { Bracket, Game } from '@/lib/models/prediction';

/** Known Sweet 16 names → seed for display when loading saved brackets */
const CBB_NAME_TO_SEED: Record<string, number> = {
  Duke: 1,
  Baylor: 5,
  Tennessee: 4,
  'Michigan St.': 12,
  Auburn: 2,
  Michigan: 3,
  Marquette: 7,
  'New Mexico': 10,
  Houston: 1,
  Gonzaga: 5,
  Kentucky: 2,
  UCLA: 7,
  Kansas: 1,
  Creighton: 4,
  Arizona: 3,
  Illinois: 6,
};

function slugTeamId(name: string): string {
  const s = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return s || 'team';
}

export function teamFromStoredName(name: string): Team {
  const trimmed = name.trim();
  return {
    id: slugTeamId(trimmed),
    name: trimmed,
    seed: CBB_NAME_TO_SEED[trimmed] ?? 0,
  };
}

export interface CbbSerializeMatchup {
  id: string;
  team1: Team | null;
  team2: Team | null;
  winner: Team | null;
}

export interface CbbBracketUiSnapshot {
  sweetSixteen: CbbSerializeMatchup[];
  eliteEight: CbbSerializeMatchup[];
  finalFour: CbbSerializeMatchup[];
  championship: CbbSerializeMatchup;
}

export function isStoredCbbBracket(bracket: Bracket): boolean {
  return (
    Array.isArray(bracket.firstRound) &&
    bracket.firstRound.length === 8 &&
    Array.isArray(bracket.quarterfinals) &&
    bracket.quarterfinals.length === 4 &&
    Array.isArray(bracket.semifinals) &&
    bracket.semifinals.length === 2 &&
    !!bracket.championship
  );
}

function gameToMatchup(g: Game): CbbSerializeMatchup {
  const team1 = g.team1 ? teamFromStoredName(g.team1) : null;
  const team2 = g.team2 ? teamFromStoredName(g.team2) : null;
  const pred = g.prediction?.trim();
  let winner: Team | null = null;
  if (pred) {
    if (team1?.name === pred) winner = team1;
    else if (team2?.name === pred) winner = team2;
    else winner = teamFromStoredName(pred);
  }
  return {
    id: g.gameId,
    team1,
    team2,
    winner,
  };
}

export function storedBracketToCbbUiSnapshot(bracket: Bracket): CbbBracketUiSnapshot {
  return {
    sweetSixteen: bracket.firstRound.map(gameToMatchup),
    eliteEight: bracket.quarterfinals.map(gameToMatchup),
    finalFour: bracket.semifinals.map(gameToMatchup),
    championship: {
      id: bracket.championship.gameId,
      team1: bracket.championship.team1 ? teamFromStoredName(bracket.championship.team1) : null,
      team2: bracket.championship.team2 ? teamFromStoredName(bracket.championship.team2) : null,
      winner: bracket.championship.prediction
        ? (() => {
            const t1 = bracket.championship.team1
              ? teamFromStoredName(bracket.championship.team1)
              : null;
            const t2 = bracket.championship.team2
              ? teamFromStoredName(bracket.championship.team2)
              : null;
            const p = bracket.championship.prediction.trim();
            if (t1?.name === p) return t1;
            if (t2?.name === p) return t2;
            return teamFromStoredName(p);
          })()
        : null,
    },
  };
}

/** Map champion vs opponent point totals onto bracket championship team1 / team2 slots */
export function championshipPredictedScoresBySlot(args: {
  team1Name: string;
  team2Name: string;
  winnerName: string;
  championPoints: number;
  opponentPoints: number;
}): { team1Score: number; team2Score: number } {
  const w = args.winnerName.trim();
  const t1 = args.team1Name.trim();
  if (t1 === w) {
    return { team1Score: args.championPoints, team2Score: args.opponentPoints };
  }
  return { team1Score: args.opponentPoints, team2Score: args.championPoints };
}

export function cbbUiSnapshotToStoredBracket(
  data: CbbBracketUiSnapshot,
  championshipPredictedScore: { team1Score: number; team2Score: number } = { team1Score: 0, team2Score: 0 }
): Bracket {
  return {
    firstRound: data.sweetSixteen.map((g) => ({
      gameId: g.id,
      team1: g.team1?.name ?? '',
      team2: g.team2?.name ?? '',
      prediction: g.winner?.name ?? '',
    })),
    quarterfinals: data.eliteEight.map((g, i) => ({
      gameId: g.id,
      team1: g.team1?.name ?? '',
      team2: g.team2?.name ?? '',
      prediction: g.winner?.name ?? '',
      title: `Elite Eight ${i + 1}`,
    })),
    semifinals: data.finalFour.map((g, i) => ({
      gameId: g.id,
      team1: g.team1?.name ?? '',
      team2: g.team2?.name ?? '',
      prediction: g.winner?.name ?? '',
      title: `Final Four ${i + 1}`,
    })),
    championship: {
      gameId: data.championship.id,
      team1: data.championship.team1?.name ?? '',
      team2: data.championship.team2?.name ?? '',
      prediction: data.championship.winner?.name ?? '',
      predictedScore: championshipPredictedScore,
      title: 'NCAA Championship',
    },
  };
}
