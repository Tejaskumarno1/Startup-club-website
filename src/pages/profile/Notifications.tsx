
import React, { useState, useEffect } from "react";
import { PageTemplate } from "@/components/common/PageTemplate";
import { Bell, Calendar, UserPlus, MessageSquare, FileCheck, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Notification } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";

const Notifications = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        setNotifications(data as Notification[]);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        toast({
          title: "Error",
          description: "Failed to load notifications. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.id) {
      fetchNotifications();
    }
  }, [user, toast]);
  
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      
      if (error) {
        throw error;
      }
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true } 
            : notif
        )
      );
      
      toast({
        title: "Notification Updated",
        description: "Notification marked as read.",
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast({
        title: "Error",
        description: "Failed to update notification. Please try again later.",
        variant: "destructive",
      });
    }
  };
  
  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter(notif => !notif.is_read)
        .map(notif => notif.id);
      
      if (unreadIds.length === 0) return;
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', unreadIds);
      
      if (error) {
        throw error;
      }
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      
      toast({
        title: "All Notifications Read",
        description: "All notifications have been marked as read.",
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast({
        title: "Error",
        description: "Failed to update notifications. Please try again later.",
        variant: "destructive",
      });
    }
  };
  
  // Filter notifications by read status
  const unreadNotifications = notifications.filter(notif => !notif.is_read);
  const readNotifications = notifications.filter(notif => notif.is_read);
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'connection':
        return <UserPlus className="h-5 w-5 text-green-500" />;
      case 'message':
        return <MessageSquare className="h-5 w-5 text-purple-500" />;
      case 'document':
        return <FileCheck className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };
  
  return (
    <PageTemplate
      title="Notifications"
      description="Stay updated with all your notifications and alerts."
      icon={Bell}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Your Notifications</h2>
        {unreadNotifications.length > 0 && (
          <Button variant="ghost" onClick={markAllAsRead}>
            <Check className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>
      
      <Tabs defaultValue="unread" className="space-y-4">
        <TabsList>
          <TabsTrigger value="unread">
            Unread
            {unreadNotifications.length > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs">
                {unreadNotifications.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
        
        <TabsContent value="unread" className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <p>Loading notifications...</p>
            </div>
          ) : unreadNotifications.length === 0 ? (
            <Card className="p-6 text-center">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">You're all caught up! No unread notifications.</p>
            </Card>
          ) : (
            unreadNotifications.map(notification => (
              <Card key={notification.id} className={notification.is_read ? 'bg-gray-50' : 'bg-white'}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="mt-1">
                      {getNotificationIcon(notification.notification_type)}
                    </div>
                    <div className="flex-1">
                      <p>{notification.content}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="self-start text-xs"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <p>Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <Card className="p-6 text-center">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">You don't have any notifications yet.</p>
            </Card>
          ) : (
            <>
              {notifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  {index > 0 && new Date(notifications[index-1].created_at).toDateString() !== new Date(notification.created_at).toDateString() && (
                    <div className="relative my-6">
                      <Separator />
                      <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-500">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {index === 0 && (
                    <div className="relative my-6">
                      <Separator />
                      <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-500">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <Card key={notification.id} className={notification.is_read ? 'bg-gray-50' : 'bg-white'}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="mt-1">
                          {getNotificationIcon(notification.notification_type)}
                        </div>
                        <div className="flex-1">
                          <p>{notification.content}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="self-start text-xs"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </React.Fragment>
              ))}
            </>
          )}
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
};

export default Notifications;
