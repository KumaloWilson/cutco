"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Wallet, History, Download, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Wallet",
    href: "/wallet",
    icon: Wallet,
  },
  {
    title: "Transactions",
    href: "/transactions",
    icon: History,
  },
  {
    title: "Deposits",
    href: "/deposits",
    icon: Download,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { logout, user } = useAuth()

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4 h-16 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-xl font-bold">CUTcoin Merchant</h1>
        </div>
        <div className="flex flex-col flex-grow px-4 pt-5 pb-4">
          <div className="mb-5 px-4">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Merchant</div>
            <div className="text-base font-semibold truncate">{user?.name}</div>
          </div>
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center px-4 py-2 text-sm font-medium rounded-md",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
                )}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-800 p-4">
          <button
            onClick={logout}
            className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
