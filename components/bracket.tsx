"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, RotateCcw } from "lucide-react"
import { MatchupCard } from "./matchupCard"

export interface Team {
  id: string
  name: string
  seed: number
}

interface Matchup {
  id: string
  team1: Team | null
  team2: Team | null
  winner: Team | null
}

const initialTeams: Team[] = [
  { id: "1", name: "Indiana", seed: 1 },
  { id: "2", name: "Ohio State", seed: 2 },
  { id: "3", name: "Georgia", seed: 3 },
  { id: "4", name: "Texas Tech", seed: 4 },
  { id: "5", name: "Oregon", seed: 5 },
  { id: "6", name: "Ole Miss", seed: 6 },
  { id: "7", name: "Texas A&M", seed: 7 },
  { id: "8", name: "Oklahoma", seed: 8 },
  { id: "9", name: "Alabama", seed: 9 },
  { id: "10", name: "Miami", seed: 10 },
  { id: "11", name: "Tulane", seed: 11 },
  { id: "12", name: "JMU", seed: 12 },
]

interface BracketData {
  firstRound: Matchup[]
  quarterfinals: Matchup[]
  semifinals: Matchup[]
  championship: Matchup
}

interface BracketPredictorProps {
  onSave?: (data: BracketData) => void
  readOnly?: boolean
  name?: string
}

