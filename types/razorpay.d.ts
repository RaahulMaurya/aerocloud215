// Type definitions for Razorpay checkout
interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: RazorpayResponse) => void
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  theme?: {
    color?: string
  }
}

interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

interface RazorpayInstance {
  open(): void
  close(): void
}

interface Window {
  Razorpay: new (options: RazorpayOptions) => RazorpayInstance
}

declare module "razorpay" {
  export interface IRazorpayConfig {
    key_id: string
    key_secret: string
  }

  export interface IOrder {
    id: string
    amount: number
    currency: string
    receipt: string
    status: string
    notes?: Record<string, string>
  }

  export interface ICreateOrderOptions {
    amount: number
    currency: string
    receipt: string
    notes?: Record<string, string>
  }

  export default class Razorpay {
    constructor(config: IRazorpayConfig)
    orders: {
      create(options: ICreateOrderOptions): Promise<IOrder>
    }
  }
}
