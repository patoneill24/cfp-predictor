import { Team } from "./bracket"
import { TeamButton } from "./teamButton"
import { Card } from "./ui/card"

interface MatchupCardProps {
  matchup: Matchup
  onSelectWinner?: (winner: Team) => void
  isChampionship?: boolean
  isLarger?: boolean
}

interface Matchup {
  id: string
  team1: Team | null
  team2: Team | null
  winner: Team | null
}

export function MatchupCard({ matchup, onSelectWinner, isLarger }: MatchupCardProps) {
  return (
    <Card className="w-50 overflow-hidden border-2">
      <div className="divide-y-2">
        <TeamButton
          team={matchup.team1}
          isWinner={matchup.winner?.id === matchup.team1?.id}
          onClick={() => {
            if (matchup.team1 && onSelectWinner) {
              onSelectWinner(matchup.team1)
            }
          }}
          disabled={!matchup.team1 || !matchup.team2 || !onSelectWinner}
          isLarger={isLarger}
        />
        <TeamButton
          team={matchup.team2}
          isWinner={matchup.winner?.id === matchup.team2?.id}
          onClick={() => {
            if (matchup.team2 && onSelectWinner) {
              onSelectWinner(matchup.team2)
            }
          }}
          disabled={!matchup.team1 || !matchup.team2 || !onSelectWinner}
          isLarger={isLarger}
        />
      </div>
    </Card>
  )
}