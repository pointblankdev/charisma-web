export interface Land {
  sip: number;
  id: number;
  name: string;
  image: string;
  cardImage: string;
  description: {
    type: string;
    description: string;
  };
  proposal: string;
  whitelisted: boolean;
  wraps: {
    ca: string;
    name: string;
    description: string;
    image: string;
    asset: string;
    symbol: string;
    decimals: number;
    totalSupply: number;
    transferFunction: string;
  };
  attributes: {
    trait_type: string;
    display_type: string;
    value: number;
  }[];
  properties: {
    collection: string;
    collection_image: string;
    category: string;
    symbol: string;
    decimals: number;
  };
}

