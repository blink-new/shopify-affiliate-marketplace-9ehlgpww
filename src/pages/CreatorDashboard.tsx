import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, DollarSign, MousePointer, Eye, Copy, ExternalLink } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { useToast } from '../hooks/use-toast'
import { blink } from '../blink/client'
import { AffiliateLink } from '../components/AffiliateLink'
import type { User } from '../App'

interface AffiliateLinkData {
  id: string
  productId: string
  productTitle: string
  productPrice: number
  commissionRate: number
  affiliateCode: string
  clicks: number
  createdAt: string
}

interface Sale {
  id: string
  productTitle: string
  saleAmount: number
  commissionAmount: number
  platformFee: number
  creatorEarnings: number
  saleDate: string
  status: string
}

interface CreatorDashboardProps {
  user: User
}

export function CreatorDashboard({ user }: CreatorDashboardProps) {
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLinkData[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Load affiliate links
      const linksData = await blink.db.affiliateLinks.list({
        where: { creatorId: user.id },
        orderBy: { createdAt: 'desc' }
      })
      
      // Get product details for each link
      const linksWithProducts = await Promise.all(
        linksData.map(async (link: any) => {
          const products = await blink.db.products.list({
            where: { id: link.product_id },
            limit: 1
          })
          
          return {
            id: link.id,
            productId: link.product_id,
            productTitle: products[0]?.title || 'Unknown Product',
            productPrice: parseFloat(products[0]?.price || '0'),
            commissionRate: parseFloat(products[0]?.commission_rate || '0'),
            affiliateCode: link.affiliate_code,
            clicks: link.clicks,
            createdAt: link.created_at
          }
        })
      )
      
      setAffiliateLinks(linksWithProducts)
      
      // Load sales data
      const salesData = await blink.db.sales.list({
        where: { creatorId: user.id },
        orderBy: { saleDate: 'desc' },
        limit: 50
      })
      
      // Get product titles for sales
      const salesWithProducts = await Promise.all(
        salesData.map(async (sale: any) => {
          const products = await blink.db.products.list({
            where: { id: sale.product_id },
            limit: 1
          })
          
          return {
            id: sale.id,
            productTitle: products[0]?.title || 'Unknown Product',
            saleAmount: parseFloat(sale.sale_amount),
            commissionAmount: parseFloat(sale.commission_amount),
            platformFee: parseFloat(sale.platform_fee),
            creatorEarnings: parseFloat(sale.creator_earnings),
            saleDate: sale.sale_date,
            status: sale.status
          }
        })
      )
      
      setSales(salesWithProducts)
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

  const copyAffiliateLink = (affiliateCode: string) => {
    const affiliateUrl = `https://9ehlgpww--affiliate-redirect.functions.blink.new?code=${affiliateCode}`
    navigator.clipboard.writeText(affiliateUrl)
    toast({
      title: "Copied!",
      description: "Affiliate link copied to clipboard"
    })
  }

  // Calculate metrics
  const totalEarnings = sales.reduce((sum, sale) => sum + sale.creatorEarnings, 0)
  const totalClicks = affiliateLinks.reduce((sum, link) => sum + link.clicks, 0)
  const totalSales = sales.length
  const conversionRate = totalClicks > 0 ? (totalSales / totalClicks * 100) : 0
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Creator Dashboard</h1>
        <p className="text-gray-600 mt-1">Track your affiliate performance and earnings</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From {totalSales} sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across {affiliateLinks.length} links
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {totalSales} sales from {totalClicks} clicks
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

      {/* Affiliate Links Section */}
      <div className="mb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Affiliate Links</h2>
          <p className="text-gray-600 mt-1">Manage and track your affiliate links performance</p>
        </div>
        
        {affiliateLinks.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 text-lg mb-2">No affiliate links yet</p>
              <p className="text-gray-400">Visit the marketplace to start promoting products</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {affiliateLinks.map((link) => {
              // Calculate earnings for this link from sales
              const linkSales = sales.filter(sale => 
                sale.productTitle === link.productTitle
              )
              const linkEarnings = linkSales.reduce((sum, sale) => sum + sale.creatorEarnings, 0)
              
              return (
                <AffiliateLink
                  key={link.id}
                  affiliateCode={link.affiliateCode}
                  productTitle={link.productTitle}
                  productUrl={`https://9ehlgpww--affiliate-redirect.functions.blink.new?code=${link.affiliateCode}`}
                  commissionRate={link.commissionRate}
                  clicks={link.clicks}
                  earnings={linkEarnings}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Recent Sales */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
          <CardDescription>
            Track your successful conversions and earnings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No sales yet</p>
              <p className="text-sm text-gray-400 mt-1">Keep promoting your affiliate links to start earning!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Sale Amount</TableHead>
                  <TableHead>Commission</TableHead>
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
                    <TableCell>${sale.saleAmount.toFixed(2)}</TableCell>
                    <TableCell className="text-blue-600">${sale.commissionAmount.toFixed(2)}</TableCell>
                    <TableCell className="text-orange-600">-$0.50</TableCell>
                    <TableCell className="text-green-600 font-semibold">${sale.creatorEarnings.toFixed(2)}</TableCell>
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