"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { useAuth } from "@/contexts/auth-context"
import { truncateAddress } from "@/lib/utils"

export default function Header() {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Button variant="outline" size="icon" className="md:hidden">
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        {user?.walletAddress && (
          <div className="hidden md:flex items-center gap-2">
            <div className="text-sm font-medium">Wallet:</div>
            <div className="text-sm text-muted-foreground">{truncateAddress(user.walletAddress)}</div>
          </div>
        )}
        <ModeToggle />
      </div>
    </header>
  )
}
