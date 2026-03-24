'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { BasketballBracket, type BasketballBracketData } from '@/components/basketball-bracket';
import { ChampionshipScoreModal } from '@/components/championship-score-modal';
import {
  cbbUiSnapshotToStoredBracket,
  championshipPredictedScoresBySlot,
} from '@/lib/basketball-bracket-storage';

export default function CreateMarchMadnessPage() {
  const [predictionName, setPredictionName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [bracketData, setBracketData] = useState<BasketballBracketData | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const name = searchParams.get('name');
    if (name) {
      setPredictionName(name);
    } else {
      router.push('/dashboard?sport=cbb');
    }
  }, [searchParams, router]);

  /** Opens score modal — runs when user picks a champion or taps Create Prediction (e.g. after cancel). */
  const openScoreModal = (data: BasketballBracketData) => {
    setBracketData(data);
    if (data.championship.winner && data.championship.team1 && data.championship.team2) {
      setShowModal(true);
    }
  };

  const handleSaveWithScore = async (championScore: number, opponentScore: number) => {
    if (!bracketData?.championship?.winner || !bracketData.championship.team1 || !bracketData.championship.team2) {
      console.error('Championship winner, team1, or team2 is missing');
      return;
    }

    setSaving(true);
    setShowModal(false);

    try {
      const predictedScore = championshipPredictedScoresBySlot({
        team1Name: bracketData.championship.team1.name,
        team2Name: bracketData.championship.team2.name,
        winnerName: bracketData.championship.winner.name,
        championPoints: championScore,
        opponentPoints: opponentScore,
      });

      const bracket = cbbUiSnapshotToStoredBracket(
        {
          sweetSixteen: bracketData.sweetSixteen,
          eliteEight: bracketData.eliteEight,
          finalFour: bracketData.finalFour,
          championship: bracketData.championship,
        },
        predictedScore
      );

      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bracket, name: predictionName, sport: 'cbb' }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save prediction');
      }

      router.push('/dashboard?sport=cbb');
    } catch (error) {
      console.error('Error saving prediction:', error);
      alert(error instanceof Error ? error.message : 'Failed to save prediction. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Create March Madness Prediction</h1>
          <Link href="/dashboard?sport=cbb" className="text-gray-600 hover:text-gray-900">
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <BasketballBracket
        name={predictionName}
        onSave={openScoreModal}
        onChampionSelected={openScoreModal}
      />

      {showModal &&
        bracketData?.championship?.winner &&
        bracketData.championship.team1 &&
        bracketData.championship.team2 && (
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
            submitLabel="Save prediction"
          />
        )}

      {saving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg bg-white p-6">
            <div className="text-lg font-semibold">Saving prediction…</div>
          </div>
        </div>
      )}
    </div>
  );
}
