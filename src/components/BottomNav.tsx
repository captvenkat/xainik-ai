'use client'

import { useRouter, usePathname } from 'next/navigation'
import { FileText, BarChart3, Users, Activity } from 'lucide-react'

export default function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()

  const navItems = [
    {
      id: 'pitch',
      label: 'Pitch',
      icon: FileText,
      href: '/dashboard/veteran'
    },
    {
      id: 'stories',
      label: 'Stories',
      icon: BarChart3,
      href: '/dashboard/veteran/stories'
    },
    {
      id: 'supporters',
      label: 'Supporters',
      icon: Users,
      href: '/dashboard/veteran/supporters'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: Activity,
      href: '/dashboard/veteran/analytics'
    }
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard/veteran') {
      return pathname === '/dashboard/veteran' || pathname.startsWith('/dashboard/veteran?')
    }
    return pathname === href
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-[480px] mx-auto px-4">
        <nav className="flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.href)}
                className={`flex flex-col items-center justify-center py-3 px-4 min-h-[44px] transition-colors ${
                  active 
                    ? 'text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className={`w-6 h-6 mb-1 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="text-xs font-medium">{item.label}</span>
                {active && (
                  <div className="w-1 h-1 bg-blue-600 rounded-full mt-1"></div>
                )}
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
