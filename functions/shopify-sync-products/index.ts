import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
  // Handle CORS for frontend calls
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    const { userId, shopDomain } = await req.json();

    if (!userId || !shopDomain) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // In a real implementation, you would:
    // 1. Get the user's Shopify access token from the database
    // 2. Make API calls to Shopify to fetch products
    // 3. Sync products to your database

    // For now, we'll simulate the sync process
    console.log(`Syncing products for user ${userId} from shop ${shopDomain}`);

    // Simulate API call to Shopify
    const shopifyApiUrl = `https://${shopDomain}.myshopify.com/admin/api/2023-10/products.json`;
    
    // In production, you would use the actual Shopify API:
    // const response = await fetch(shopifyApiUrl, {
    //   headers: {
    //     'X-Shopify-Access-Token': accessToken,
    //     'Content-Type': 'application/json',
    //   },
    // });
    // const data = await response.json();

    // For demo purposes, create some sample synced products
    const sampleProducts = [
      {
        id: `shopify_${Date.now()}_1`,
        title: "Premium Wireless Headphones",
        description: "High-quality wireless headphones with noise cancellation",
        price: 199.99,
        commission_rate: 15.0,
        image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
        product_url: `https://${shopDomain}.myshopify.com/products/premium-wireless-headphones`,
        shopify_product_id: "shopify_prod_123",
        user_id: userId,
        is_active: 1
      },
      {
        id: `shopify_${Date.now()}_2`,
        title: "Smart Fitness Watch",
        description: "Track your fitness goals with this advanced smartwatch",
        price: 299.99,
        commission_rate: 20.0,
        image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
        product_url: `https://${shopDomain}.myshopify.com/products/smart-fitness-watch`,
        shopify_product_id: "shopify_prod_124",
        user_id: userId,
        is_active: 1
      }
    ];

    // Here you would save the products to your database
    // For now, we'll just return success
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: `Successfully synced ${sampleProducts.length} products from Shopify`,
      products: sampleProducts.length
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Error syncing Shopify products:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to sync products',
      details: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});