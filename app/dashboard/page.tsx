'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { DeleteDialog } from '@/components/delete-dialog';
import { NamePredictionModal } from '@/components/name-prediction-modal';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Prediction {
  _id: string;
  name: string;
  score: number;
  createdAt: string;
  bracket: {
    championship: {
      prediction: string;
    };
  };
}

export default function DashboardPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [predictionNames, setPredictionNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [predictionToDelete, setPredictionToDelete] = useState<{ id: string; number: number } | null>(null);
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  },[]);

  const fetchData = async () => {
    try {
      const [userRes, predictionsRes, namesRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/predictions'),
        fetch('/api/predictions/names'),
      ]);

      if (!userRes.ok) {
        router.push('/');
        return;
      }

      if (predictionsRes.ok) {
        const predictionsData = await predictionsRes.json();
        setPredictions(predictionsData.predictions);
      }
      if (namesRes.ok) {
        const namesData = await namesRes.json();
        console.log('Fetched prediction names response:', namesData);
        setPredictionNames(namesData.predictions.map((p: {_id:string, name:string}) => p.name));
        console.log('Fetched prediction names:', namesData.predictions.map((p: {_id:string, name:string}) => p.name));
      }else{
        console.error('Failed to fetch prediction names');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string, number: number) => {
    setPredictionToDelete({ id, number });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!predictionToDelete) return;

    try {
      const res = await fetch(`/api/predictions/${predictionToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        setPredictions(predictions.filter((p) => p._id !== predictionToDelete.id));
      }
    } catch (error) {
      console.error('Error deleting prediction:', error);
    } finally {
      setDeleteDialogOpen(false);
      setPredictionToDelete(null);
    }
  };

  const handleNameSubmit = (name: string) => {
    const existingNames = predictionNames.map((p) => p.toLowerCase());
    if (existingNames.includes(name.toLowerCase())) {
      alert('There is already a prediction with that name. Please choose a different name.');
      return;
    }
    setNameModalOpen(false);
    router.push(`/create?name=${encodeURIComponent(name)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar current="dashboard" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">My Predictions</h2>
            <p className="text-gray-600 mt-1">
              Create and manage your playoff bracket predictions
            </p>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setNameModalOpen(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={predictions.length >= 5}
              >
                Create New Prediction
              </button>
            </TooltipTrigger>
            
            {predictions.length >=1 && (
              <TooltipContent>
                You have reached the maximum of 5 predictions.
              </TooltipContent>
            )}
          </Tooltip>
        </div>

        {predictions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No predictions yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first bracket prediction to get started!
            </p>
            <button
              onClick={() => setNameModalOpen(true)}
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Create Prediction
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {predictions.map((prediction, index) => (
              <div
                key={prediction._id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {prediction.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(prediction.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {prediction.score}
                    </div>
                    <div className="text-xs text-gray-500">points</div>
                  </div>
                </div>

                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">
                    Championship Pick:
                  </div>
                  <div className="font-semibold text-gray-900">
                    {prediction.bracket.championship.prediction}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/prediction/${prediction._id}`}
                    className="flex-1 text-center bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(prediction._id, predictions.length - index)}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        predictionNumber={predictionToDelete?.number}
      />

      <NamePredictionModal
        open={nameModalOpen}
        onOpenChange={setNameModalOpen}
        onSubmit={handleNameSubmit}
      />
    </div>
  );
}
