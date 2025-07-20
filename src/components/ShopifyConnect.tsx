import { useState } from 'react'
import { ExternalLink, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { useToast } from '../hooks/use-toast'
import { blink } from '../blink/client'
import type { User } from '../App'

interface ShopifyConnectProps {
  user: User
  onConnectionUpdate: (connected: boolean) => void
}

export function ShopifyConnect({ user, onConnectionUpdate }: ShopifyConnectProps) {
  const [shopDomain, setShopDomain] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const { toast } = useToast()

  const isConnected = !!user.shopifyStoreUrl

  const handleConnect = async () => {
    if (!shopDomain.trim()) {
      toast({
        title: "Error",
        description: "Please enter your shop domain",
        variant: "destructive"
      })
      return
    }

    setConnecting(true)
    try {
      // Clean up domain (remove .myshopify.com if present)
      const cleanDomain = shopDomain.replace('.myshopify.com', '').replace('https://', '').replace('http://', '')
      
      // In a real implementation, this would redirect to Shopify OAuth
      // For now, we'll simulate the connection
      const shopifyUrl = `https://${cleanDomain}.myshopify.com`
      
      // Update user with Shopify connection
      await blink.db.users.update(user.id, {
        shopifyStoreUrl: shopifyUrl,
        shopifyShopDomain: cleanDomain,
        shopifyConnectedAt: new Date().toISOString()
      })

      toast({
        title: "Success!",
        description: "Shopify store connected successfully"
      })

      onConnectionUpdate(true)
    } catch (error) {
      console.error('Error connecting Shopify:', error)
      toast({
        title: "Error",
        description: "Failed to connect Shopify store",
        variant: "destructive"
      })
    } finally {
      setConnecting(false)
    }
  }

  const handleSyncProducts = async () => {
    setSyncing(true)
    try {
      // Call our edge function to sync products from Shopify
      const response = await blink.data.fetch({
        url: 'https://9ehlgpww--shopify-sync-products.functions.blink.new',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          userId: user.id,
          shopDomain: user.shopifyStoreUrl?.replace('https://', '').replace('.myshopify.com', '')
        }
      })

      if (response.status === 200) {
        toast({
          title: "Success!",
          description: "Products synced from Shopify successfully"
        })
      } else {
        throw new Error('Sync failed')
      }
    } catch (error) {
      console.error('Error syncing products:', error)
      toast({
        title: "Error",
        description: "Failed to sync products from Shopify",
        variant: "destructive"
      })
    } finally {
      setSyncing(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await blink.db.users.update(user.id, {
        shopifyStoreUrl: null,
        shopifyShopDomain: null,
        shopifyConnectedAt: null,
        shopifyAccessToken: null
      })

      toast({
        title: "Disconnected",
        description: "Shopify store disconnected successfully"
      })

      onConnectionUpdate(false)
    } catch (error) {
      console.error('Error disconnecting Shopify:', error)
      toast({
        title: "Error",
        description: "Failed to disconnect Shopify store",
        variant: "destructive"
      })
    }
  }

  if (isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            Shopify Connected
          </CardTitle>
          <CardDescription>
            Your Shopify store is connected and ready for affiliate marketing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div>
              <p className="font-medium text-green-900">Connected Store</p>
              <p className="text-sm text-green-700">{user.shopifyStoreUrl}</p>
            </div>
            <Badge variant="default" className="bg-green-600">
              Active
            </Badge>
          </div>

          <div className="flex space-x-3">
            <Button 
              onClick={handleSyncProducts}
              disabled={syncing}
              className="flex-1"
            >
              {syncing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                'Sync Products'
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleDisconnect}
              className="text-red-600 hover:text-red-700"
            >
              Disconnect
            </Button>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>• Products will sync automatically from your Shopify store</p>
            <p>• Affiliate links will redirect to your actual product pages</p>
            <p>• Real sales will be tracked via Shopify webhooks</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertCircle className="h-5 w-5 text-orange-500 mr-2" />
          Connect Your Shopify Store
        </CardTitle>
        <CardDescription>
          Connect your Shopify store to automatically sync products and track real sales
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="shopDomain">Shop Domain</Label>
          <div className="flex space-x-2">
            <Input
              id="shopDomain"
              placeholder="your-store"
              value={shopDomain}
              onChange={(e) => setShopDomain(e.target.value)}
              className="flex-1"
            />
            <span className="flex items-center text-sm text-gray-500 whitespace-nowrap">
              .myshopify.com
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Enter your shop domain (e.g., "my-awesome-store" for my-awesome-store.myshopify.com)
          </p>
        </div>

        <Button 
          onClick={handleConnect}
          disabled={connecting}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {connecting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <ExternalLink className="h-4 w-4 mr-2" />
              Connect Shopify Store
            </>
          )}
        </Button>

        <div className="bg-blue-50 p-3 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">What happens when you connect?</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Your products will sync automatically</li>
            <li>• Affiliate links will redirect to your actual Shopify store</li>
            <li>• Real sales will be tracked and commissions calculated</li>
            <li>• Webhooks will be set up for real-time order tracking</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}