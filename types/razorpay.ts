export interface RazorpayPaymentNotes {
  type?: 'service' | 'donation';
  userId?: string;
  buyerName?: string; 
  buyerEmail?: string; 
  buyerPhone?: string;
  donorName?: string; 
  donorEmail?: string; 
  donorPhone?: string; 
  anonymous?: string;
  planName?: string; 
  planDays?: string;
}

export interface RazorpayPaymentEntity {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  notes?: RazorpayPaymentNotes;
}

export interface RazorpayWebhookPayload {
  id: string;
  event: string;
  payload: {
    payment: {
      entity: {
        id: string;
        order_id?: string;
        amount: number;
        currency: string;
        status: string;
        notes?: Record<string, string>;
      };
    };
  };
}

export interface ServicePaymentNotes {
  type: 'service';
  userId: string;
  planTier: string;
  planName: string;
  planDays: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
}

export interface DonationPaymentNotes {
  type: 'donation';
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  anonymous: string; // 'true' | 'false'
}

export type PaymentNotes = ServicePaymentNotes | DonationPaymentNotes;

export interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  notes?: RazorpayPaymentNotes;
}

export interface RazorpayPaymentDetails {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  contact: string;
  email: string;
  method: string;
  notes?: RazorpayPaymentNotes;
}
