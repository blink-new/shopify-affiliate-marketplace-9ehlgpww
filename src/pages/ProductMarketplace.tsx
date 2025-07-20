import { useState, useEffect, useCallback } from 'react'
import { Search, Filter, DollarSign, TrendingUp, Link, ExternalLink } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { useToast } from '../hooks/use-toast'
import { blink } from '../blink/client'
import type { User } from '../App'

interface Product {
  id: string
  title: string
  description: string
  price: number
  commissionRate: number
  imageUrl?: string
  productUrl: string
  storeOwnerName: string
  createdAt: string
  hasAffiliateLink: boolean
}

interface ProductMarketplaceProps {
  user: User
}

export function ProductMarketplace({ user }: ProductMarketplaceProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [minCommission, setMinCommission] = useState('')
  const { toast } = useToast()

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true)
      
      // Load all active products (excluding user's own products if they're a store owner)
      const productsData = await blink.db.products.list({
        where: { 
          isActive: "1",
          ...(user.role === 'creator' ? {} : { userId: { not: user.id } })
        },
        orderBy: { createdAt: 'desc' }
      })
      
      // Get store owner names and check for existing affiliate links
      const productsWithDetails = await Promise.all(
        productsData.map(async (product: any) => {
          // Get store owner info
          const owners = await blink.db.users.list({
            where: { id: product.user_id },
            limit: 1
          })
          
          // Check if user already has an affiliate link for this product
          const existingLinks = await blink.db.affiliateLinks.list({
            where: { 
              productId: product.id,
              creatorId: user.id
            },
            limit: 1
          })
          
          return {
            id: product.id,
            title: product.title,
            description: product.description,
            price: parseFloat(product.price),
            commissionRate: parseFloat(product.commission_rate),
            imageUrl: product.image_url,
            productUrl: product.product_url,
            storeOwnerName: owners[0]?.display_name || 'Unknown Store',
            createdAt: product.created_at,
            hasAffiliateLink: existingLinks.length > 0
          }
        })
      )
      
      setProducts(productsWithDetails)
      setFilteredProducts(productsWithDetails)
    } catch (error) {
      console.error('Error loading products:', error)
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [user.id, user.role, toast])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products]
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.storeOwnerName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Commission filter
    if (minCommission) {
      filtered = filtered.filter(product => product.commissionRate >= parseFloat(minCommission))
    }
    
    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'commission-high':
        filtered.sort((a, b) => b.commissionRate - a.commissionRate)
        break
      case 'commission-low':
        filtered.sort((a, b) => a.commissionRate - b.commissionRate)
        break
    }
    
    setFilteredProducts(filtered)
  }, [products, searchTerm, sortBy, minCommission])

  const generateAffiliateLink = async (productId: string) => {
    try {
      // Generate unique affiliate code
      const affiliateCode = `${user.id.slice(0, 8)}_${productId.slice(0, 8)}_${Date.now().toString(36)}`
      
      await blink.db.affiliateLinks.create({
        id: `aff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        productId,
        creatorId: user.id,
        affiliateCode,
        clicks: 0
      })

      // Show the generated affiliate link
      const affiliateUrl = `https://9ehlgpww--affiliate-redirect.functions.blink.new?code=${affiliateCode}`
      
      toast({
        title: "Success!",
        description: `Affiliate link generated: ${affiliateUrl.substring(0, 50)}...`
      })

      // Reload products to update the hasAffiliateLink status
      loadProducts()
    } catch (error) {
      console.error('Error generating affiliate link:', error)
      toast({
        title: "Error",
        description: "Failed to generate affiliate link",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Product Marketplace</h1>
        <p className="text-gray-600 mt-1">Discover products to promote and earn commissions</p>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="commission-high">Commission: High to Low</SelectItem>
                <SelectItem value="commission-low">Commission: Low to High</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              type="number"
              placeholder="Min commission %"
              value={minCommission}
              onChange={(e) => setMinCommission(e.target.value)}
            />
            
            <div className="flex items-center text-sm text-gray-600">
              {filteredProducts.length} of {products.length} products
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 text-lg mb-2">No products found</p>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                {product.imageUrl && (
                  <img 
                    src={product.imageUrl} 
                    alt={product.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                )}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg line-clamp-2">{product.title}</h3>
                    <Badge variant="secondary" className="ml-2 shrink-0">
                      {product.commissionRate}%
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{product.description}</p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">${product.price}</div>
                      <div className="text-sm text-gray-500">by {product.storeOwnerName}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-green-600">
                        ${(product.price * product.commissionRate / 100).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">potential earnings</div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <a href={product.productUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View Product
                      </a>
                    </Button>
                    
                    {product.hasAffiliateLink ? (
                      <Badge variant="default" className="px-3 py-1">
                        <Link className="h-3 w-3 mr-1" />
                        Link Created
                      </Badge>
                    ) : (
                      <Button 
                        size="sm" 
                        onClick={() => generateAffiliateLink(product.id)}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Link className="h-3 w-3 mr-1" />
                        Get Link
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats Summary */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Marketplace Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{products.length}</div>
              <div className="text-sm text-gray-600">Total Products</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {products.length > 0 ? (products.reduce((sum, p) => sum + p.commissionRate, 0) / products.length).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-gray-600">Avg Commission</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                ${products.length > 0 ? (products.reduce((sum, p) => sum + p.price, 0) / products.length).toFixed(2) : 0}
              </div>
              <div className="text-sm text-gray-600">Avg Product Price</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}