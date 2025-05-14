"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, Search, Store } from "lucide-react"

interface Merchant {
  id: number
  name: string
  email: string
  phoneNumber: string
  status: string
  createdAt: string
}

export default function MerchantsPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        setIsLoading(true)
        const response = await api.get("/admin/merchants")
        setMerchants(response.data.merchants || [])
      } catch (error) {
        console.error("Failed to fetch merchants:", error)
        toast({
          title: "Error",
          description: "Failed to load merchants. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchMerchants()
  }, [toast])

  const filteredMerchants = merchants.filter(
    (merchant) =>
      merchant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      merchant.phoneNumber.includes(searchQuery) ||
      (merchant.email && merchant.email.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Merchants</h1>
          <p className="text-muted-foreground">Manage and monitor merchant accounts.</p>
        </div>
        <Button className="bg-primary hover:bg-primary-600">
          <Store className="mr-2 h-4 w-4" /> Add Merchant
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Merchants</CardTitle>
          <CardDescription>A list of all merchants in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search merchants..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          ) : filteredMerchants.length === 0 ? (
            <div className="py-4 text-center text-muted-foreground">No merchants found.</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMerchants.map((merchant) => (
                    <TableRow key={merchant.id}>
                      <TableCell className="font-medium">{merchant.name}</TableCell>
                      <TableCell>{merchant.phoneNumber}</TableCell>
                      <TableCell className="hidden md:table-cell">{merchant.email || "N/A"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            merchant.status === "active"
                              ? "default"
                              : merchant.status === "inactive"
                                ? "outline"
                                : "destructive"
                          }
                        >
                          {merchant.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{formatDate(merchant.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/merchants/${merchant.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
