'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import {  ChevronLeft, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

type Sport = 'cfb' | 'cbb';

interface LeaderboardEntry {
  _id: string;
  userName: string;
  name: string;
  score: number;
  createdAt: string;
  rank: number;
  isCurrentUser: boolean;
  bracket: {
    championship: {
      prediction: string;
    };
  };
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const searchParams = useSearchParams();
  const page = searchParams.get('page') ? parseInt(searchParams.get('page') || '1') : 1;
  const limit = leaderboard.length > 0 ? searchParams.get('limit') ? parseInt(searchParams.get('limit') || '5') : 5 : 5;
  const sport: Sport = searchParams.get('sport') === 'cbb' ? 'cbb' : 'cfb';
  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      const sportQuery = sport === 'cbb' ? '&sport=cbb' : '';
      const limitQuery = limit ? `&limit=${limit}` : '';
      const [userRes, leaderboardRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch(`/api/leaderboard?page=${page}${limitQuery}${sportQuery}`),
      ]);

      if (!userRes.ok) {
        router.push('/');
        return;
      }
      const userData = await userRes.json();
      sessionStorage.setItem('userEmail', userData.user.email);

      if (leaderboardRes.ok) {
        const data = await leaderboardRes.json();
        setLeaderboard(data.leaderboard);
        console.log(data.pagination);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }, [page, sport, router,limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  const isCfb = sport === 'cfb';

  // get score of 1st place prediction
  const firstPlaceScore = leaderboard[0]?.score;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar current="leaderboard"/>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex gap-1 bg-white border border-gray-200 rounded-lg p-1 w-fit">
          <button
            type="button"
            onClick={() => {
              router.push(`/leaderboard?sport=cfb`);
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isCfb
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🏈 College Football
          </button>
          <button
            type="button"
            onClick={() => {
              router.push(`/leaderboard?sport=cbb`);

            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              !isCfb
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🏀 March Madness
          </button>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Leaderboard</h2>
          <p className="text-gray-600 mt-1">
            {isCfb
              ? 'Top College Football Playoff predictions ranked by score'
              : 'Top March Madness bracket predictions ranked by score'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="md:hidden divide-y divide-gray-200">
            {leaderboard.length === 0 && (
              <div className="px-4 py-6 text-center text-gray-500">
                No predictions found
              </div>
            )}
            {leaderboard.map((entry) => (
              <div
                key={entry._id}
                className={`p-4 ${entry.isCurrentUser ? 'bg-blue-50' : 'bg-white'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center">
                      <span
                        className={`text-sm font-medium ${
                          entry.rank <= 3
                            ? 'text-blue-600 font-bold'
                            : 'text-gray-900'
                        }`}
                      >
                        #{entry.rank}
                      </span>
                      {(entry.rank === 1 || entry.score === firstPlaceScore) && (
                        <span className="ml-2 text-yellow-500">🏆</span>
                      )}
                    </div>
                    <div className="mt-1 text-base font-medium text-gray-900">
                      {entry.name}
                      {entry.isCurrentUser && (
                        <span className="ml-2 text-xs text-blue-600 font-medium">
                          (You)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {entry.score} pts
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-sm">
                  <p className="text-gray-700">
                    <span className="font-medium text-gray-900">Champion:</span>{' '}
                    {entry.bracket.championship.prediction}
                  </p>
                  <p className="text-gray-500">
                    Created {new Date(entry.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-3">
                  <Link
                    href={`/prediction/${entry._id}?sport=${sport}`}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prediction Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Championship Pick
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaderboard.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No predictions found
                    </td>
                  </tr>
                )}
                {leaderboard.map((entry) => (
                  <tr
                    key={entry._id}
                    className={entry.isCurrentUser ? 'bg-blue-50' : ''}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span
                          className={`text-sm font-medium ${
                            entry.rank <= 3
                              ? 'text-blue-600 font-bold'
                              : 'text-gray-900'
                          }`}
                        >
                          #{entry.rank}
                        </span>
                        {(entry.rank === 1 || entry.score === firstPlaceScore) && (
                          <span className="ml-2 text-yellow-500">🏆</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {entry.name}
                        {entry.isCurrentUser && (
                          <span className="ml-2 text-xs text-blue-600 font-medium">
                            (You)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {entry.score} pts
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {entry.bracket.championship.prediction}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`/prediction/${entry._id}?sport=${sport}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          
          <div className="flex items-center justify-end gap-4 border-t px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="hidden md:inline text-sm text-muted-foreground">
                Rows per page
              </span>
              <Select
                value={limit.toString()}
                onValueChange={(value) => {
                  router.push(`/leaderboard?limit=${value}&sport=${sport}`);
                }}
              >
                <SelectTrigger size="sm" className="w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="min-w-0 w-16 bg-white text-black">
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/leaderboard?limit=${limit}&sport=${sport}&page=${page - 1}`)}
              disabled={page === 1}
              className="gap-1"
            >
              <ChevronLeft className="size-4" />
              <span>Previous</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/leaderboard?limit=${limit}&sport=${sport}&page=${page + 1}`)}
              disabled={page === totalPages}
              className="gap-1"
            >
              <span>Next</span>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
