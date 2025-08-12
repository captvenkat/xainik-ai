// =====================================================
// PROFESSIONAL RAZORPAY INTEGRATION
// Xainik Platform - Professional Rewrite
// =====================================================

import Razorpay from 'razorpay';

// =====================================================
// RAZORPAY CLIENT INITIALIZATION
// =====================================================

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!
});

// =====================================================
// ORDER MANAGEMENT
// =====================================================

export interface CreateOrderOptions {
  amount: number; // in paise
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface OrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export async function createOrder(options: CreateOrderOptions): Promise<OrderResponse> {
  try {
    const orderParams: any = {
      amount: options.amount,
      currency: options.currency,
      receipt: options.receipt
    };

    if (options.notes) {
      orderParams.notes = options.notes;
    }

    const order: any = await razorpay.orders.create(orderParams);

    return {
      id: order.id || '',
      amount: typeof order.amount === 'string' ? parseInt(order.amount) : (order.amount || 0),
      currency: order.currency || 'INR',
      receipt: order.receipt || '',
      status: order.status || 'created'
    };
  } catch (error) {
    console.error('Failed to create Razorpay order:', error);
    throw new Error('Failed to create payment order');
  }
}

// =====================================================
// SUBSCRIPTION MANAGEMENT
// =====================================================

export interface CreateSubscriptionOptions {
  plan_id: string;
  customer_notify: number;
  total_count: number;
  notes?: Record<string, string>;
}

export interface SubscriptionResponse {
  id: string;
  plan_id: string;
  status: string;
  current_start: number;
  current_end: number;
}

export async function createSubscription(options: CreateSubscriptionOptions): Promise<SubscriptionResponse> {
  try {
    const subscriptionParams: any = {
      plan_id: options.plan_id,
      customer_notify: options.customer_notify,
      total_count: options.total_count
    };

    if (options.notes) {
      subscriptionParams.notes = options.notes;
    }

    const subscription: any = await razorpay.subscriptions.create(subscriptionParams);

    return {
      id: subscription.id || '',
      plan_id: subscription.plan_id || '',
      status: subscription.status || 'created',
      current_start: subscription.current_start || 0,
      current_end: subscription.current_end || 0
    };
  } catch (error) {
    console.error('Failed to create Razorpay subscription:', error);
    throw new Error('Failed to create subscription');
  }
}

// =====================================================
// PAYMENT VERIFICATION
// =====================================================

export interface PaymentVerificationData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export function verifyPaymentSignature(data: PaymentVerificationData): boolean {
  try {
    const text = `${data.razorpay_order_id}|${data.razorpay_payment_id}`;
    const signature = require('crypto')
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest('hex');
    
    return signature === data.razorpay_signature;
  } catch (error) {
    console.error('Payment signature verification failed:', error);
    return false;
  }
}

// =====================================================
// WEBHOOK PROCESSING
// =====================================================

export interface WebhookEvent {
  id: string;
  event: string;
  payload: any;
  created_at: number;
}

export async function processWebhookEvent(event: WebhookEvent): Promise<void> {
  try {
    console.log('Processing webhook event:', event.event, event.id);

    // TODO: Implement webhook processing logic
    // This will be implemented once the billing services are ready
    
    switch (event.event) {
      case 'payment.captured':
        console.log('Payment captured:', event.payload.payment?.id);
        break;
      case 'subscription.activated':
        console.log('Subscription activated:', event.payload.subscription?.id);
        break;
      case 'subscription.charged':
        console.log('Subscription charged:', event.payload.subscription?.id);
        break;
      default:
        console.log('Unhandled event type:', event.event);
    }

  } catch (error) {
    console.error('Error processing webhook event:', error);
    throw error;
  }
}

// =====================================================
// REFUND PROCESSING
// =====================================================

export interface RefundOptions {
  payment_id: string;
  amount: number; // in paise
  speed: 'normal' | 'optimum';
  notes?: Record<string, string>;
}

export async function processRefund(options: RefundOptions): Promise<any> {
  try {
    const refundParams: any = {
      amount: options.amount,
      speed: options.speed
    };

    if (options.notes) {
      refundParams.notes = options.notes;
    }

    const refund = await razorpay.payments.refund(options.payment_id, refundParams);
    return refund;
  } catch (error) {
    console.error('Failed to process refund:', error);
    throw new Error('Failed to process refund');
  }
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

export function paiseToRupees(paise: number): number {
  return paise / 100;
}

export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

export function formatCurrency(amount: number, currency: string = 'INR'): string {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency
  });
  return formatter.format(amount);
}
