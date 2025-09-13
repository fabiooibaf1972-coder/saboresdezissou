import type { Tables } from '@/lib/database.types';

export type Product = Tables<'products'>;
export type Order = Tables<'orders'>;

export interface ProductWithImages extends Product {
  imageUrls?: string[];
}

export interface OrderFormData {
  customer_name: string;
  customer_address: string;
  customer_whatsapp: string;
  delivery_date?: string;
  payment_method: 'pix' | 'card';
  observations?: string;
}

export interface DailyProductFormData extends OrderFormData {
  product_id: string;
  product_name: string;
  product_image: string;
}

export interface WhatsAppMessage {
  text: string;
  phone: string;
  image?: string;
}