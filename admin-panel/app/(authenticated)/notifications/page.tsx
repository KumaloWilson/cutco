"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { formatDateTime } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Check, Megaphone, Send, Trash2, Users } from "lucide-react"

interface Notification {
  id: number
  title: string
  message: string
  type: string
  status: string
  createdAt: string
  recipients?: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true)
        const response = await api.get("/admin/notifications")
        setNotifications(response.data.notifications || [])
      } catch (error) {
        console.error("Failed to fetch notifications:", error)
        toast({
          title: "Error",
          description: "Failed to load notifications. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [toast])

  const markAsRead = async (id: number) => {
    try {
      await api.put(`/admin/notifications/${id}/read`)
      setNotifications(
        notifications.map((notification) =>
          notification.id === id ? { ...notification, status: "read" } : notification,
        ),
      )
      toast({
        title: "Notification marked as read",
        description: "The notification has been marked as read.",
      })
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark notification as read. Please try again.",
        variant: "destructive",
      })
    }
  }

  const deleteNotification = async (id: number) => {
    try {
      await api.delete(`/admin/notifications/${id}`)
      setNotifications(notifications.filter((notification) => notification.id !== id))
      toast({
        title: "Notification deleted",
        description: "The notification has been deleted.",
      })
    } catch (error) {
      console.error("Failed to delete notification:", error)
      toast({
        title: "Error",
        description: "Failed to delete notification. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "system":
        return <Bell className="h-4 w-4" />
      case "user":
        return <Users className="h-4 w-4" />
      case "announcement":
        return <Megaphone className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const renderNotificationList = (status: string) => {
    const filteredNotifications = notifications.filter((notification) => notification.status === status)

    if (isLoading) {
      return (
        <div className="flex h-40 items-center justify-center">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        </div>
      )
    }

    if (filteredNotifications.length === 0) {
      return <div className="py-4 text-center text-muted-foreground">No notifications found.</div>
    }

    return (
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <Card key={notification.id}>
            <CardHeader className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <CardTitle className="text-base">{notification.title}</CardTitle>
                </div>
                <Badge variant={notification.status === "read" ? "outline" : "default"}>{notification.status}</Badge>
              </div>
              <CardDescription className="mt-1 text-xs">
                {formatDateTime(notification.createdAt)}
                {notification.recipients && ` • Recipients: ${notification.recipients}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-sm">{notification.message}</p>
              <div className="mt-4 flex justify-end gap-2">
                {notification.status === "unread" && (
                  <Button variant="outline" size="sm" onClick={() => markAsRead(notification.id)}>
                    <Check className="mr-2 h-4 w-4" /> Mark as Read
                  </Button>
                )}
                <Button variant="destructive" size="sm" onClick={() => deleteNotification(notification.id)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Notifications</h1>
          <p className="text-muted-foreground">Manage system notifications and announcements.</p>
        </div>
        <Button className="bg-primary hover:bg-primary-600">
          <Send className="mr-2 h-4 w-4" /> Send Notification
        </Button>
      </div>

      <Tabs defaultValue="unread">
        <TabsList className="mb-4 grid w-full grid-cols-2">
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="read">Read</TabsTrigger>
        </TabsList>
        <TabsContent value="unread">{renderNotificationList("unread")}</TabsContent>
        <TabsContent value="read">{renderNotificationList("read")}</TabsContent>
      </Tabs>
    </div>
  )
}
