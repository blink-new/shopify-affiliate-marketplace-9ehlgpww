import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createHmac } from "https://deno.land/std@0.177.0/crypto/mod.ts";

serve(async (req) => {
  // Handle CORS for frontend calls
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Shopify-Hmac-Sha256, X-Shopify-Topic, X-Shopify-Shop-Domain',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.text();
    const hmacHeader = req.headers.get('X-Shopify-Hmac-Sha256');
    const topic = req.headers.get('X-Shopify-Topic');
    const shopDomain = req.headers.get('X-Shopify-Shop-Domain');

    // Verify webhook authenticity
    const webhookSecret = Deno.env.get('SHOPIFY_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('SHOPIFY_WEBHOOK_SECRET not configured');
      return new Response('Webhook secret not configured', { status: 500 });
    }

    // Verify HMAC
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(webhookSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
    const expectedHmac = btoa(String.fromCharCode(...new Uint8Array(signature)));

    if (hmacHeader !== expectedHmac) {
      console.error('Invalid webhook signature');
      return new Response('Unauthorized', { status: 401 });
    }

    console.log(`Received webhook: ${topic} from ${shopDomain}`);

    // Parse the webhook payload
    const data = JSON.parse(body);

    // Handle different webhook topics
    switch (topic) {
      case 'orders/create':
      case 'orders/updated':
        await handleOrderWebhook(data, shopDomain);
        break;
      
      case 'orders/paid':
        await handleOrderPaidWebhook(data, shopDomain);
        break;
      
      case 'products/create':
      case 'products/update':
        await handleProductWebhook(data, shopDomain);
        break;
      
      default:
        console.log(`Unhandled webhook topic: ${topic}`);
    }

    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Internal server error', { status: 500 });
  }
});

async function handleOrderWebhook(order: any, shopDomain: string) {
  console.log(`Processing order ${order.id} from ${shopDomain}`);
  
  // Extract affiliate code from order attributes or note
  let affiliateCode = null;
  
  // Check order note attributes for affiliate code
  if (order.note_attributes) {
    const affiliateAttr = order.note_attributes.find((attr: any) => 
      attr.name === 'affiliate_code' || attr.name === 'ref'
    );
    if (affiliateAttr) {
      affiliateCode = affiliateAttr.value;
    }
  }
  
  // Check landing site for affiliate code
  if (!affiliateCode && order.landing_site) {
    const urlParams = new URLSearchParams(order.landing_site.split('?')[1] || '');
    affiliateCode = urlParams.get('ref') || urlParams.get('affiliate');
  }

  if (affiliateCode) {
    console.log(`Found affiliate code: ${affiliateCode} for order ${order.id}`);
    
    // Store the order for processing
    // In a real implementation, you would save this to your database
    const orderData = {
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      shopify_order_id: order.id.toString(),
      affiliate_code: affiliateCode,
      total_price: parseFloat(order.total_price),
      order_status: order.financial_status,
      user_id: 'extracted_from_shop_domain', // You'd look this up based on shopDomain
      processed_at: order.financial_status === 'paid' ? new Date().toISOString() : null
    };
    
    console.log('Order data to save:', orderData);
  }
}

async function handleOrderPaidWebhook(order: any, shopDomain: string) {
  console.log(`Order ${order.id} has been paid from ${shopDomain}`);
  
  // Process commission calculations when order is paid
  await processCommissions(order, shopDomain);
}

async function handleProductWebhook(product: any, shopDomain: string) {
  console.log(`Product ${product.id} updated from ${shopDomain}`);
  
  // Sync product updates to your database
  // In a real implementation, you would update the product in your database
}

async function processCommissions(order: any, shopDomain: string) {
  // Extract affiliate code and calculate commissions
  let affiliateCode = null;
  
  if (order.note_attributes) {
    const affiliateAttr = order.note_attributes.find((attr: any) => 
      attr.name === 'affiliate_code' || attr.name === 'ref'
    );
    if (affiliateAttr) {
      affiliateCode = affiliateAttr.value;
    }
  }

  if (!affiliateCode) return;

  console.log(`Processing commissions for order ${order.id} with affiliate code ${affiliateCode}`);

  // In a real implementation, you would:
  // 1. Look up the affiliate link by code
  // 2. Get the product and commission rate
  // 3. Calculate commissions
  // 4. Create sale record
  // 5. Update earnings for creator and store owner

  const saleAmount = parseFloat(order.total_price);
  const commissionRate = 20; // This would come from the product
  const commissionAmount = saleAmount * (commissionRate / 100);
  const platformFee = 1.00; // $1 platform fee
  const creatorEarnings = commissionAmount - 0.50; // Creator pays $0.50 of platform fee
  const storeOwnerEarnings = saleAmount - commissionAmount - 0.50; // Store owner pays $0.50 of platform fee

  const saleData = {
    id: `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    affiliate_link_id: 'looked_up_from_affiliate_code',
    product_id: 'looked_up_from_order',
    creator_id: 'looked_up_from_affiliate_code',
    store_owner_id: 'looked_up_from_shop_domain',
    sale_amount: saleAmount,
    commission_amount: commissionAmount,
    platform_fee: platformFee,
    creator_earnings: creatorEarnings,
    store_owner_earnings: storeOwnerEarnings,
    sale_date: new Date().toISOString(),
    status: 'confirmed'
  };

  console.log('Sale data to save:', saleData);
}