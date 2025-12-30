'use client'

import { useEffect, useState } from 'react'
import { Star, Trophy, Flame, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RewardNotificationProps {
  type: 'points' | 'badge' | 'streak' | 'level'
  title: string
  description?: string
  value?: string | number
  icon?: string
  onClose: () => void
  duration?: number
}

export function RewardNotification({
  type,
  title,
  description,
  value,
  icon,
  onClose,
  duration = 4000
}: RewardNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 10)

    // Auto dismiss
    const timeout = setTimeout(() => {
      setIsLeaving(true)
      setTimeout(onClose, 300)
    }, duration)

    return () => clearTimeout(timeout)
  }, [duration, onClose])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(onClose, 300)
  }

  const bgColors = {
    points: 'from-primary-500 to-primary-600',
    badge: 'from-amber-500 to-orange-500',
    streak: 'from-orange-500 to-red-500',
    level: 'from-purple-500 to-pink-500',
  }

  const icons = {
    points: <Star className="h-6 w-6" />,
    badge: icon ? <span className="text-2xl">{icon}</span> : <Trophy className="h-6 w-6" />,
    streak: <Flame className="h-6 w-6" />,
    level: <span className="text-2xl">🎉</span>,
  }

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 flex max-w-sm items-center gap-4 rounded-xl bg-gradient-to-r p-4 text-white shadow-lg transition-all duration-300',
        bgColors[type],
        isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
        {icons[type]}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-bold">{title}</span>
          {value && (
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-sm font-semibold">
              +{value}
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm text-white/80">{description}</p>
        )}
      </div>
      <button
        onClick={handleClose}
        className="rounded-lg p-1 hover:bg-white/20"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

// Notification manager
interface Notification {
  id: string
  type: 'points' | 'badge' | 'streak' | 'level'
  title: string
  description?: string
  value?: string | number
  icon?: string
}

let notificationQueue: Notification[] = []
let notifyListeners: (() => void)[] = []

export function showRewardNotification(notification: Omit<Notification, 'id'>) {
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  notificationQueue.push({ ...notification, id })
  notifyListeners.forEach(listener => listener())
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const listener = () => {
      setNotifications([...notificationQueue])
    }
    notifyListeners.push(listener)
    return () => {
      notifyListeners = notifyListeners.filter(l => l !== listener)
    }
  }, [])

  const removeNotification = (id: string) => {
    notificationQueue = notificationQueue.filter(n => n.id !== id)
    setNotifications([...notificationQueue])
  }

  return { notifications, removeNotification }
}

export function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications()

  return (
    <>
      {notifications.slice(0, 3).map((notification, index) => (
        <div
          key={notification.id}
          style={{ bottom: `${1 + index * 5}rem` }}
          className="fixed right-4 z-50"
        >
          <RewardNotification
            {...notification}
            onClose={() => removeNotification(notification.id)}
          />
        </div>
      ))}
    </>
  )
}
