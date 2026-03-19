"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, RotateCcw } from "lucide-react"
import { Team } from "./bracket"
import { MatchupCard } from "./matchupCard"

// 2026 March Madness Sweet 16 teams — update with actual bracket when available
const initialMatchups: [Team, Team][] = [
  // East region
  [{ id: "1", name: "Duke", seed: 1 }, { id: "5", name: "Baylor", seed: 5 }],
  [{ id: "4", name: "Tennessee", seed: 4 }, { id: "12", name: "Michigan St.", seed: 12 }],
  // Midwest region
  [{ id: "2", name: "Auburn", seed: 2 }, { id: "3", name: "Michigan", seed: 3 }],
  [{ id: "7", name: "Marquette", seed: 7 }, { id: "10", name: "New Mexico", seed: 10 }],
  // South region
  [{ id: "6", name: "Houston", seed: 1 }, { id: "8", name: "Gonzaga", seed: 5 }],
  [{ id: "9", name: "Kentucky", seed: 2 }, { id: "11", name: "UCLA", seed: 7 }],
  // West region
  [{ id: "13", name: "Kansas", seed: 1 }, { id: "16", name: "Creighton", seed: 4 }],
  [{ id: "14", name: "Arizona", seed: 3 }, { id: "15", name: "Illinois", seed: 6 }],
]

interface Matchup {
  id: string
  team1: Team | null
  team2: Team | null
  winner: Team | null
}

interface BasketballBracketData {
  sweetSixteen: Matchup[]
  eliteEight: Matchup[]
  finalFour: Matchup[]
  championship: Matchup
}

interface BasketballBracketProps {
  onSave?: (data: BasketballBracketData) => void
  readOnly?: boolean
  name?: string
}

function makeInitialSweetSixteen(): Matchup[] {
  return initialMatchups.map(([t1, t2], i) => ({
    id: `s16-${i + 1}`,
    team1: t1,
    team2: t2,
    winner: null,
  }))
}

function makeInitialEliteEight(): Matchup[] {
  return Array.from({ length: 4 }, (_, i) => ({
    id: `e8-${i + 1}`,
    team1: null,
    team2: null,
    winner: null,
  }))
}

function makeInitialFinalFour(): Matchup[] {
  return Array.from({ length: 2 }, (_, i) => ({
    id: `ff-${i + 1}`,
    team1: null,
    team2: null,
    winner: null,
  }))
}

const initialChampionship: Matchup = {
  id: "ncaa-final",
  team1: null,
  team2: null,
  winner: null,
}

