'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { DeleteDialog } from '@/components/delete-dialog';
import { NamePredictionModal } from '@/components/name-prediction-modal';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { Bracket } from '@/lib/models/prediction';
import { useSearchParams } from 'next/navigation';

export type Sport = 'cfb' | 'cbb';

interface Prediction {
  _id: string;
  name: string;
  score: number;
  createdAt: string;
  sport?: Sport;
  bracket: Bracket;
}

export default function DashboardPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [predictionToDelete, setPredictionToDelete] = useState<{ id: string; name: string } | null>(null);
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [cbbNameModalOpen, setCbbNameModalOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const sport: Sport = searchParams.get('sport') === 'cbb' ? 'cbb' : 'cfb';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [userRes, predictionsRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch(`/api/predictions?sport=${sport}`),
        ]);

        if (!userRes.ok) {
          if (!cancelled) router.push('/');
          return;
        }

        const userData = await userRes.json();
        if (!cancelled) {
          sessionStorage.setItem('userEmail', userData.user.email);
        }

        if (predictionsRes.ok && !cancelled) {
          const predictionsData = await predictionsRes.json();
          setPredictions(predictionsData.predictions);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sport, router]);

  const handleDeleteClick = (id: string, name: string) => {
    setPredictionToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!predictionToDelete) return;

    try {
      const res = await fetch(`/api/predictions/${predictionToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        setPredictions((prev) => prev.filter((p) => p._id !== predictionToDelete.id));
      }
    } catch (error) {
      console.error('Error deleting prediction:', error);
    } finally {
      setDeleteDialogOpen(false);
      setPredictionToDelete(null);
    }
  };

  const handleCfbNameSubmit = (name: string) => {
    const existingNames = predictions.map((p) => p.name.toLowerCase());
    if (existingNames.includes(name.toLowerCase())) {
      alert('There is already a prediction with that name. Please choose a different name.');
      return;
    }
    setNameModalOpen(false);
    router.push(`/create?name=${encodeURIComponent(name)}`);
  };

  const handleCbbNameSubmit = (name: string) => {
    const existingNames = predictions.map((p) => p.name.toLowerCase());
    if (existingNames.includes(name.toLowerCase())) {
      alert('There is already a prediction with that name. Please choose a different name.');
      return;
    }
    setCbbNameModalOpen(false);
    router.push(`/create-march-madness?name=${encodeURIComponent(name)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  const isCfb = sport === 'cfb';
  const cfbAtMax = predictions.length >= 5;
  const cbbAtMax = predictions.length >= 10;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar current="dashboard" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sport selector */}
        <div className="mb-6 flex gap-1 bg-white border border-gray-200 rounded-lg p-1 w-fit">
          <button
            onClick={() => router.push('/dashboard?sport=cfb')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isCfb
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🏈 College Football
          </button>
          <button
            onClick={() => router.push('/dashboard?sport=cbb')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              !isCfb
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🏀 March Madness
          </button>
        </div>

        {isCfb ? (
          <>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">My Predictions</h2>
                <p className="text-gray-600 mt-1">College Football Playoff bracket predictions</p>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setNameModalOpen(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={true}
                  >
                    Create New Prediction
                  </button>
                </TooltipTrigger>
                {cfbAtMax && (
                  <TooltipContent>You have reached the maximum of {cfbAtMax} predictions.</TooltipContent>
                )}
              </Tooltip>
            </div>

            {predictions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No predictions yet</h3>
                <p className="text-gray-600 mb-6">Create your first bracket prediction to get started!</p>
                <button
                  onClick={() => setNameModalOpen(true)}
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={true}
                >
                  Create Prediction
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {predictions.map((prediction) => (
                  <div
                    key={prediction._id}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{prediction.name}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(prediction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{prediction.score}</div>
                        <div className="text-xs text-gray-500">points</div>
                      </div>
                    </div>

                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">Championship Pick:</div>
                      <div className="font-semibold text-gray-900">
                        {prediction.bracket.championship.prediction}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/prediction/${prediction._id}?sport=${sport}`}
                        className="flex-1 text-center bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(prediction._id, prediction.name)}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">My Predictions</h2>
                <p className="text-gray-600 mt-1">March Madness Sweet 16 bracket predictions</p>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setCbbNameModalOpen(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={true}
                  >
                    Create bracket
                  </button>
                </TooltipTrigger>
                  <TooltipContent>Sweet 16 round has passed</TooltipContent>
              </Tooltip>
            </div>

            {predictions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No brackets yet</h3>
                <p className="text-gray-600 mb-6">
                  Name your bracket, then fill out the Sweet 16 through the championship.
                </p>
                <button
                  type="button"
                  onClick={() => setCbbNameModalOpen(true)}
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={true}
                >
                  Create bracket (Sweet 16 round has passed)
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {predictions.map((prediction) => (
                  <div
                    key={prediction._id}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{prediction.name}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(prediction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{prediction.score}</div>
                        <div className="text-xs text-gray-500">points</div>
                      </div>
                    </div>

                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">Championship Pick:</div>
                      <div className="font-semibold text-gray-900">
                        {prediction.bracket.championship.prediction}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/prediction/${prediction._id}?sport=${sport}`}
                        className="flex-1 text-center bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(prediction._id, prediction.name)}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        predictionName={predictionToDelete?.name}
      />

      <NamePredictionModal
        open={nameModalOpen}
        onOpenChange={setNameModalOpen}
        onSubmit={handleCfbNameSubmit}
      />

      <NamePredictionModal
        open={cbbNameModalOpen}
        onOpenChange={setCbbNameModalOpen}
        onSubmit={handleCbbNameSubmit}
      />
    </div>
  );
}
