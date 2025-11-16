import { useState, useEffect } from 'react';
import { NotificationService, SystemNotification } from '@/src/core/system/NotificationService';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);

  useEffect(() => {
    const unsubscribe = NotificationService.subscribe(setNotifications);
    setNotifications(NotificationService.getAll());
    return unsubscribe;
  }, []);

  return {
    notifications,
    unreadCount: NotificationService.getUnreadCount(),
    markAsRead: (id: string) => NotificationService.markAsRead(id),
    markAllAsRead: () => NotificationService.markAllAsRead(),
    deleteNotification: (id: string) => NotificationService.delete(id),
    notify: (notification: Omit<SystemNotification, 'id' | 'timestamp' | 'read'>) => 
      NotificationService.notify(notification)
  };
};
