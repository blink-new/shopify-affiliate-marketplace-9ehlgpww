import { useState, useEffect } from 'react'
import { blink } from './blink/client'
import { LandingPage } from './pages/LandingPage'
import { StoreOwnerDashboard } from './pages/StoreOwnerDashboard'
import { CreatorDashboard } from './pages/CreatorDashboard'
import { ProductMarketplace } from './pages/ProductMarketplace'
import { ProfileSettings } from './pages/ProfileSettings'
import { Navigation } from './components/Navigation'
import { Toaster } from './components/ui/toaster'

export interface User {
  id: string
  email: string
  displayName?: string
  role: 'store_owner' | 'creator' | 'both'
  shopifyStoreUrl?: string
}

function App() {
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState<string>('landing')

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged(async (state) => {
      setUser(state.user)
      setLoading(state.isLoading)
      
      if (state.user) {
        // Fetch user profile from database
        try {
          const profiles = await blink.db.users.list({
            where: { id: state.user.id },
            limit: 1
          })
          
          if (profiles.length > 0) {
            const profile = profiles[0]
            setUserProfile({
              id: profile.id,
              email: profile.email,
              displayName: profile.display_name,
              role: profile.role,
              shopifyStoreUrl: profile.shopify_store_url
            })
            
            // Set default page based on role
            if (profile.role === 'store_owner') {
              setCurrentPage('store-dashboard')
            } else if (profile.role === 'creator') {
              setCurrentPage('creator-dashboard')
            } else {
              setCurrentPage('store-dashboard') // Default for 'both' role
            }
          } else {
            // New user, show landing page for role selection
            setCurrentPage('landing')
          }
        } catch (error) {
          console.error('Error fetching user profile:', error)
          setCurrentPage('landing')
        }
      } else {
        setUserProfile(null)
        setCurrentPage('landing')
      }
    })
    
    return unsubscribe
  }, [])

  const handleRoleSelection = async (role: string, shopifyUrl?: string) => {
    if (!user) return
    
    try {
      await blink.db.users.create({
        id: user.id,
        email: user.email,
        displayName: user.displayName || user.email,
        role,
        shopifyStoreUrl: shopifyUrl || null
      })
      
      setUserProfile({
        id: user.id,
        email: user.email,
        displayName: user.displayName || user.email,
        role: role as any,
        shopifyStoreUrl: shopifyUrl
      })
      
      // Navigate to appropriate dashboard
      if (role === 'store_owner') {
        setCurrentPage('store-dashboard')
      } else if (role === 'creator') {
        setCurrentPage('creator-dashboard')
      } else {
        setCurrentPage('store-dashboard')
      }
    } catch (error) {
      console.error('Error creating user profile:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !userProfile) {
    return <LandingPage onRoleSelection={handleRoleSelection} />
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'store-dashboard':
        return <StoreOwnerDashboard user={userProfile} />
      case 'creator-dashboard':
        return <CreatorDashboard user={userProfile} />
      case 'marketplace':
        return <ProductMarketplace user={userProfile} />
      case 'profile':
        return <ProfileSettings user={userProfile} onUpdate={setUserProfile} />
      default:
        return <StoreOwnerDashboard user={userProfile} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        user={userProfile} 
        currentPage={currentPage} 
        onPageChange={setCurrentPage} 
      />
      <main className="pt-16">
        {renderCurrentPage()}
      </main>
      <Toaster />
    </div>
  )
}

export default App