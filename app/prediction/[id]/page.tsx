'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { BasketballBracket } from '@/components/basketball-bracket';
import { Check } from 'lucide-react';
import { X } from 'lucide-react';
import type { Bracket } from '@/lib/models/prediction';
import { Sport } from '@/app/dashboard/page';

interface Prediction {
  _id: string;
  userName: string;
  name: string;
  score: number;
  createdAt: string;
  sport?: 'cfb' | 'cbb';
  bracket: Bracket;
}

interface results {
  _id: string;
  gameId: string;
  round: string;
  team1: string;
  team2: string;
  title?: string;
  team1Score: number;
  team2Score: number;
  winner: string;
  completed: boolean;
  gameDate: string;
  lastUpdated: string;
}

export default function PredictionDetailPage({ params }: { params: Promise<{ id: string,sport: Sport }> }) {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const searchParams = useSearchParams();
  const sport: Sport = searchParams.get('sport') === 'cbb' ? 'cbb' : 'cfb';
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
    }
  }, [id]);

  useEffect(() => {
    if (!prediction) return;
    fetchResults();
  }, [prediction]);

  const fetchResults = async () => {
    try {
      const response = await fetch(`/api/results?sport=${sport}`);
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
      if (data.prediction.sport === 'cbb') {
        if(sport !== 'cbb') {
          router.push(`/dashboard?sport=cbb`);
          return;
        }
      } else {
        if(sport !== 'cfb') {
          router.push(`/dashboard?sport=cfb`);
          return;
        }
      }
      setPrediction(data.prediction);
    } catch (error) {
      console.error('Error fetching prediction:', error);
      router.push(`/dashboard?sport=${sport}`);
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

  type PickStatus = 'Correct' | 'Incorrect' | 'Not Played Yet';

  const findStoredResult = (
    round: string,
    team1: string,
    team2: string,
    title?: string
  ) =>
    results.find(
      (r) =>
        r.round === round &&
        ((r.team1 === team1 && r.team2 === team2) ||
          (r.team1 === team2 && r.team2 === team1) ||
          (!!r.title && r.title === title))
    );

  const getPickStatus = (
    round: string,
    team1: string,
    team2: string,
    predictionPick: string | undefined,
    title?: string
  ): PickStatus => {
    if (!predictionPick) return 'Not Played Yet';
    const result = findStoredResult(round, team1, team2, title);
    if (!result || !result.completed) return 'Not Played Yet';
    const w = (result.winner ?? '').trim();
    const p = predictionPick.trim();
    if (w === p) return 'Correct';
    return 'Incorrect';
  };

  const getOutlineClass = (
    round: string,
    team1: string,
    team2: string,
    predictionPick: string | undefined,
    title?: string
  ) => {
    const status = getPickStatus(round, team1, team2, predictionPick, title);
    if (status === 'Not Played Yet') return '';
    return status === 'Correct' ? 'ring-2 ring-green-500' : 'ring-2 ring-red-500';
  };

  const cbbChampionshipTitle =
    prediction.bracket.championship.title ?? 'NCAA Championship';

  if (sport === 'cbb') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar current="Prediction Details" />

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{prediction.name}</h2>
                <p className="mt-1 text-gray-500">
                  March Madness · Created {new Date(prediction.createdAt).toLocaleDateString()}
                </p>
                {(prediction.bracket.championship.predictedScore.team1Score !== 0 ||
                  prediction.bracket.championship.predictedScore.team2Score !== 0) && (
                  <p className="mt-2 text-sm text-gray-700">
                    Predicted final: {prediction.bracket.championship.team1}{' '}
                    {prediction.bracket.championship.predictedScore.team1Score} –{' '}
                    {prediction.bracket.championship.predictedScore.team2Score}{' '}
                    {prediction.bracket.championship.team2}
                  </p>
                )}
              </div>
              <div className="text-left sm:text-right">
                <div className="text-3xl font-bold text-blue-600">{prediction.score}</div>
                <div className="text-sm text-gray-500">points</div>
              </div>
            </div>
          </div>

          <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Results</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-3 text-lg font-semibold text-gray-900">Sweet 16</h4>
                <div className="space-y-2">
                  {prediction.bracket.firstRound.map((game, index) => (
                    <div
                      key={game.gameId}
                      className={`rounded-lg bg-gray-50 p-3 ${getOutlineClass('Sweet 16', game.team1, game.team2, game.prediction, game.title)}`}
                    >
                      <div className="mb-1 text-xs text-gray-500">Game {index + 1}</div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                          {game.team1} vs {game.team2}
                        </div>
                        <div>
                          {getPickStatus('Sweet 16', game.team1, game.team2, game.prediction, game.title) ===
                          'Correct' ? (
                            <Check size={24} className="text-green-500" />
                          ) : getPickStatus('Sweet 16', game.team1, game.team2, game.prediction, game.title) ===
                            'Incorrect' ? (
                            <X size={24} className="text-red-500" />
                          ) : (
                            <span className="text-gray-500">Not Played Yet</span>
                          )}
                        </div>
                      </div>
                      <div className="mt-1 text-sm font-semibold text-gray-900">
                        Winner: {game.prediction}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-lg font-semibold text-gray-900">Elite Eight</h4>
                <div className="space-y-2">
                  {prediction.bracket.quarterfinals.map((game, index) => (
                    <div
                      key={game.gameId}
                      className={`rounded-lg bg-gray-50 p-3 ${getOutlineClass(
                        'Elite Eight',
                        game.team1,
                        game.team2,
                        game.prediction,
                        game.title
                      )}`}
                    >
                      <div className="mb-1 text-xs text-gray-500">Game {index + 1}</div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                          {game.team1} vs {game.team2}
                        </div>
                        <div>
                          {getPickStatus(
                            'Elite Eight',
                            game.team1,
                            game.team2,
                            game.prediction,
                            game.title
                          ) === 'Correct' ? (
                            <Check size={24} className="text-green-500" />
                          ) : getPickStatus(
                              'Elite Eight',
                              game.team1,
                              game.team2,
                              game.prediction,
                              game.title
                            ) === 'Incorrect' ? (
                            <X size={24} className="text-red-500" />
                          ) : (
                            <span className="text-gray-500">Not Played Yet</span>
                          )}
                        </div>
                      </div>
                      <div className="mt-1 text-sm font-semibold text-gray-900">
                        Winner: {game.prediction}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-lg font-semibold text-gray-900">Final Four</h4>
                <div className="space-y-2">
                  {prediction.bracket.semifinals.map((game, index) => (
                    <div
                      key={game.gameId}
                      className={`rounded-lg bg-gray-50 p-3 ${getOutlineClass(
                        'Final Four',
                        game.team1,
                        game.team2,
                        game.prediction,
                        game.title
                      )}`}
                    >
                      <div className="mb-1 text-xs text-gray-500">Game {index + 1}</div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                          {game.team1} vs {game.team2}
                        </div>
                        <div>
                          {getPickStatus(
                            'Final Four',
                            game.team1,
                            game.team2,
                            game.prediction,
                            game.title
                          ) === 'Correct' ? (
                            <Check size={24} className="text-green-500" />
                          ) : getPickStatus(
                              'Final Four',
                              game.team1,
                              game.team2,
                              game.prediction,
                              game.title
                            ) === 'Incorrect' ? (
                            <X size={24} className="text-red-500" />
                          ) : (
                            <span className="text-gray-500">Not Played Yet</span>
                          )}
                        </div>
                      </div>
                      <div className="mt-1 text-sm font-semibold text-gray-900">
                        Winner: {game.prediction}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-lg font-semibold text-gray-900">Championship</h4>
                <div
                  className={`h-48 rounded-lg border-2 border-blue-200 bg-blue-50 p-4 ${getOutlineClass(
                    'Championship',
                    prediction.bracket.championship.team1,
                    prediction.bracket.championship.team2,
                    prediction.bracket.championship.prediction,
                    cbbChampionshipTitle
                  )}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="mb-2 text-sm text-gray-700">
                      {prediction.bracket.championship.team1} vs {prediction.bracket.championship.team2}
                    </div>
                    <div>
                      {getPickStatus(
                        'Championship',
                        prediction.bracket.championship.team1,
                        prediction.bracket.championship.team2,
                        prediction.bracket.championship.prediction,
                        cbbChampionshipTitle
                      ) === 'Correct' ? (
                        <Check size={24} className="text-green-500" />
                      ) : getPickStatus(
                          'Championship',
                          prediction.bracket.championship.team1,
                          prediction.bracket.championship.team2,
                          prediction.bracket.championship.prediction,
                          cbbChampionshipTitle
                        ) === 'Incorrect' ? (
                        <X size={24} className="text-red-500" />
                      ) : (
                        <span className="text-gray-500">Not Played Yet</span>
                      )}
                    </div>
                  </div>
                  <div className="mb-3 text-lg font-bold text-gray-900">
                    Winner: {prediction.bracket.championship.prediction}
                  </div>
                  <div className="flex justify-between border-t border-blue-200 pt-3">
                    <div>
                      <div className="mb-2 text-xs text-gray-600">Predicted final score</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {prediction.bracket.championship.prediction}:{' '}
                        {prediction.bracket.championship.predictedScore.team1Score}
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {prediction.bracket.championship.team2 === prediction.bracket.championship.prediction
                          ? prediction.bracket.championship.team1
                          : prediction.bracket.championship.team2}
                        : {prediction.bracket.championship.predictedScore.team2Score}
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 text-xs text-gray-600">Actual final score</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {(() => {
                          const result = findStoredResult(
                            'Championship',
                            prediction.bracket.championship.team1,
                            prediction.bracket.championship.team2,
                            cbbChampionshipTitle
                          );
                          if (result && result.completed) {
                            return (
                              <div>
                                {result.team1}: {result.team1Score}
                                <br />
                                {result.team2}: {result.team2Score}
                              </div>
                            );
                          }
                          return 'Not Played Yet';
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg bg-white shadow-sm">
            <BasketballBracket
              key={prediction._id}
              readOnly
              initialBracket={prediction.bracket}
              name={prediction.name}
            />
          </div>
        </main>
      </div>
    );
  }

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
                        {getPickStatus('firstRound', game.team1, game.team2, game.prediction) === 'Correct' ? (
                          <Check size={24} className="text-green-500" />
                        ) : getPickStatus('firstRound', game.team1, game.team2, game.prediction) === 'Incorrect' ? (
                          <X size={24} className="text-red-500" />
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
                    className={`p-3 bg-gray-50 rounded-lg ${getOutlineClass('quarterfinals', game.team1, game.team2, game.prediction, game.title)}`}
                  >
                    <div className="text-xs text-gray-500 mb-1">
                      Game {index + 1}
                    </div>
                    <div className='flex items-center justify-between'>
                      <div className="text-sm text-gray-700">
                        {game.team1} vs {game.team2}
                      </div>
                      <div>
                        {getPickStatus('quarterfinals', game.team1, game.team2, game.prediction, game.title) === 'Correct' ? (
                          <Check size={24} className="text-green-500" />
                        ) : getPickStatus('quarterfinals', game.team1, game.team2, game.prediction, game.title) === 'Incorrect' ? (
                          <X size={24} className="text-red-500" />
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
                    className={`p-3 bg-gray-50 rounded-lg ${getOutlineClass('semifinals', game.team1, game.team2, game.prediction, game.title)}`}
                  >
                    <div className="text-xs text-gray-500 mb-1">
                      Game {index + 1}
                    </div>
                    <div className='flex items-center justify-between'>
                      <div className="text-sm text-gray-700">
                        {game.team1} vs {game.team2}
                      </div>
                      <div>
                        {getPickStatus('semifinals', game.team1, game.team2, game.prediction, game.title) === 'Correct' ? (
                          <Check size={24} className="text-green-500" />
                        ) : getPickStatus('semifinals', game.team1, game.team2, game.prediction, game.title) === 'Incorrect' ? (
                          <X size={24} className="text-red-500" />
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
              <div className={`p-4 h-48 bg-blue-50 rounded-lg border-2 border-blue-200 ${getOutlineClass('championship', prediction.bracket.championship.team1, prediction.bracket.championship.team2, prediction.bracket.championship.prediction,prediction.bracket.championship.title)}`}>
                <div className='flex items-center justify-between'>
                  <div className="text-sm text-gray-700 mb-2">
                    {prediction.bracket.championship.team1} vs{' '}
                    {prediction.bracket.championship.team2}
                  </div>
                  <div>
                    {getPickStatus('championship', prediction.bracket.championship.team1, prediction.bracket.championship.team2, prediction.bracket.championship.prediction, prediction.bracket.championship.title) === 'Correct' ? (
                      <Check size={24} className="text-green-500" />
                    ) : getPickStatus('championship', prediction.bracket.championship.team1, prediction.bracket.championship.team2, prediction.bracket.championship.prediction, prediction.bracket.championship.title) === 'Incorrect' ? (
                      <X size={24} className="text-red-500" />
                    ) : (
                      <span className="text-gray-500">Not Played Yet</span>
                    )}
                  </div>
                </div>
                <div className="text-lg font-bold text-gray-900 mb-3">
                  Winner: {prediction.bracket.championship.prediction}
                </div>
                <div className="flex justify-between border-t border-blue-200 pt-3">
                  <div>
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
                  <div>
                    <div className="text-xs text-gray-600 mb-2">
                      Actual Final Score: 
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {(() => {
                        const result = findStoredResult(
                          'championship',
                          prediction.bracket.championship.team1,
                          prediction.bracket.championship.team2,
                          prediction.bracket.championship.title
                        );
                        if (result && result.completed) {
                          return (
                            <div>
                              {result.team1}: {result.team1Score}
                              <br />
                              {result.team2}: {result.team2Score}
                            </div>
                          );
                        }
                        return 'Not Played Yet';
                      })()}
                    </div>
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
