"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut } from "lucide-react"

interface UserDropdownProps {
  email: string
  avatarUrl?: string
  handleLogout: () => void
}

export function UserDropdown({ email, avatarUrl, handleLogout }: UserDropdownProps) {

  // Get initials from email for avatar fallback
  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Avatar className="h-10 w-10 cursor-pointer">
          <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={email} />
          <AvatarFallback>{getInitials(email)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-2 bg-white shadow-lg border border-gray-200">
        <div className="px-3 py-2.5 mb-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Account</p>
          <p className="text-sm text-gray-900 font-medium truncate">{email}</p>
        </div>
        <div className="h-px bg-gray-200 my-1" />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700 rounded-md mx-1 px-3 py-2 transition-colors"
        >
          <LogOut className="mr-2.5 h-4 w-4" />
          <span className="font-medium">Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
