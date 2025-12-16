import { Trophy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

interface NavbarProps {
  current: string;
}

export function Navbar({ current }: NavbarProps) {
  const email = sessionStorage.getItem('userEmail') || '';
  const router = useRouter();
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };
    return(
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-8">
                <Trophy className="w-8 h-8 text-yellow-500" />
                <h1 className="text-2xl font-bold text-gray-900">
                  Bracket-IQ
                </h1>
                <div className="hidden md:flex gap-6">
                  <Link
                    href="/dashboard"
                    className={current === "dashboard" ? "text-blue-600 font-medium hover:text-blue-700" : "text-gray-600 hover:text-gray-900"}
                  >
                    My Predictions
                  </Link>
                  <Link
                    href="/leaderboard"
                    className={current === "leaderboard" ? "text-blue-600 font-medium hover:text-blue-700" : "text-gray-600 hover:text-gray-900"}
                  >
                    Leaderboard
                  </Link>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{email}</span>
              <Button
                onClick={handleLogout}
                className="bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>
    )
}