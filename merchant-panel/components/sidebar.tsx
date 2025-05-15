"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  Settings,
  Store,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Plus,
} from "lucide-react"

interface SidebarItemProps {
  icon: React.ReactNode
  title: string
  href: string
  isActive: boolean
  isCollapsed: boolean
  onClick?: () => void
}

function SidebarItem({ icon, title, href, isActive, isCollapsed, onClick }: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
        isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
      onClick={onClick}
    >
      {icon}
      {!isCollapsed && <span>{title}</span>}
    </Link>
  )
}

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const { merchant, logout } = useAuth()

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  const sidebarItems = [
    {
      icon: <LayoutDashboard className="h-5 w-5" />,
      title: "Dashboard",
      href: "/dashboard",
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      title: "Transactions",
      href: "/transactions",
    },
    {
      icon: <Wallet className="h-5 w-5" />,
      title: "Wallet",
      href: "/wallet",
    },
    {
      icon: <User className="h-5 w-5" />,
      title: "Profile",
      href: "/profile",
    },
    {
      icon: <Settings className="h-5 w-5" />,
      title: "Settings",
      href: "/settings",
    },
  ]

  return (
    <div
      className={`relative flex flex-col border-r bg-card transition-all duration-300 ${
        isCollapsed ? "w-[70px]" : "w-[240px]"
      }`}
    >
      <div className="flex h-14 items-center px-3 border-b">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <Store className="h-4 w-4 text-primary" />
          </div>
          {!isCollapsed && <span className="font-semibold">CUTcoin Merchant</span>}
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-16 h-6 w-6 rounded-full border bg-background shadow-sm"
        onClick={toggleCollapse}
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      <ScrollArea className="flex-1 py-4">
        <div className="px-3 space-y-1">
          {sidebarItems.map((item) => (
            <SidebarItem
              key={item.href}
              icon={item.icon}
              title={item.title}
              href={item.href}
              isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
              isCollapsed={isCollapsed}
            />
          ))}

          {/* Add special item for deposit */}
          {pathname.includes("/wallet") && (
            <div className="pt-2 pb-1">
              {!isCollapsed && <div className="text-xs text-muted-foreground px-3 mb-2">Wallet Actions</div>}
              <SidebarItem
                icon={<Plus className="h-5 w-5" />}
                title="Deposit Funds"
                href="/wallet/deposit"
                isActive={pathname === "/wallet/deposit"}
                isCollapsed={isCollapsed}
              />
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="mt-auto border-t p-3">
        {!isCollapsed && merchant && (
          <div className="mb-4 px-2">
            <p className="text-sm font-medium truncate">{merchant.name}</p>
            <p className="text-xs text-muted-foreground truncate">{merchant.merchantNumber}</p>
          </div>
        )}
        <Button
          variant="ghost"
          className={`w-full justify-${isCollapsed ? "center" : "start"} text-muted-foreground hover:text-foreground`}
          onClick={logout}
        >
          <LogOut className="h-5 w-5 mr-2" />
          {!isCollapsed && "Sign Out"}
        </Button>
      </div>
    </div>
  )
}
