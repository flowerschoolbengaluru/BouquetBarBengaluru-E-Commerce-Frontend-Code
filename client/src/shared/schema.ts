export interface User {
  id: string;
  email: string;
  name?: string;
  firstname?: string;
  token?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  image?: string;
  category?: string;
  quantity?: number;
  stockquantity?: number; // Added for backend compatibility
  stockQuantity?: number; // Added for backend compatibility
  originalprice: any;
  discount_percentage?: number;
  discount_amount?: number;
  colour?: string;  
  inStock?: boolean;
  featured?: boolean;
  discounts_offers?: string;
  imagefirst?: string;
  imagesecond?: string;
  imagethirder?: string;
  imagefoure?: string;
  imagefive?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Address {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface DeliveryOption {
  id: string;
  name: string;
  price: string;
  estimatedDays: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  date: string;
  category: string;
  excerpt: string;
  image: string;
  publishedAt: Date;
}

export interface Testimonial {
  id: string;
  name: string;
  content: string;
  comment: string;
  rating: number;
  type: 'shop' | 'school';
  image: string;
  location: string;
}

export interface Order {
  id: string;
  ordernumber?: string;
  userId?: string;
  items: CartItem[];
  total: number;
  subtotal: number;
  status: string;
  createdAt: string;
  customerName: string;
  phone: string;
  email?: string;
  deliveryAddress: string;
  paymentMethod?: string;
  deliveryCharge?: number;
  discountAmount?: number;
  paymentCharges?: number;
  estimatedDeliveryDate?: string;
  deliveryDate?: string;
  occasion?: string;
  requirements?: string;
  couponCode?: string;
}

export interface AddressValidation {
  isValid: boolean;
  errors?: Record<string, string>;
}