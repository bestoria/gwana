// Centralized notification service
export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  category: 'civic' | 'learning' | 'emergency' | 'system' | 'achievement';
  actionUrl?: string;
}

class NotificationServiceClass {
  private listeners: Set<(notifications: SystemNotification[]) => void> = new Set();
  private notifications: SystemNotification[] = [];

  subscribe(callback: (notifications: SystemNotification[]) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(notification: Omit<SystemNotification, 'id' | 'timestamp' | 'read'>) {
    const newNotification: SystemNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };
    
    this.notifications = [newNotification, ...this.notifications];
    this.notifyListeners();
    
    // Browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(newNotification.title, {
        body: newNotification.message,
        icon: '/favicon.ico'
      });
    }
  }

  markAsRead(id: string) {
    this.notifications = this.notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    this.notifyListeners();
  }

  markAllAsRead() {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
    this.notifyListeners();
  }

  delete(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  getAll() {
    return [...this.notifications];
  }

  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback([...this.notifications]));
  }
}

export const NotificationService = new NotificationServiceClass();
