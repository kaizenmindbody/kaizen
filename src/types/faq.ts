export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category?: string;
  order_position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}