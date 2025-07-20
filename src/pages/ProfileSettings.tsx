import { useState } from 'react'
import { User as UserIcon, Store, Save } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { useToast } from '../hooks/use-toast'
import { blink } from '../blink/client'
import type { User } from '../App'

interface ProfileSettingsProps {
  user: User
  onUpdate: (user: User) => void
}

export function ProfileSettings({ user, onUpdate }: ProfileSettingsProps) {
  const [formData, setFormData] = useState({
    displayName: user.displayName || '',
    role: user.role,
    shopifyStoreUrl: user.shopifyStoreUrl || ''
  })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    try {
      setSaving(true)
      
      await blink.db.users.update(user.id, {
        displayName: formData.displayName,
        role: formData.role,
        shopifyStoreUrl: formData.shopifyStoreUrl || null
      })

      const updatedUser = {
        ...user,
        displayName: formData.displayName,
        role: formData.role as any,
        shopifyStoreUrl: formData.shopifyStoreUrl
      }
      
      onUpdate(updatedUser)
      
      toast({
        title: "Success",
        description: "Profile updated successfully!"
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    blink.auth.logout()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information and account settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                  placeholder="Your display name"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="role">Account Type</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value as any})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="store_owner">Store Owner</SelectItem>
                    <SelectItem value="creator">Content Creator</SelectItem>
                    <SelectItem value="both">Both (Store Owner & Creator)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(formData.role === 'store_owner' || formData.role === 'both') && (
                <div className="grid gap-2">
                  <Label htmlFor="shopifyUrl">Shopify Store URL</Label>
                  <Input
                    id="shopifyUrl"
                    type="url"
                    value={formData.shopifyStoreUrl}
                    onChange={(e) => setFormData({...formData, shopifyStoreUrl: e.target.value})}
                    placeholder="https://your-store.myshopify.com"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={handleLogout}>
                  Sign Out
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Account Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <div className="font-medium">{user.displayName || user.email}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Account Type:</span>
                    <span className="font-medium capitalize">
                      {user.role === 'both' ? 'Store Owner & Creator' : 
                       user.role === 'store_owner' ? 'Store Owner' : 'Creator'}
                    </span>
                  </div>
                  
                  {user.shopifyStoreUrl && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shopify Store:</span>
                      <a 
                        href={user.shopifyStoreUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 truncate max-w-32"
                      >
                        {user.shopifyStoreUrl.replace('https://', '')}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Platform Info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Store className="h-5 w-5 mr-2" />
                Platform Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <div className="font-medium text-gray-900 mb-2">Fee Structure:</div>
                <ul className="space-y-1 text-gray-600">
                  <li>• $0.50 platform fee per sale (from store owner)</li>
                  <li>• $0.50 platform fee per sale (from creator)</li>
                  <li>• Total: $1.00 per sale</li>
                </ul>
              </div>
              
              <div className="text-sm">
                <div className="font-medium text-gray-900 mb-2">How it works:</div>
                <ul className="space-y-1 text-gray-600">
                  <li>• Store owners list products with commission rates</li>
                  <li>• Creators get unique trackable affiliate links</li>
                  <li>• Earnings are calculated automatically</li>
                  <li>• Real-time analytics for both parties</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}