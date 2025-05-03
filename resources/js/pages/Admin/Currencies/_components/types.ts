export interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  exchange_rate: number;
  is_default: boolean;
  is_active: boolean;
  decimal_separator: string;
  thousand_separator: string;
  decimal_places: number;
  created_at: string;
  updated_at: string;
}
