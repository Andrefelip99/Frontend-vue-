export const CATEGORIES = ['Bolos', 'Brownies', 'Sliciecakes', 'DeliciasDePote', 'Sobremesas', 'DatasEspeciais'] as const;
export type Category = typeof CATEGORIES[number];
export type Product = { id: number; title: string; description: string; price: number; oneImageUrl: string; twoImageUrl?: string; threeImageUrl?: string; link?: string; category?: string };
export type ProductPayload = Omit<Product, 'id'>;
