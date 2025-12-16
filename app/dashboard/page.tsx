'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trophy } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { DeleteDialog } from '@/components/delete-dialog';

interface Prediction {
  _id: string;
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
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [predictionToDelete, setPredictionToDelete] = useState<{ id: string; number: number } | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  },[]);

  const fetchData = async () => {
    try {
      const [userRes, predictionsRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/predictions'),
      ]);

      if (!userRes.ok) {
        router.push('/');
        return;
      }

      const userData = await userRes.json();
      setUser(userData.user);

      if (predictionsRes.ok) {
        const predictionsData = await predictionsRes.json();
        setPredictions(predictionsData.predictions);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Navbar current="dashboard" />
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">My Predictions</h2>
            <p className="text-gray-600 mt-1">
              Create and manage your playoff bracket predictions
            </p>
          </div>
          <Link
            href="/create"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Create New Prediction
          </Link>
        </div>

        {predictions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No predictions yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first bracket prediction to get started!
            </p>
            <Link
              href="/create"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Create Prediction
            </Link>
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
                      Prediction #{predictions.length - index}
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
    </div>
  );
}
