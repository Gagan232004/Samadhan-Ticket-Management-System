import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useSession } from '../lib/auth-client';
import axios from 'axios';

interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationManager() {
  const { data: session, isPending } = useSession();
  const welcomeShown = useRef(false);
  const fetchedNotifs = useRef(false);

  useEffect(() => {
    if (isPending) return;

    if (session?.user) {
      // 1. Welcome Toast
      if (!welcomeShown.current) {
        welcomeShown.current = true;
        toast.success(`Welcome back, ${session.user.name}!`, {
          duration: 4000,
          className: 'bg-white/95 backdrop-blur-3xl border border-indigo-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)] text-zinc-800 font-bold !px-6 !py-4 rounded-2xl',
          icon: '👋',
        });
      }

      // 2. Fetch persistent notifications
      if (!fetchedNotifs.current) {
        fetchedNotifs.current = true;
        const fetchNotifications = async () => {
          try {
            const res = await axios.get<Notification[]>('http://localhost:5000/api/notifications', {
              withCredentials: true,
            });
            
            res.data.forEach((notif) => {
              toast(notif.message, {
                duration: Number.POSITIVE_INFINITY, // keep until dismissed
                action: {
                  label: 'Dismiss',
                  onClick: async () => {
                    try {
                      await axios.post(`http://localhost:5000/api/notifications/${notif.id}/read`, {}, {
                        withCredentials: true,
                      });
                    } catch (e) {
                      console.error('Failed to dismiss notification', e);
                    }
                  }
                },
                className: 'bg-gradient-to-br from-indigo-50 to-white backdrop-blur-xl border border-indigo-100 text-indigo-950 font-semibold shadow-[0_12px_40px_-10px_rgba(99,102,241,0.2)] !px-5 !py-4 rounded-2xl',
                icon: '🔔'
              });
            });
          } catch (error) {
            console.error('Failed to fetch notifications', error);
          }
        };

        // Delay persistent notifications to pop up after the welcome toast
        setTimeout(fetchNotifications, 1200);
      }
    } else {
      // Reset if user logs out
      welcomeShown.current = false;
      fetchedNotifs.current = false;
    }
  }, [session, isPending]);

  return null;
}