export function BracketPredictor({ onSave, readOnly = false, name }: BracketPredictorProps = {}) {
  const [firstRound, setFirstRound] = useState<Matchup[]>([
    { id: "fr1", team1: initialTeams[11], team2: initialTeams[4], winner: null }, // 7 vs 10
    { id: "fr2", team1: initialTeams[8], team2: initialTeams[7], winner: null }, // 2 vs 11
    { id: "fr3", team1: initialTeams[10], team2: initialTeams[5], winner: null }, // 3 vs 12
    { id: "fr4", team1: initialTeams[9], team2: initialTeams[6], winner: null }, // 6 vs 9
  ])

  const [quarterfinals, setQuarterfinals] = useState<Matchup[]>([
    { id: "qf1", team1: initialTeams[3], team2: null, winner: null }, // 1 vs winner of FR1
    { id: "qf2", team1: initialTeams[0], team2: null, winner: null }, // 8 vs winner of FR2
    { id: "qf3", team1: initialTeams[2], team2: null, winner: null }, // 5 vs winner of FR3
    { id: "qf4", team1: initialTeams[1], team2: null, winner: null }, // 4 vs winner of FR4
  ])

  const [semifinals, setSemifinals] = useState<Matchup[]>([
    { id: "sf1", team1: null, team2: null, winner: null },
    { id: "sf2", team1: null, team2: null, winner: null },
  ])

  const [championship, setChampionship] = useState<Matchup>({
    id: "final",
    team1: null,
    team2: null,
    winner: null,
  })

  const handleFirstRoundWinner = (matchupId: string, winner: Team) => {
    const updatedFirstRound = firstRound.map((m) => (m.id === matchupId ? { ...m, winner } : m))
    setFirstRound(updatedFirstRound)

    const updatedQuarterfinals = [...quarterfinals]
    if (matchupId === "fr1") {
      updatedQuarterfinals[0] = { ...updatedQuarterfinals[0], team2: winner }
    } else if (matchupId === "fr2") {
      updatedQuarterfinals[1] = { ...updatedQuarterfinals[1], team2: winner }
    } else if (matchupId === "fr3") {
      updatedQuarterfinals[2] = { ...updatedQuarterfinals[2], team2: winner }
    } else if (matchupId === "fr4") {
      updatedQuarterfinals[3] = { ...updatedQuarterfinals[3], team2: winner }
    }
    setQuarterfinals(updatedQuarterfinals)
  }

  const handleQuarterfinalWinner = (matchupId: string, winner: Team) => {
    const updatedQuarterfinals = quarterfinals.map((m) => (m.id === matchupId ? { ...m, winner } : m))
    setQuarterfinals(updatedQuarterfinals)

    const updatedSemifinals = [...semifinals]
    if (matchupId === "qf1") {
      updatedSemifinals[0] = { ...updatedSemifinals[0], team1: winner }
    } else if (matchupId === "qf2") {
      updatedSemifinals[0] = { ...updatedSemifinals[0], team2: winner }
    } else if (matchupId === "qf3") {
      updatedSemifinals[1] = { ...updatedSemifinals[1], team1: winner }
    } else if (matchupId === "qf4") {
      updatedSemifinals[1] = { ...updatedSemifinals[1], team2: winner }
    }
    setSemifinals(updatedSemifinals)
  }

  const handleSemifinalWinner = (matchupId: string, winner: Team) => {
    const updatedSemifinals = semifinals.map((m) => (m.id === matchupId ? { ...m, winner } : m))
    setSemifinals(updatedSemifinals)

    const updatedChampionship = { ...championship }
    if (matchupId === "sf1") {
      updatedChampionship.team1 = winner
    } else if (matchupId === "sf2") {
      updatedChampionship.team2 = winner
    }
    setChampionship(updatedChampionship)
  }

  const handleChampionshipWinner = (winner: Team) => {
    setChampionship({ ...championship, winner })
  }

  const handleSave = () => {
    if (onSave) {
      onSave({
        firstRound,
        quarterfinals,
        semifinals,
        championship,
      })
    }
  }

  const isBracketComplete = championship.winner !== null

  const resetBracket = () => {
    setFirstRound([
      { id: "fr1", team1: initialTeams[6], team2: initialTeams[9], winner: null },
      { id: "fr2", team1: initialTeams[1], team2: initialTeams[10], winner: null },
      { id: "fr3", team1: initialTeams[2], team2: initialTeams[11], winner: null },
      { id: "fr4", team1: initialTeams[5], team2: initialTeams[8], winner: null },
    ])
    setQuarterfinals([
      { id: "qf1", team1: initialTeams[0], team2: null, winner: null },
      { id: "qf2", team1: initialTeams[7], team2: null, winner: null },
      { id: "qf3", team1: initialTeams[4], team2: null, winner: null },
      { id: "qf4", team1: initialTeams[3], team2: null, winner: null },
    ])
    setSemifinals([
      { id: "sf1", team1: null, team2: null, winner: null },
      { id: "sf2", team1: null, team2: null, winner: null },
    ])
    setChampionship({ id: "final", team1: null, team2: null, winner: null })
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
                <Button
                  onClick={handleSave}
                  size="lg"
                  disabled={!isBracketComplete}
                  className="gap-2"
                >
                  <Trophy className="h-4 w-4" />
                  Create Prediction
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <div>
        <div className="flex gap-6 md:gap-8">
          {/* First Round */}
          <div className="flex flex-col gap-4">
            <h2 className="mb-2 text-center text-xl font-bold">First Round</h2>
            <div className="flex flex-col gap-6">
              {firstRound.map((matchup) => (
                <MatchupCard
                  key={matchup.id}
                  matchup={matchup}
                  onSelectWinner={readOnly ? undefined : (winner) => handleFirstRoundWinner(matchup.id, winner)}
                />
              ))}
            </div>
          </div>

          {/* Quarterfinals */}
          <div className="flex flex-col gap-4">
            <h2 className="mb-2 text-center text-xl font-bold">Quarterfinals</h2>
            <div className="flex flex-col gap-6">
              {quarterfinals.map((matchup) => (
                <MatchupCard
                  key={matchup.id}
                  matchup={matchup}
                  onSelectWinner={readOnly ? undefined : (winner) => handleQuarterfinalWinner(matchup.id, winner)}
                />
              ))}
            </div>
          </div>

          {/* Semifinals */}
          <div className="flex flex-col gap-4">
            <h2 className="mb-2 text-center text-xl font-bold">Semifinals</h2>
            <div className="flex min-h-full flex-col justify-center gap-16">
              {semifinals.map((matchup) => (
                <MatchupCard
                  key={matchup.id}
                  matchup={matchup}
                  onSelectWinner={readOnly ? undefined : (winner) => handleSemifinalWinner(matchup.id, winner)}
                  isLarger
                />
              ))}
            </div>
          </div>

          {/* Championship */}
          <div className="flex flex-col gap-4">
            <h2 className="mb-2 text-center text-xl font-bold">Championship</h2>
            <div className="flex min-h-full flex-col justify-center">
              <MatchupCard
                matchup={championship}
                onSelectWinner={readOnly ? undefined : handleChampionshipWinner}
                isChampionship
                isLarger
              />
            </div>
          </div>

          {/* Winner Display */}
          <div className="flex flex-col gap-4">
            <h2 className="mb-2 text-center text-xl font-bold">Champion</h2>
            <div className="flex min-h-full flex-col justify-center">
              <Card className="flex h-55 w-50 flex-col items-center justify-center bg-accent p-6">
                {championship.winner ? (
                  <div className="text-center">
                    <Trophy className="mx-auto mb-3 h-12 w-12 text-accent-foreground" />
                    <div className="text-sm font-medium text-accent-foreground">National Champion</div>
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


