"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Wallet, ArrowDownUp, History, Settings, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/transactions", label: "Transactions", icon: History },
  { href: "/deposits", label: "Deposits", icon: ArrowDownUp },
  { href: "/settings", label: "Settings", icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { logout, user } = useAuth()

  return (
    <div className="hidden md:flex md:flex-col md:w-64 md:bg-card md:border-r">
      <div className="flex items-center justify-center h-16 border-b">
        <h1 className="text-xl font-bold">CUTcoin Merchant</h1>
      </div>

      <div className="flex flex-col justify-between flex-1 px-4 py-6">
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={pathname === item.href ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  pathname === item.href ? "bg-primary text-primary-foreground" : "",
                )}
              >
                <item.icon className="mr-2 h-5 w-5" />
                {item.label}
              </Button>
            </Link>
          ))}
        </div>

        <div className="space-y-4">
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-muted-foreground">MERCHANT</p>
            <p className="text-sm font-medium truncate">{user?.merchantName}</p>
          </div>

          <Button variant="outline" className="w-full justify-start" onClick={logout}>
            <LogOut className="mr-2 h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}
