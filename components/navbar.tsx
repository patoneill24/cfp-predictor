"use client";
import { Trophy, Menu } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSyncExternalStore, useState, useEffect } from "react";
import { UserDropdown } from "./user-dropdown";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

interface NavbarProps {
  current: string;
}

function getEmailSnapshot() {
  return sessionStorage.getItem('userEmail') || '';
}

function getServerSnapshot() {
  return '';
}

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

export function Navbar({ current }: NavbarProps) {
  const router = useRouter();
  const email = useSyncExternalStore(subscribe, getEmailSnapshot, getServerSnapshot);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (email === '' || email === null) {
      // If no email is found, redirect to home
      router.push('/');
    }
  }, [email, router]);

  const handleLogout = async () => {
    sessionStorage.removeItem('userEmail');
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

    return(
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Desktop Layout */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-8">
                <Trophy className="w-8 h-8 text-yellow-500" />
                <h1 className="text-2xl font-bold text-gray-900">
                  Bracket-IQ
                </h1>
                <div className="flex gap-6">
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

            {/* Mobile Logo - Centered */}
            <div className="md:hidden flex-1 flex justify-center items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <h1 className="text-xl font-bold text-gray-900">
                Bracket-IQ
              </h1>
            </div>

            {/* Desktop User Dropdown */}
            <div className="hidden md:flex items-center gap-4">
              <UserDropdown email={email} handleLogout={handleLogout} />
            </div>

            {/* Mobile Hamburger Menu */}
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger className="inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-gray-100 transition-colors">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </SheetTrigger>
                <SheetContent side="right" className="w-3/4 sm:max-w-sm">
                  <SheetHeader className="mb-6">
                    <SheetTitle className="flex items-center gap-2 text-lg font-semibold">
                      <Trophy className="w-6 h-6 text-yellow-500" />
                      Bracket-IQ
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-6">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className={current === "dashboard" ? "text-blue-600 font-medium text-lg" : "text-gray-600 text-lg hover:text-gray-900"}
                    >
                      My Predictions
                    </Link>
                    <Link
                      href="/leaderboard"
                      onClick={() => setIsOpen(false)}
                      className={current === "leaderboard" ? "text-blue-600 font-medium text-lg" : "text-gray-600 text-lg hover:text-gray-900"}
                    >
                      Leaderboard
                    </Link>
                    <div className="pt-4 border-t">
                      <UserDropdown email={email} handleLogout={handleLogout} />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
    )
}