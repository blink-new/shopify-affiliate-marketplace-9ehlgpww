import { useState, useEffect, useCallback } from 'react'
import { Plus, TrendingUp, DollarSign, Users, Eye, ExternalLink } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { useToast } from '../hooks/use-toast'
import { blink } from '../blink/client'
import { ShopifyConnect } from '../components/ShopifyConnect'
import type { User } from '../App'

interface Product {
  id: string
  title: string
  description: string
  price: number
  commissionRate: number
  imageUrl?: string
  productUrl: string
  isActive: boolean
  createdAt: string
}

interface Sale {
  id: string
  productTitle: string
  creatorName: string
  saleAmount: number
  commissionAmount: number
  platformFee: number
  storeOwnerEarnings: number
  saleDate: string
  status: string
}

interface StoreOwnerDashboardProps {
  user: User
}

export function StoreOwnerDashboard({ user }: StoreOwnerDashboardProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [userProfile, setUserProfile] = useState<User>(user)
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price: '',
    commissionRate: '',
    imageUrl: '',
    productUrl: ''
  })
  const { toast } = useToast()

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Load products
      const productsData = await blink.db.products.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      })
      
      const formattedProducts = productsData.map((p: any) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        price: parseFloat(p.price),
        commissionRate: parseFloat(p.commission_rate),
        imageUrl: p.image_url,
        productUrl: p.product_url,
        isActive: Number(p.is_active) > 0,
        createdAt: p.created_at
      }))
      
      setProducts(formattedProducts)
      
      // Load sales data
      const salesData = await blink.db.sales.list({
        where: { storeOwnerId: user.id },
        orderBy: { saleDate: 'desc' },
        limit: 50
      })
      
      // Get creator names for sales
      const salesWithCreators = await Promise.all(
        salesData.map(async (sale: any) => {
          const creators = await blink.db.users.list({
            where: { id: sale.creator_id },
            limit: 1
          })
          
          const products = await blink.db.products.list({
            where: { id: sale.product_id },
            limit: 1
          })
          
          return {
            id: sale.id,
            productTitle: products[0]?.title || 'Unknown Product',
            creatorName: creators[0]?.display_name || 'Unknown Creator',
            saleAmount: parseFloat(sale.sale_amount),
            commissionAmount: parseFloat(sale.commission_amount),
            platformFee: parseFloat(sale.platform_fee),
            storeOwnerEarnings: parseFloat(sale.store_owner_earnings),
            saleDate: sale.sale_date,
            status: sale.status
          }
        })
      )
      
      setSales(salesWithCreators)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [user.id, toast])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const handleAddProduct = async () => {
    try {
      if (!newProduct.title || !newProduct.price || !newProduct.commissionRate || !newProduct.productUrl) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        })
        return
      }

      const productId = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      await blink.db.products.create({
        id: productId,
        userId: user.id,
        title: newProduct.title,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        commissionRate: parseFloat(newProduct.commissionRate),
        imageUrl: newProduct.imageUrl || null,
        productUrl: newProduct.productUrl,
        isActive: 1
      })

      toast({
        title: "Success",
        description: "Product added successfully!"
      })

      setNewProduct({
        title: '',
        description: '',
        price: '',
        commissionRate: '',
        imageUrl: '',
        productUrl: ''
      })
      setShowAddProduct(false)
      loadDashboardData()
    } catch (error) {
      console.error('Error adding product:', error)
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive"
      })
    }
  }

  // Calculate metrics
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.saleAmount, 0)
  const totalEarnings = sales.reduce((sum, sale) => sum + sale.storeOwnerEarnings, 0)
  const totalCommissionsPaid = sales.reduce((sum, sale) => sum + sale.commissionAmount, 0)
  const totalPlatformFees = sales.reduce((sum, sale) => sum + sale.platformFee, 0)

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Store Owner Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your products and track affiliate sales</p>
        </div>
        <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Add a product for creators to promote with affiliate links.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Product Title *</Label>
                <Input
                  id="title"
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({...newProduct, title: e.target.value})}
                  placeholder="Amazing Product Name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  placeholder="Product description..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    placeholder="29.99"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="commission">Commission (%) *</Label>
                  <Input
                    id="commission"
                    type="number"
                    step="0.1"
                    value={newProduct.commissionRate}
                    onChange={(e) => setNewProduct({...newProduct, commissionRate: e.target.value})}
                    placeholder="20"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="productUrl">Product URL *</Label>
                <Input
                  id="productUrl"
                  type="url"
                  value={newProduct.productUrl}
                  onChange={(e) => setNewProduct({...newProduct, productUrl: e.target.value})}
                  placeholder="https://your-store.com/product"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={newProduct.imageUrl}
                  onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddProduct(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddProduct}>Add Product</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Shopify Integration */}
      <div className="mb-8">
        <ShopifyConnect 
          user={userProfile} 
          onConnectionUpdate={(connected) => {
            setUserProfile(prev => ({ ...prev, shopifyStoreUrl: connected ? prev.shopifyStoreUrl : undefined }))
            if (connected) {
              loadDashboardData() // Reload data after connection
            }
          }} 
        />
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From {sales.length} sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              After commissions & fees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commissions Paid</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${totalCommissionsPaid.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              To creators
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">${totalPlatformFees.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              $0.50 per sale from you
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Products Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Products</CardTitle>
          <CardDescription>
            Products available for affiliate promotion
          </CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No products added yet</p>
              <Button onClick={() => setShowAddProduct(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Product
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <Card key={product.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    {product.imageUrl && (
                      <img 
                        src={product.imageUrl} 
                        alt={product.title}
                        className="w-full h-32 object-cover rounded-md mb-3"
                      />
                    )}
                    <h3 className="font-semibold text-lg mb-2">{product.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-lg font-bold">${product.price}</span>
                      <Badge variant="secondary">{product.commissionRate}% commission</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <Badge variant={product.isActive ? "default" : "secondary"}>
                        {product.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Button variant="outline" size="sm" asChild>
                        <a href={product.productUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Sales */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
          <CardDescription>
            Track affiliate sales and earnings breakdown
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No sales yet</p>
              <p className="text-sm text-gray-400 mt-1">Sales will appear here when creators promote your products</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Sale Amount</TableHead>
                  <TableHead>Commission Paid</TableHead>
                  <TableHead>Platform Fee</TableHead>
                  <TableHead>Your Earnings</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.productTitle}</TableCell>
                    <TableCell>{sale.creatorName}</TableCell>
                    <TableCell>${sale.saleAmount.toFixed(2)}</TableCell>
                    <TableCell className="text-blue-600">-${sale.commissionAmount.toFixed(2)}</TableCell>
                    <TableCell className="text-orange-600">-$0.50</TableCell>
                    <TableCell className="text-green-600 font-semibold">${sale.storeOwnerEarnings.toFixed(2)}</TableCell>
                    <TableCell>{new Date(sale.saleDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={sale.status === 'confirmed' ? 'default' : 'secondary'}>
                        {sale.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}