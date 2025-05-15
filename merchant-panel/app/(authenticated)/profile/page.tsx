"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { merchantProfile } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Building, MapPin, User, Phone, Mail, Calendar, Shield, Edit2, Save, X, Loader2 } from "lucide-react"

interface ProfileData {
  id: number
  userId: number
  merchantNumber: string
  name: string
  location: string
  description: string
  contactPerson: string
  contactPhone: string
  email: string
  status: string
  isActive: boolean
  lastLogin: string
  createdAt: string
  updatedAt: string
  user: {
    studentId: string
    firstName: string
    lastName: string
    phoneNumber: string
  }
}

export default function ProfilePage() {
  const { merchant } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    description: "",
    contactPhone: "",
    email: "",
  })
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true)
        const data = await merchantProfile.get()
        setProfile(data)
        setEditData({
          description: data.description,
          contactPhone: data.contactPhone,
          email: data.email,
        })
      } catch (error) {
        console.error("Failed to fetch profile:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile data. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [toast])

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing, reset form
      setEditData({
        description: profile?.description || "",
        contactPhone: profile?.contactPhone || "",
        email: profile?.email || "",
      })
    }
    setIsEditing(!isEditing)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await merchantProfile.update(editData)

      // Update local state
      if (profile) {
        setProfile({
          ...profile,
          description: editData.description,
          contactPhone: editData.contactPhone,
          email: editData.email,
        })
      }

      setIsEditing(false)
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      console.error("Failed to update profile:", error)
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Merchant Profile</h1>
          <p className="text-muted-foreground">View and manage your merchant account details</p>
        </div>
        {!isEditing ? (
          <Button onClick={handleEditToggle} className="mt-4 md:mt-0">
            <Edit2 className="mr-2 h-4 w-4" /> Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button variant="outline" onClick={handleEditToggle}>
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Your merchant account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center text-muted-foreground text-sm">
                    <Building className="h-4 w-4 mr-2" />
                    Business Name
                  </div>
                  <p className="font-medium text-lg">{profile?.name}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-muted-foreground text-sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    Location
                  </div>
                  <p className="font-medium">{profile?.location}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-muted-foreground text-sm">
                    <User className="h-4 w-4 mr-2" />
                    Contact Person
                  </div>
                  <p className="font-medium">{profile?.contactPerson}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-muted-foreground text-sm">
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Phone
                  </div>
                  {isEditing ? (
                    <Input
                      name="contactPhone"
                      value={editData.contactPhone}
                      onChange={handleInputChange}
                      placeholder="Contact phone number"
                    />
                  ) : (
                    <p className="font-medium">{profile?.contactPhone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-muted-foreground text-sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Address
                  </div>
                  {isEditing ? (
                    <Input
                      name="email"
                      value={editData.email}
                      onChange={handleInputChange}
                      placeholder="Email address"
                      type="email"
                    />
                  ) : (
                    <p className="font-medium">{profile?.email}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center text-muted-foreground text-sm">
                    <Shield className="h-4 w-4 mr-2" />
                    Merchant Number
                  </div>
                  <p className="font-medium text-primary">{profile?.merchantNumber}</p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center text-muted-foreground text-sm">Description</div>
                  {isEditing ? (
                    <Textarea
                      name="description"
                      value={editData.description}
                      onChange={handleInputChange}
                      placeholder="Business description"
                      className="min-h-[100px]"
                    />
                  ) : (
                    <p>{profile?.description}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    profile?.status === "approved"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                  }`}
                >
                  {profile?.status?.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Active</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    profile?.isActive
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {profile?.isActive ? "YES" : "NO"}
                </span>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center text-muted-foreground text-sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Registered On
                </div>
                <p className="font-medium">{profile?.createdAt ? formatDate(profile.createdAt) : "N/A"}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-muted-foreground text-sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Last Login
                </div>
                <p className="font-medium">{profile?.lastLogin ? formatDate(profile.lastLogin) : "N/A"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    Change Password
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>
                      Enter your current password and a new password to update your credentials.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Update Password</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    Enable Two-Factor Authentication
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Two-Factor Authentication</DialogTitle>
                    <DialogDescription>
                      Enhance your account security by enabling two-factor authentication.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Two-factor authentication adds an extra layer of security to your account by requiring a
                      verification code in addition to your password.
                    </p>
                    <div className="flex justify-center mb-4">
                      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                        <p className="text-center text-sm mb-2">Scan this QR code with your authenticator app</p>
                        <div className="w-40 h-40 bg-gray-200 dark:bg-gray-700 mx-auto"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="verification-code">Verification Code</Label>
                      <Input id="verification-code" placeholder="Enter 6-digit code" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Verify and Enable</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
