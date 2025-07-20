import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
  // Handle CORS for frontend calls
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const url = new URL(req.url);
    const affiliateCode = url.searchParams.get('code');
    
    if (!affiliateCode) {
      return new Response('Missing affiliate code', { status: 400 });
    }

    console.log(`Processing affiliate click for code: ${affiliateCode}`);

    // In a real implementation, you would:
    // 1. Look up the affiliate link by code
    // 2. Increment click count
    // 3. Get the product URL
    // 4. Redirect to Shopify with tracking parameters

    // For demo purposes, we'll simulate the lookup
    const affiliateLink = {
      productUrl: 'https://demo-store.myshopify.com/products/sample-product',
      affiliateCode: affiliateCode,
      creatorId: 'creator_123'
    };

    // Increment click count (in real implementation, update database)
    console.log(`Incrementing click count for affiliate code: ${affiliateCode}`);

    // Build the redirect URL with tracking parameters
    const redirectUrl = new URL(affiliateLink.productUrl);
    redirectUrl.searchParams.set('ref', affiliateCode);
    redirectUrl.searchParams.set('utm_source', 'affiliate');
    redirectUrl.searchParams.set('utm_medium', 'referral');
    redirectUrl.searchParams.set('utm_campaign', 'affiliate_program');

    // Add affiliate code to Shopify cart attributes for tracking
    // This ensures the affiliate code is preserved through checkout
    const shopifyUrl = `${redirectUrl.toString()}?attributes[affiliate_code]=${affiliateCode}`;

    console.log(`Redirecting to: ${shopifyUrl}`);

    // Return redirect response
    return new Response(null, {
      status: 302,
      headers: {
        'Location': shopifyUrl,
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Error processing affiliate redirect:', error);
    
    return new Response('Internal server error', { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});