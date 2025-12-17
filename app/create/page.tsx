'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { BracketPredictor } from '@/components/bracket';
import type { Team } from '@/components/bracket';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface ChampionshipScoreModalProps {
  champion: Team;
  opponent: Team;
  onSubmit: (team1Score: number, team2Score: number) => void;
  onCancel: () => void;
}

function ChampionshipScoreModal({
  champion,
  opponent,
  onSubmit,
  onCancel,
}: ChampionshipScoreModalProps) {

  const scoreSchema = z.object({
    championScore: z.string().refine((val) => val === '' || !isNaN(Number(val)), {
      message: "Must be a valid number",
    }).refine((val) => val === '' || Number(val) >= 0, {
      message: "Score must be a non-negative number",
    }),
    opponentScore: z.string().refine((val) => val === '' || !isNaN(Number(val)), {
      message: "Must be a valid number",
    }).refine((val) => val === '' || Number(val) >= 0, {
      message: "Score must be a non-negative number",
    }),
  }).refine((data) => {
    if (data.championScore === '' || data.opponentScore === '') return true;
    return Number(data.championScore) !== Number(data.opponentScore);
  }, {
    message: "Scores cannot be tied",
    path: ["championScore"],
  }).refine((data) => {
    if (data.championScore === '' || data.opponentScore === '') return true;
    return Number(data.championScore) > Number(data.opponentScore);
  }, {
    message: `${champion.name} score must be higher than ${opponent.name} score`,
    path: ["championScore"],
  });

  const scoreForm = useForm<z.infer<typeof scoreSchema>>({
    resolver: zodResolver(scoreSchema),
    defaultValues: { championScore: '', opponentScore: '' },
    mode: 'onChange',
  })

  const handleFormSubmit = (data: z.infer<typeof scoreSchema>) => {
    onSubmit(Number(data.championScore), Number(data.opponentScore));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Predict Final Score</h2>

        <div className="mb-6">
          <p className="text-gray-600 mb-2">
            You predicted <span className="font-semibold">{champion.name}</span>{' '}
            to win the championship.
          </p>
          <p className="text-sm text-gray-500">
            Enter your predicted final score to complete your bracket.
          </p>
        </div>
        <Form {...scoreForm}>
        <form onSubmit={scoreForm.handleSubmit(handleFormSubmit)}>
          <FormField
            name="championScore"
            control={scoreForm.control}
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel className="block text-sm font-medium text-gray-700 mb-1">
                  {champion.name} Score
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={field.value}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="opponentScore"
            control={scoreForm.control}
            render={({ field }) => (
              <FormItem className="mb-6">
                <FormLabel className="block text-sm font-medium text-gray-700 mb-1">
                  {opponent.name} Score
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={field.value}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Prediction
            </button>
          </div>
        </form>
        </Form>
      </div>
    </div>
  );
}

export default function CreatePage() {
  const [showModal, setShowModal] = useState(false);
  const [bracketData, setBracketData] = useState<any>(null);
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

  // const handleSaveBracket = async (data: any) => {
  //   // This would be called from the BracketPredictor component
  //   // For now, we'll need to modify the BracketPredictor to expose its data
  //   setBracketData(data);
  // };

  const handleSaveWithScore = async (team1Score: number, team2Score: number) => {
    if(team1Score < 0 || team2Score < 0) {
      alert('Scores must be non-negative numbers.');
      return;
    }

    if(team1Score === team2Score) {
      alert('Scores cannot be tied. Please enter a valid score prediction.');
      return;
    }

    if(team1Score < team2Score) {
      alert(`The score for ${bracketData.championship.winner.name} must be higher than ${bracketData.championship.team1.id === bracketData.championship.winner.id ? bracketData.championship.team2.name : bracketData.championship.team1.name}.`);
      return;
    }
    
    setSaving(true);
    setShowModal(false);

    try {
      // Build the bracket data structure
      const bracket = {
        firstRound: bracketData.firstRound.map((m: any) => ({
          gameId: m.id,
          team1: m.team1?.name || '',
          team2: m.team2?.name || '',
          prediction: m.winner?.name || '',
        })),
        quarterfinals: bracketData.quarterfinals.map((m: any) => ({
          gameId: m.id,
          team1: m.team1?.name || '',
          team2: m.team2?.name || '',
          prediction: m.winner?.name || '',
        })),
        semifinals: bracketData.semifinals.map((m: any) => ({
          gameId: m.id,
          team1: m.team1?.name || '',
          team2: m.team2?.name || '',
          prediction: m.winner?.name || '',
        })),
        championship: {
          gameId: bracketData.championship.id,
          team1: bracketData.championship.team1?.name || '',
          team2: bracketData.championship.team2?.name || '',
          prediction: bracketData.championship.winner?.name || '',
          predictedScore: {
            team1Score,
            team2Score,
          },
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
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">
              Create Prediction
            </h1>
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <BracketPredictor name={predictionName} onSave={(data) => {
        setBracketData(data);
        if (data.championship.winner) {
          setShowModal(true);
        }
      }} />

      {showModal && bracketData?.championship?.winner && (
        <ChampionshipScoreModal
          champion={bracketData.championship.winner}
          opponent={
            bracketData.championship.team1.id ===
            bracketData.championship.winner.id
              ? bracketData.championship.team2
              : bracketData.championship.team1
          }
          onSubmit={handleSaveWithScore}
          onCancel={() => setShowModal(false)}
        />
      )}

      {saving && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <div className="text-lg font-semibold">Saving prediction...</div>
          </div>
        </div>
      )}
    </div>
  );
}
