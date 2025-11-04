import { apiRequest } from './api';

// Get API base URL
const getApiBaseURL = () => {
  return import.meta.env.VITE_API_URL || 'https://flowerschoolbengaluru.com';
};

// Razorpay integration utility
export const loadRazorpay = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve((window as any).Razorpay);
    };
    script.onerror = () => {
      reject(new Error('Failed to load Razorpay script'));
    };
    document.body.appendChild(script);
  });
};

export interface RazorpayOrderData {
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface RazorpayPaymentOptions {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: any) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

export const createRazorpayOrder = async (orderData: RazorpayOrderData) => {
  try {
    console.log('Creating Razorpay order with data:', orderData);
    console.log('API Base URL:', getApiBaseURL());
    
    const response = await apiRequest('POST', '/api/payment/create-order', orderData);
    
    console.log('Razorpay order creation response:', response);
    return response;
  } catch (error) {
    console.error('Failed to create Razorpay order:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to create payment order: ${error.message}`);
    }
    throw new Error('Failed to create payment order');
  }
};

export const verifyRazorpayPayment = async (paymentData: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  enrollment_data?: any;
}) => {
  try {
    console.log('Verifying Razorpay payment:', {
      order_id: paymentData.razorpay_order_id,
      payment_id: paymentData.razorpay_payment_id,
      has_enrollment_data: !!paymentData.enrollment_data
    });
    
    const response = await apiRequest('POST', '/api/payment/verify', paymentData);
    
    console.log('Payment verification response:', response);
    return response;
  } catch (error) {
    console.error('Payment verification failed:', error);
    if (error instanceof Error) {
      throw new Error(`Payment verification failed: ${error.message}`);
    }
    throw new Error('Payment verification failed');
  }
};

export const getPaymentStatus = async (paymentId: string) => {
  try {
    console.log('Fetching payment status for:', paymentId);
    
    const response = await apiRequest('GET', `/api/payment/status/${paymentId}`, undefined);
    
    console.log('Payment status response:', response);
    return response;
  } catch (error) {
    console.error('Failed to fetch payment status:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch payment status: ${error.message}`);
    }
    throw new Error('Failed to fetch payment status');
  }
};