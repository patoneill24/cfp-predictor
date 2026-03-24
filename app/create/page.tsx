'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { BracketPredictor, type BracketData } from '@/components/bracket';
import { ChampionshipScoreModal } from '@/components/championship-score-modal';
import { championshipPredictedScoresBySlot } from '@/lib/basketball-bracket-storage';

export default function CreatePage() {
  const [showModal, setShowModal] = useState(false);
  const [bracketData, setBracketData] = useState<BracketData | null>(null);
  const [saving, setSaving] = useState(false);
  const [predictionName, setPredictionName] = useState<string>('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const name = searchParams.get('name');
    if (name) {
      setPredictionName(name);
    } else {
      // Redirect back to dashboard if no name is provided
      router.push('/dashboard');
    }
  }, [searchParams, router]);

  /** Opens score modal when user picks a champion or taps Create Prediction (e.g. after cancel). */
  const openScoreModal = (data: BracketData) => {
    setBracketData(data);
    if (data.championship.winner && data.championship.team1 && data.championship.team2) {
      setShowModal(true);
    }
  };

  const handleSaveWithScore = async (championScore: number, opponentScore: number) => {
    if (!bracketData) return;
    const champ = bracketData.championship;
    if (!champ.winner || !champ.team1 || !champ.team2) return;

    if (championScore < 0 || opponentScore < 0) {
      alert('Scores must be non-negative numbers.');
      return;
    }

    if (championScore === opponentScore) {
      alert('Scores cannot be tied. Please enter a valid score prediction.');
      return;
    }

    if (championScore < opponentScore) {
      const opp =
        champ.team1.id === champ.winner.id ? champ.team2.name : champ.team1.name;
      alert(`The score for ${champ.winner.name} must be higher than ${opp}.`);
      return;
    }

    setSaving(true);
    setShowModal(false);

    try {
      const predictedScore = championshipPredictedScoresBySlot({
        team1Name: champ.team1.name,
        team2Name: champ.team2.name,
        winnerName: champ.winner.name,
        championPoints: championScore,
        opponentPoints: opponentScore,
      });

      const bracket = {
        firstRound: bracketData.firstRound.map((m) => ({
          gameId: m.id,
          team1: m.team1?.name || '',
          team2: m.team2?.name || '',
          prediction: m.winner?.name || '',
        })),
        quarterfinals: bracketData.quarterfinals.map((m) => ({
          gameId: m.id,
          team1: m.team1?.name || '',
          team2: m.team2?.name || '',
          prediction: m.winner?.name || '',
        })),
        semifinals: bracketData.semifinals.map((m) => ({
          gameId: m.id,
          team1: m.team1?.name || '',
          team2: m.team2?.name || '',
          prediction: m.winner?.name || '',
        })),
        championship: {
          gameId: bracketData.championship.id,
          team1: champ.team1.name,
          team2: champ.team2.name,
          prediction: champ.winner.name,
          predictedScore,
        },
      };

      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bracket, name: predictionName }),
      });

      if (!response.ok) {
        throw new Error('Failed to save prediction');
      }

      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving prediction:', error);
      alert('Failed to save prediction. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Create Prediction</h1>
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <BracketPredictor
        name={predictionName}
        onSave={openScoreModal}
        onChampionSelected={openScoreModal}
      />

      {showModal && bracketData?.championship?.winner && bracketData.championship.team1 && bracketData.championship.team2 && (
        <ChampionshipScoreModal
          key={bracketData.championship.winner.id}
          champion={bracketData.championship.winner}
          opponent={
            bracketData.championship.team1.id === bracketData.championship.winner.id
              ? bracketData.championship.team2
              : bracketData.championship.team1
          }
          onSubmit={handleSaveWithScore}
          onCancel={() => setShowModal(false)}
        />
      )}

      {saving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg bg-white p-6">
            <div className="text-lg font-semibold">Saving prediction...</div>
          </div>
        </div>
      )}
    </div>
  );
}
