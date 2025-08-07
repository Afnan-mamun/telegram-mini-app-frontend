import { Outlet, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  Home, 
  DollarSign, 
  CreditCard, 
  History, 
  User,
  Coins
} from 'lucide-react'

const Layout = () => {
  const { user } = useAuth()
  const location = useLocation()

  const navigationItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/earn', icon: DollarSign, label: 'Earn' },
    { path: '/withdraw', icon: CreditCard, label: 'Withdraw' },
    { path: '/history', icon: History, label: 'History' },
  ]

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                {user?.profile_photo_url ? (
                  <img 
                    src={user.profile_photo_url} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-sm font-semibold text-gray-900">
                  {user?.first_name || user?.username || 'User'}
                </h1>
                <p className="text-xs text-gray-500">
                  @{user?.username || 'telegram_user'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-full">
              <Coins className="w-4 h-4" />
              <span className="text-sm font-semibold">
                ৳{user?.balance?.toFixed(2) || '0.00'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6 pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-white/20">
        <div className="max-w-md mx-auto px-4">
          <div className="flex items-center justify-around py-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-all duration-200 ${
                    active
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'scale-110' : ''} transition-transform`} />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
    </div>
  )
}

export default Layout

