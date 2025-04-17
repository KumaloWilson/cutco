"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, LayoutDashboard, Wallet, ArrowDownUp, History, Settings, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { ModeToggle } from "@/components/mode-toggle"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/transactions", label: "Transactions", icon: History },
  { href: "/deposits", label: "Deposits", icon: ArrowDownUp },
  { href: "/settings", label: "Settings", icon: Settings },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { logout, user } = useAuth()

  // Get the current page title
  const currentPage = navItems.find((item) => item.href === pathname)?.label || "Dashboard"

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 border-b bg-background">
      <div className="flex items-center">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-center h-16 border-b">
                <h1 className="text-xl font-bold">CUTcoin Merchant</h1>
              </div>

              <div className="flex flex-col justify-between flex-1 px-4 py-6">
                <div className="space-y-1">
                  {navItems.map((item) => (
                    <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                      <Button variant={pathname === item.href ? "default" : "ghost"} className="w-full justify-start">
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
          </SheetContent>
        </Sheet>

        <h1 className="ml-2 text-xl font-semibold md:ml-0">{currentPage}</h1>
      </div>

      <div className="flex items-center space-x-2">
        <ModeToggle />
      </div>
    </header>
  )
}
