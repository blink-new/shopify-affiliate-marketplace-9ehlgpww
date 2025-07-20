import { User, Store, TrendingUp, Settings, LogOut } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { blink } from '../blink/client'
import type { User as UserType } from '../App'

interface NavigationProps {
  user: UserType
  currentPage: string
  onPageChange: (page: string) => void
}

export function Navigation({ user, currentPage, onPageChange }: NavigationProps) {
  const handleLogout = () => {
    blink.auth.logout()
  }

  const navItems = [
    ...(user.role === 'store_owner' || user.role === 'both' ? [
      { id: 'store-dashboard', label: 'Store Dashboard', icon: Store }
    ] : []),
    ...(user.role === 'creator' || user.role === 'both' ? [
      { id: 'creator-dashboard', label: 'Creator Dashboard', icon: TrendingUp }
    ] : []),
    { id: 'marketplace', label: 'Marketplace', icon: User },
    { id: 'profile', label: 'Settings', icon: Settings }
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-indigo-600">AffiliatePro</h1>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => onPageChange(item.id)}
                    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors ${
                      currentPage === item.id
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">{user.displayName}</span>
              <Badge variant="secondary" className="text-xs">
                {user.role === 'both' ? 'Store Owner & Creator' : 
                 user.role === 'store_owner' ? 'Store Owner' : 'Creator'}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2 transition-colors ${
                  currentPage === item.id
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}