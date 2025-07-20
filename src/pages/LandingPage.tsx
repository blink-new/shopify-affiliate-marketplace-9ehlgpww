import { useState } from 'react'
import { Store, TrendingUp, Users, DollarSign, BarChart3, Link } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Badge } from '../components/ui/badge'
import { blink } from '../blink/client'

interface LandingPageProps {
  onRoleSelection: (role: string, shopifyUrl?: string) => void
}

export function LandingPage({ onRoleSelection }: LandingPageProps) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [shopifyUrl, setShopifyUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleGetStarted = () => {
    blink.auth.login()
  }

  const handleRoleSubmit = async () => {
    if (!selectedRole) return
    
    setIsSubmitting(true)
    try {
      await onRoleSelection(selectedRole, shopifyUrl || undefined)
    } catch (error) {
      console.error('Error setting up profile:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Connect <span className="text-indigo-600">Shopify Stores</span> with{' '}
              <span className="text-emerald-600">Content Creators</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The ultimate affiliate marketplace where store owners find creators to promote their products, 
              and creators earn commissions through trackable affiliate links.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Badge variant="secondary" className="text-sm px-4 py-2">
                <DollarSign className="h-4 w-4 mr-1" />
                Commission-based earnings
              </Badge>
              <Badge variant="secondary" className="text-sm px-4 py-2">
                <Link className="h-4 w-4 mr-1" />
                Trackable affiliate links
              </Badge>
              <Badge variant="secondary" className="text-sm px-4 py-2">
                <BarChart3 className="h-4 w-4 mr-1" />
                Real-time analytics
              </Badge>
            </div>

            <Button 
              onClick={handleGetStarted}
              size="lg" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 text-lg"
            >
              Get Started Free
            </Button>
          </div>
        </div>
      </div>

      {/* Role Selection Cards */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Role</h2>
          <p className="text-lg text-gray-600">Select how you want to use the platform</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Store Owner */}
          <Card 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedRole === 'store_owner' ? 'ring-2 ring-indigo-500 shadow-lg' : ''
            }`}
            onClick={() => setSelectedRole('store_owner')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <Store className="h-8 w-8 text-indigo-600" />
              </div>
              <CardTitle className="text-xl">Store Owner</CardTitle>
              <CardDescription>
                List your Shopify products and find creators to promote them
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Upload products with commission rates</li>
                <li>• Track affiliate sales and performance</li>
                <li>• Manage creator partnerships</li>
                <li>• Pay only $1 platform fee per sale</li>
              </ul>
            </CardContent>
          </Card>

          {/* Content Creator */}
          <Card 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedRole === 'creator' ? 'ring-2 ring-emerald-500 shadow-lg' : ''
            }`}
            onClick={() => setSelectedRole('creator')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="h-8 w-8 text-emerald-600" />
              </div>
              <CardTitle className="text-xl">Content Creator</CardTitle>
              <CardDescription>
                Browse products and earn commissions through affiliate marketing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Browse available products to promote</li>
                <li>• Get unique trackable affiliate links</li>
                <li>• Earn commissions on every sale</li>
                <li>• Track clicks and conversion rates</li>
              </ul>
            </CardContent>
          </Card>

          {/* Both Roles */}
          <Card 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedRole === 'both' ? 'ring-2 ring-purple-500 shadow-lg' : ''
            }`}
            onClick={() => setSelectedRole('both')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Both Roles</CardTitle>
              <CardDescription>
                List your products and promote others' products too
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Full store owner capabilities</li>
                <li>• Full creator capabilities</li>
                <li>• Maximize earning potential</li>
                <li>• Access to all platform features</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Shopify URL Input for Store Owners */}
        {(selectedRole === 'store_owner' || selectedRole === 'both') && (
          <div className="mt-8 max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Shopify Store Details</CardTitle>
                <CardDescription>
                  Enter your Shopify store URL to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="shopify-url">Shopify Store URL</Label>
                  <Input
                    id="shopify-url"
                    type="url"
                    placeholder="https://your-store.myshopify.com"
                    value={shopifyUrl}
                    onChange={(e) => setShopifyUrl(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleRoleSubmit}
                  disabled={isSubmitting || !selectedRole}
                  className="w-full"
                >
                  {isSubmitting ? 'Setting up...' : 'Complete Setup'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Continue Button for Creators */}
        {selectedRole === 'creator' && (
          <div className="mt-8 text-center">
            <Button 
              onClick={handleRoleSubmit}
              disabled={isSubmitting}
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? 'Setting up...' : 'Start as Creator'}
            </Button>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Platform Features</h2>
            <p className="text-lg text-gray-600">Everything you need for successful affiliate marketing</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Link className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Unique Affiliate Links</h3>
              <p className="text-sm text-gray-600">Generate trackable links for every product and creator combination</p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Real-time Analytics</h3>
              <p className="text-sm text-gray-600">Track clicks, conversions, and earnings in real-time</p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Transparent Fees</h3>
              <p className="text-sm text-gray-600">Simple $1 platform fee per sale, split between both parties</p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Easy Collaboration</h3>
              <p className="text-sm text-gray-600">Connect store owners with the right creators for their products</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}