export function BasketballBracket({ onSave, readOnly = false, name }: BasketballBracketProps = {}) {
  const [sweetSixteen, setSweetSixteen] = useState<Matchup[]>(makeInitialSweetSixteen)
  const [eliteEight, setEliteEight] = useState<Matchup[]>(makeInitialEliteEight)
  const [finalFour, setFinalFour] = useState<Matchup[]>(makeInitialFinalFour)
  const [championship, setChampionship] = useState<Matchup>(initialChampionship)

  const clearTeamFromMatchup = (matchup: Matchup, teamId: string): Matchup => {
    const updated = { ...matchup }
    if (matchup.team1?.id === teamId) updated.team1 = null
    if (matchup.team2?.id === teamId) updated.team2 = null
    if (matchup.winner?.id === teamId) updated.winner = null
    return updated
  }

  // Sweet 16 game index → Elite 8 game index + slot
  // Games 0,1 → E8 game 0 (team1, team2)
  // Games 2,3 → E8 game 1 (team1, team2)
  // Games 4,5 → E8 game 2 (team1, team2)
  // Games 6,7 → E8 game 3 (team1, team2)
  const s16ToE8 = [
    { e8Index: 0, slot: "team1" as const },
    { e8Index: 0, slot: "team2" as const },
    { e8Index: 1, slot: "team1" as const },
    { e8Index: 1, slot: "team2" as const },
    { e8Index: 2, slot: "team1" as const },
    { e8Index: 2, slot: "team2" as const },
    { e8Index: 3, slot: "team1" as const },
    { e8Index: 3, slot: "team2" as const },
  ]

  // Elite 8 → Final Four
  // E8 games 0,1 → FF game 0
  // E8 games 2,3 → FF game 1
  const e8ToFF = [
    { ffIndex: 0, slot: "team1" as const },
    { ffIndex: 0, slot: "team2" as const },
    { ffIndex: 1, slot: "team1" as const },
    { ffIndex: 1, slot: "team2" as const },
  ]

  const handleSweetSixteenWinner = (matchupId: string, winner: Team) => {
    const gameIndex = sweetSixteen.findIndex((m) => m.id === matchupId)
    if (gameIndex === -1) return
    const matchup = sweetSixteen[gameIndex]
    const eliminated = matchup.team1?.id === winner.id ? matchup.team2 : matchup.team1

    setSweetSixteen((prev) => prev.map((m) => (m.id === matchupId ? { ...m, winner } : m)))

    const { e8Index, slot } = s16ToE8[gameIndex]
    setEliteEight((prev) => {
      const updated = eliminated ? prev.map((m) => clearTeamFromMatchup(m, eliminated.id)) : [...prev]
      updated[e8Index] = { ...updated[e8Index], [slot]: winner }
      return updated
    })

    if (eliminated) {
      setFinalFour((prev) => prev.map((m) => clearTeamFromMatchup(m, eliminated.id)))
      setChampionship((prev) => clearTeamFromMatchup(prev, eliminated.id))
    }
  }

  const handleEliteEightWinner = (matchupId: string, winner: Team) => {
    const gameIndex = eliteEight.findIndex((m) => m.id === matchupId)
    if (gameIndex === -1) return
    const matchup = eliteEight[gameIndex]
    const eliminated = matchup.team1?.id === winner.id ? matchup.team2 : matchup.team1

    setEliteEight((prev) => prev.map((m) => (m.id === matchupId ? { ...m, winner } : m)))

    const { ffIndex, slot } = e8ToFF[gameIndex]
    setFinalFour((prev) => {
      const updated = eliminated ? prev.map((m) => clearTeamFromMatchup(m, eliminated.id)) : [...prev]
      updated[ffIndex] = { ...updated[ffIndex], [slot]: winner }
      return updated
    })

    if (eliminated) {
      setChampionship((prev) => clearTeamFromMatchup(prev, eliminated.id))
    }
  }

  const handleFinalFourWinner = (matchupId: string, winner: Team) => {
    const matchup = finalFour.find((m) => m.id === matchupId)
    if (!matchup) return
    const eliminated = matchup.team1?.id === winner.id ? matchup.team2 : matchup.team1

    setFinalFour((prev) => prev.map((m) => (m.id === matchupId ? { ...m, winner } : m)))

    setChampionship((prev) => {
      const updated = eliminated ? clearTeamFromMatchup(prev, eliminated.id) : { ...prev }
      if (matchupId === "ff-1") updated.team1 = winner
      else updated.team2 = winner
      return updated
    })
  }

  const handleChampionshipWinner = (winner: Team) => {
    setChampionship((prev) => ({ ...prev, winner }))
  }

  const resetBracket = () => {
    setSweetSixteen(makeInitialSweetSixteen())
    setEliteEight(makeInitialEliteEight())
    setFinalFour(makeInitialFinalFour())
    setChampionship(initialChampionship)
  }

  const isBracketComplete = championship.winner !== null

  const handleSave = () => {
    if (onSave) {
      onSave({ sweetSixteen, eliteEight, finalFour, championship })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="text-center md:text-left">
          <h1 className="mb-2 text-4xl font-bold text-balance md:text-5xl">{name}</h1>
          <p className="text-lg text-muted-foreground">
            {readOnly ? "View bracket predictions" : "Click on teams to predict the winners and build your bracket"}
          </p>
        </div>
        <div className="flex gap-3">
          {!readOnly && (
            <>
              <Button onClick={resetBracket} variant="outline" size="lg" className="gap-2 bg-transparent">
                <RotateCcw className="h-4 w-4" />
                Reset Bracket
              </Button>
              {onSave && (
                <Button onClick={handleSave} size="lg" disabled={!isBracketComplete} className="gap-2">
                  <Trophy className="h-4 w-4" />
                  Create Prediction
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-hidden">
        <div className="flex gap-6 md:gap-8 min-w-max">
          {/* Sweet 16 */}
          <div className="flex flex-col gap-4">
            <h2 className="mb-2 text-center text-xl font-bold">Sweet 16</h2>
            <div className="flex flex-col gap-6">
              {sweetSixteen.map((matchup) => (
                <MatchupCard
                  key={matchup.id}
                  matchup={matchup}
                  onSelectWinner={readOnly ? undefined : (w) => handleSweetSixteenWinner(matchup.id, w)}
                />
              ))}
            </div>
          </div>

          {/* Elite 8 */}
          <div className="flex flex-col gap-4">
            <h2 className="mb-2 text-center text-xl font-bold">Elite 8</h2>
            <div className="flex flex-col justify-around h-full gap-6">
              {eliteEight.map((matchup) => (
                <MatchupCard
                  key={matchup.id}
                  matchup={matchup}
                  onSelectWinner={readOnly ? undefined : (w) => handleEliteEightWinner(matchup.id, w)}
                />
              ))}
            </div>
          </div>

          {/* Final Four */}
          <div className="flex flex-col gap-4">
            <h2 className="mb-2 text-center text-xl font-bold">Final Four</h2>
            <div className="flex flex-col justify-center gap-16 min-h-full">
              {finalFour.map((matchup) => (
                <MatchupCard
                  key={matchup.id}
                  matchup={matchup}
                  onSelectWinner={readOnly ? undefined : (w) => handleFinalFourWinner(matchup.id, w)}
                  isLarger
                />
              ))}
            </div>
          </div>

          {/* Championship */}
          <div className="flex flex-col gap-4">
            <h2 className="mb-2 text-center text-xl font-bold">Championship</h2>
            <div className="flex flex-col justify-center min-h-full">
              <MatchupCard
                matchup={championship}
                onSelectWinner={readOnly ? undefined : handleChampionshipWinner}
                isChampionship
                isLarger
              />
            </div>
          </div>

          {/* Champion display */}
          <div className="flex flex-col gap-4">
            <h2 className="mb-2 text-center text-xl font-bold">Champion</h2>
            <div className="flex flex-col justify-center min-h-full">
              <Card className="flex h-55 w-50 flex-col items-center justify-center bg-accent p-6">
                {championship.winner ? (
                  <div className="text-center">
                    <Trophy className="mx-auto mb-3 h-12 w-12 text-accent-foreground" />
                    <div className="text-sm font-medium text-accent-foreground">NCAA Champion</div>
                    <div className="mt-2 text-xl font-bold text-accent-foreground">{championship.winner.name}</div>
                    <div className="mt-1 text-sm text-accent-foreground/80">#{championship.winner.seed} Seed</div>
                  </div>
                ) : (
                  <div className="text-center text-accent-foreground">
                    <Trophy className="mx-auto mb-2 h-10 w-10 opacity-30" />
                    <div className="text-sm">Complete bracket to see champion</div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
