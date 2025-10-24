import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from parent directory
dotenv.config({ path: resolve(__dirname, '../../.env') });

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error('❌ STRIPE_SECRET_KEY is not set in .env file');
  process.exit(1);
}

console.log('🔧 Testing Stripe Configuration...\n');
console.log(`✓ Stripe Secret Key: ${stripeSecretKey.substring(0, 20)}...`);
console.log(`✓ Mode: ${stripeSecretKey.includes('test') ? 'TEST' : 'LIVE'}\n`);

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-12-18.acacia',
});

async function testStripeConnection() {
  try {
    console.log('📡 Testing Stripe API connection...');

    // Create a test payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 2499, // $24.99 in cents
      currency: 'usd',
      metadata: {
        test: 'true',
        product_name: 'Test Coffee Beans',
        created_at: new Date().toISOString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log('✅ Successfully created test payment intent!');
    console.log(`   Payment Intent ID: ${paymentIntent.id}`);
    console.log(`   Amount: $${(paymentIntent.amount / 100).toFixed(2)}`);
    console.log(`   Status: ${paymentIntent.status}`);
    console.log(`   Client Secret: ${paymentIntent.client_secret?.substring(0, 30)}...`);

    // Cancel the test payment intent
    await stripe.paymentIntents.cancel(paymentIntent.id);
    console.log('\n✅ Test payment intent cancelled successfully');

    console.log('\n✨ Stripe integration is working correctly!\n');

    // Print test card information
    console.log('💳 Test Card Numbers:');
    console.log('   Successful Payment: 4242 4242 4242 4242');
    console.log('   Declined Card:      4000 0000 0000 0002');
    console.log('   Insufficient Funds: 4000 0000 0000 9995');
    console.log('   3D Secure:          4000 0025 0000 3155');
    console.log('\n   Use any future expiry date (e.g., 12/34)');
    console.log('   Use any 3-digit CVC (e.g., 123)');
    console.log('   Use any valid ZIP code (e.g., 12345)\n');

    console.log('🚀 Next Steps:');
    console.log('   1. Get your publishable key from Stripe Dashboard');
    console.log('   2. Update VITE_STRIPE_PUBLISHABLE_KEY in .env');
    console.log('   3. Start the backend: npm run server');
    console.log('   4. Start the frontend: npm run dev');
    console.log('   5. Test payment on the website!\n');

  } catch (error) {
    console.error('\n❌ Error testing Stripe connection:', error);

    if (error instanceof Stripe.errors.StripeError) {
      console.error(`   Type: ${error.type}`);
      console.error(`   Message: ${error.message}`);

      if (error.type === 'StripeAuthenticationError') {
        console.error('\n   ℹ️  This usually means your API key is invalid or not set correctly.');
        console.error('   Please check your .env file and Stripe Dashboard.\n');
      }
    }

    process.exit(1);
  }
}

// Run the test
testStripeConnection();
