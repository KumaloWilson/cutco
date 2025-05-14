"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Store, CreditCard, Settings, BarChart3, Bell, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"

const sidebarLinks = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/users",
    icon: Users,
  },
  {
    title: "Merchants",
    href: "/merchants",
    icon: Store,
  },
  {
    title: "Transactions",
    href: "/transactions",
    icon: CreditCard,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: Bell,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { logout, admin } = useAuth()

  return (
    <div className="flex h-screen flex-col border-r bg-card">
      <div className="p-6">
        <h1 className="text-2xl font-bold gradient-text">CUTcoin Admin</h1>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-primary-100 dark:hover:bg-primary-900/20 hover:text-foreground",
                )}
              >
                <link.icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "text-primary-500/70")} />
                <span>{link.title}</span>
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="mt-auto p-4">
        <div className="flex items-center gap-2 rounded-lg border p-4 gradient-border card-hover">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
            <span className="text-sm font-medium text-primary-foreground">{admin?.fullName?.charAt(0) || "A"}</span>
          </div>
          <div>
            <p className="text-sm font-medium">{admin?.fullName || "Admin User"}</p>
            <p className="text-xs text-muted-foreground">{admin?.role || "Administrator"}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="mt-4 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  )
}
