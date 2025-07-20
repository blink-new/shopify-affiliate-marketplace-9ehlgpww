import { useState } from 'react'
import { Copy, ExternalLink, Eye, TrendingUp } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { useToast } from '../hooks/use-toast'

interface AffiliateLinkProps {
  affiliateCode: string
  productTitle: string
  productUrl: string
  commissionRate: number
  clicks: number
  earnings: number
}

export function AffiliateLink({ 
  affiliateCode, 
  productTitle, 
  productUrl, 
  commissionRate, 
  clicks, 
  earnings 
}: AffiliateLinkProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  // Generate the affiliate tracking URL using our edge function
  const affiliateUrl = `https://9ehlgpww--affiliate-redirect.functions.blink.new?code=${affiliateCode}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(affiliateUrl)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Affiliate link copied to clipboard"
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive"
      })
    }
  }

  const handleTestLink = () => {
    window.open(affiliateUrl, '_blank')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{productTitle}</CardTitle>
        <CardDescription>
          Affiliate link with {commissionRate}% commission
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Affiliate URL */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Your Affiliate Link</label>
          <div className="flex space-x-2">
            <Input 
              value={affiliateUrl}
              readOnly
              className="font-mono text-sm"
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCopy}
              className={copied ? "bg-green-50 text-green-700" : ""}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleTestLink}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Eye className="h-4 w-4 text-blue-600 mr-1" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{clicks}</div>
            <div className="text-xs text-blue-700">Clicks</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
            </div>
            <div className="text-2xl font-bold text-green-600">${earnings.toFixed(2)}</div>
            <div className="text-xs text-green-700">Earned</div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{commissionRate}%</div>
            <div className="text-xs text-purple-700">Commission</div>
          </div>
        </div>

        {/* Affiliate Code */}
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
          <span className="text-sm text-gray-600">Affiliate Code:</span>
          <Badge variant="secondary" className="font-mono">
            {affiliateCode}
          </Badge>
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Share this link on social media, blogs, or websites</p>
          <p>• Earn {commissionRate}% commission on every sale</p>
          <p>• Track clicks and earnings in real-time</p>
        </div>
      </CardContent>
    </Card>
  )
}