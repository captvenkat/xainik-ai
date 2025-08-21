import Razorpay from 'razorpay'
import crypto from 'crypto'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export interface CreateOrderParams {
  amount: number
  currency: string
  receipt: string
  notes: Record<string, string>
}

export interface OrderResponse {
  id: string
  amount: number
  currency: string
  receipt: string
  status: string
}

export async function createOrder(params: CreateOrderParams): Promise<OrderResponse> {
  try {
    const order = await razorpay.orders.create({
      amount: params.amount, // Amount should already be in paise
      currency: params.currency,
      receipt: params.receipt,
      notes: params.notes,
    })

    return {
      id: order.id,
      amount: Number(order.amount || 0) / 100, // Convert back to rupees
      currency: order.currency,
      receipt: order.receipt || '',
      status: order.status,
    }
  } catch (error) {
    console.error('Razorpay order creation error:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to create payment order: ${error.message}`)
    }
    throw new Error('Failed to create payment order: Unknown error')
  }
}

export interface VerifySignatureParams {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export function verifySignature(params: VerifySignatureParams): boolean {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = params
  
  const body = razorpay_order_id + "|" + razorpay_payment_id
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body.toString())
    .digest('hex')

  return expectedSignature === razorpay_signature
}

export interface PaymentDetails {
  orderId: string
  paymentId: string
  amount: number
  currency: string
  status: string
  method: string
  description: string
  email: string
  contact: string
  notes: Record<string, string>
}

export async function getPaymentDetails(paymentId: string): Promise<PaymentDetails> {
  try {
    const payment = await razorpay.payments.fetch(paymentId)
    
    return {
      orderId: payment.order_id,
      paymentId: payment.id,
      amount: Number(payment.amount || 0) / 100, // Convert from paise to rupees
      currency: payment.currency,
      status: payment.status,
      method: payment.method,
      description: payment.description || '',
      email: payment.email,
      contact: String(payment.contact || ''),
      notes: payment.notes || {},
    }
  } catch (error) {
    throw new Error('Failed to fetch payment details')
  }
}

export function generateReceiptId(): string {
  return `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
