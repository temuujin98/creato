export type PricingPackage = {
  id: string;
  name: string;
  credits: number;
  price: number;
  highlighted?: boolean;
};

export const creditUnitPrice = 990;

export const pricingPackages: PricingPackage[] = [
  { id: "starter", name: "Starter", credits: 10, price: 9900 },
  { id: "creator", name: "Creator", credits: 20, price: 18900, highlighted: true },
  { id: "business", name: "Business", credits: 50, price: 44900 },
  { id: "pro", name: "Pro", credits: 100, price: 79900 },
];
