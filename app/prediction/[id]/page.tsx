'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Check } from 'lucide-react';
import { X } from 'lucide-react';

interface Prediction {
  _id: string;
  userName: string;
  name:string;
  score: number;
  createdAt: string;
  bracket: {
    firstRound: Array<{ gameId: string; team1: string; team2: string; prediction: string }>;
    quarterfinals: Array<{ gameId: string; team1: string; team2: string; prediction: string }>;
    semifinals: Array<{ gameId: string; team1: string; team2: string; prediction: string }>;
    championship: {
      gameId: string;
      team1: string;
      team2: string;
      prediction: string;
      predictedScore: {
        team1Score: number;
        team2Score: number;
      };
    };
  };
}

interface results {
  _id: string;
  gameId: string;
  round: string;
  team1: string;
  team2: string;
  team1Score: number;
  team2Score: number;
  winner: string;
  completed: boolean;
  gameDate: string;
  lastUpdated: string;
}

export default function PredictionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [results, setResults] = useState<results[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [id, setId] = useState<string>('');

  useEffect(() => {
    params.then((p) => {
      setId(p.id);
    });
  }, [params]);

  useEffect(() => {
    if (id) {
      fetchPrediction();
      fetchResults();
    }
  }, [id]);

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/results');
      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }
      const data = await response.json();
      setResults(data.results);
      // Handle the results data as needed
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  const fetchPrediction = async () => {
    try {
      const response = await fetch(`/api/predictions/${id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch prediction');
      }

      const data = await response.json();
      setPrediction(data.prediction);
    } catch (error) {
      console.error('Error fetching prediction:', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!prediction) {
    return null;
  }

  const getPredictionResults = (round:string , team1: string, team2: string,prediction: string) => {
    if (prediction) {
      const result = results.find((r) => r.round === round && ((r.team1 === team1 && r.team2 === team2) || (r.team1 === team2 && r.team2 === team1)));
      if (!result || !result.completed) {
        return 'Not Played Yet';
      }
      if (result.winner === prediction) {
        return 'Correct';
      }
      return 'Incorrect';
    }
  };

  const getOutlineClass = (round:string, team1: string, team2: string, prediction: string) => {
    const result = results.find((r) => r.round === round && ((r.team1 === team1 && r.team2 === team2) || (r.team1 === team2 && r.team2 === team1)));
    if (!result || !result.completed) {
      return ''; // No outline if game hasn't been played
    }
    if (result.winner === prediction) {
      return 'ring-2 ring-green-500'; // Green outline for correct prediction
    }
    return 'ring-2 ring-red-500'; // Red outline for incorrect prediction
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar current='Prediction Details' />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {prediction.name}
              </h2>
              <p className="text-gray-500 mt-1">
                Created {new Date(prediction.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {prediction.score}
              </div>
              <div className="text-sm text-gray-500">points</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                First Round
              </h3>
              <div className="space-y-2">
                {prediction.bracket.firstRound.map((game, index) => (
                  <div
                    key={game.gameId}
                    className={`p-3 bg-gray-50 rounded-lg ${getOutlineClass('firstRound', game.team1, game.team2, game.prediction)}`}
                  >
                    <div className="text-xs text-gray-500 mb-1">
                      Game {index + 1}
                    </div>
                    <div className='flex items-center justify-between'>
                      <div className="text-sm text-gray-700">
                        {game.team1} vs {game.team2}
                      </div>
                      <div>
                        {getPredictionResults('firstRound', game.team1, game.team2, game.prediction) === 'Correct' ? (
                          <Check size={24} className="text-green-500" />
                        ) : getPredictionResults('firstRound', game.team1, game.team2, game.prediction) === 'Incorrect' ? (
                          <X size={25} className="text-red-500" />
                        ) : (
                          <span className="text-gray-500">Not Played Yet</span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm font-semibold mt-1 text-gray-900">
                      Winner: {game.prediction}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Quarterfinals
              </h3>
              <div className="space-y-2">
                {prediction.bracket.quarterfinals.map((game, index) => (
                  <div
                    key={game.gameId}
                    className={`p-3 bg-gray-50 rounded-lg ${getOutlineClass('quarterfinals', game.team1, game.team2, game.prediction)}`}
                  >
                    <div className="text-xs text-gray-500 mb-1">
                      Game {index + 1}
                    </div>
                    <div className='flex items-center justify-between'>
                      <div className="text-sm text-gray-700">
                        {game.team1} vs {game.team2}
                      </div>
                      <div>
                        {getPredictionResults('quarterfinals', game.team1, game.team2, game.prediction) === 'Correct' ? (
                          <Check size={32} className="text-green-500" />
                        ) : getPredictionResults('quarterfinals', game.team1, game.team2, game.prediction) === 'Incorrect' ? (
                          <X className="text-red-500" />
                        ) : (
                          <span className="text-gray-500">Not Played Yet</span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900 mt-1">
                      Winner: {game.prediction}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Semifinals
              </h3>
              <div className="space-y-2">
                {prediction.bracket.semifinals.map((game, index) => (
                  <div
                    key={game.gameId}
                    className={`p-3 bg-gray-50 rounded-lg ${getOutlineClass('semifinals', game.team1, game.team2, game.prediction)}`}
                  >
                    <div className="text-xs text-gray-500 mb-1">
                      Game {index + 1}
                    </div>
                    <div className='flex items-center justify-between'>
                      <div className="text-sm text-gray-700">
                        {game.team1} vs {game.team2}
                      </div>
                      <div>
                        {getPredictionResults('semifinals', game.team1, game.team2, game.prediction) === 'Correct' ? (
                          <Check size={32} className="text-green-500" />
                        ) : getPredictionResults('semifinals', game.team1, game.team2, game.prediction) === 'Incorrect' ? (
                          <X className="text-red-500" />
                        ) : (
                          <span className="text-gray-500">Not Played Yet</span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900 mt-1">
                      Winner: {game.prediction}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Championship
              </h3>
              <div className={`p-4 h-48 bg-blue-50 rounded-lg border-2 border-blue-200 ${getOutlineClass('championship', prediction.bracket.championship.team1, prediction.bracket.championship.team2, prediction.bracket.championship.prediction)}`}>
                <div className='flex items-center justify-between'>
                  <div className="text-sm text-gray-700 mb-2">
                    {prediction.bracket.championship.team1} vs{' '}
                    {prediction.bracket.championship.team2}
                  </div>
                  <div>
                    {getPredictionResults('championship', prediction.bracket.championship.team1, prediction.bracket.championship.team2, prediction.bracket.championship.prediction) === 'Correct' ? (
                      <Check size={32} className="text-green-500" />
                    ) : getPredictionResults('championship', prediction.bracket.championship.team1, prediction.bracket.championship.team2, prediction.bracket.championship.prediction) === 'Incorrect' ? (
                      <X className="text-red-500" />
                    ) : (
                      <span className="text-gray-500">Not Played Yet</span>
                    )}
                  </div>
                </div>
                <div className="text-lg font-bold text-gray-900 mb-3">
                  Winner: {prediction.bracket.championship.prediction}
                </div>
                <div className="border-t border-blue-200 pt-3">
                  <div className="text-xs text-gray-600 mb-2">
                    Predicted Final Score:
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {prediction.bracket.championship.prediction}:{' '}
                    {prediction.bracket.championship.predictedScore.team1Score}
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {prediction.bracket.championship.team2 === prediction.bracket.championship.prediction ? prediction.bracket.championship.team1 : prediction.bracket.championship.team2}:{' '}
                    {prediction.bracket.championship.predictedScore.team2Score}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
