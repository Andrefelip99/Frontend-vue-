export const CATEGORIES = ['Bolos', 'Brownies', 'Sliciecakes', 'DeliciasDePote', 'Sobremesas', 'DatasEspeciais'] as const;
export type Category = typeof CATEGORIES[number];

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  oneImageUrl: string;
  twoImageUrl?: string | null;
  threeImageUrl?: string | null;
  link?: string | null;
  category: Category;
}

export type ProductPayload = Omit<Product, 'id'>;
  