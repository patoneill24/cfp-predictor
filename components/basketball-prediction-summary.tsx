'use client';

import type { Bracket } from '@/lib/models/prediction';

interface BasketballPredictionSummaryProps {
  bracket: Bracket;
  className?: string;
}

function GameRow({
  label,
  team1,
  team2,
  pick,
}: {
  label: string;
  team1: string;
  team2: string;
  pick: string;
}) {
  return (
    <div className="rounded-md border border-gray-100 bg-gray-50/80 px-3 py-2 text-left">
      <div className="text-[10px] font-medium uppercase tracking-wide text-gray-500">{label}</div>
      <div className="text-xs text-gray-600">
        {team1} <span className="text-gray-400">vs</span> {team2}
      </div>
      <div className="mt-0.5 text-sm font-semibold text-gray-900">Pick: {pick || '—'}</div>
    </div>
  );
}

/**
 * Compact read-only summary of all March Madness picks for dashboard cards
 * (full interactive view lives on the prediction detail page).
 */
export function BasketballPredictionSummary({ bracket, className = '' }: BasketballPredictionSummaryProps) {
  const champ = bracket.championship;

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Sweet 16</div>
        <div className="grid max-h-40 grid-cols-1 gap-1.5 overflow-y-auto sm:grid-cols-2">
          {bracket.firstRound.map((g, i) => (
            <GameRow
              key={g.gameId}
              label={`Game ${i + 1}`}
              team1={g.team1}
              team2={g.team2}
              pick={g.prediction}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Elite 8</div>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {bracket.quarterfinals.map((g, i) => (
            <GameRow
              key={g.gameId}
              label={`Game ${i + 1}`}
              team1={g.team1}
              team2={g.team2}
              pick={g.prediction}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Final Four</div>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {bracket.semifinals.map((g, i) => (
            <GameRow
              key={g.gameId}
              label={`Game ${i + 1}`}
              team1={g.team1}
              team2={g.team2}
              pick={g.prediction}
            />
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-blue-100 bg-blue-50/90 p-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-blue-800/80">Championship</div>
        <div className="mt-1 text-sm text-blue-900/90">
          {champ.team1} <span className="text-blue-800/60">vs</span> {champ.team2}
        </div>
        <div className="mt-2 text-base font-bold text-blue-950">Champion: {champ.prediction}</div>
        {(champ.predictedScore.team1Score !== 0 || champ.predictedScore.team2Score !== 0) && (
          <div className="mt-2 border-t border-blue-200/80 pt-2 text-sm text-blue-900/90">
            <span className="text-xs font-medium text-blue-800/80">Predicted final: </span>
            {champ.team1} {champ.predictedScore.team1Score} – {champ.predictedScore.team2Score} {champ.team2}
          </div>
        )}
      </div>
    </div>
  );
}
