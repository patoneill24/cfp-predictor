import { Team} from "./bracket"
import { Trophy } from "lucide-react"
interface TeamButtonProps {
  team: Team | null
  isWinner: boolean
  onClick: () => void
  disabled: boolean
  isLarger?: boolean
}

export function TeamButton({ team, isWinner, onClick, disabled, isLarger }: TeamButtonProps) {
  if (!team) {
    return (
      <div className={`flex items-center justify-center bg-muted px-4 py-3 ${isLarger ? "h-27" : "h-17.5"}`}>
        <span className="text-sm text-muted-foreground">TBD</span>
      </div>
    )
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full px-4 py-3 text-left transition-colors ${isLarger ? "h-27" : "h-17.5"} ${
        isWinner ? "bg-primary text-primary-foreground" : "bg-card hover:bg-secondary disabled:hover:bg-card"
      } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1">
          <div className={`font-semibold text-pretty ${isWinner ? "text-primary-foreground" : "text-card-foreground"}`}>
            {team.name}
          </div>
          <div className={`text-sm ${isWinner ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
            #{team.seed} Seed
          </div>
        </div>
        {isWinner && (
          <div className="text-primary-foreground">
            <Trophy className="h-5 w-5" />
          </div>
        )}
      </div>
    </button>
  )
}