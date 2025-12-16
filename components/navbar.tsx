import { Trophy } from "lucide-react";
import Link from "next/link";

export function Navbar(current: {current: string}) {
    return(
        <div className="flex items-center gap-8">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h1 className="text-2xl font-bold text-gray-900">
              Bracket-IQ
            </h1>
            <div className="hidden md:flex gap-6">
              <Link
                href="/dashboard"
                className={current.current === "dashboard" ? "text-blue-600 font-medium hover:text-blue-700" : "text-gray-600 hover:text-gray-900"}
              >
                My Predictions
              </Link>
              <Link
                href="/leaderboard"
                className={current.current === "leaderboard" ? "text-blue-600 font-medium hover:text-blue-700" : "text-gray-600 hover:text-gray-900"}
              >
                Leaderboard
              </Link>
            </div>
        </div>
    )
}