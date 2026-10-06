export interface Quote {
  id: string;
  text: string;
  author: string;
}

export type QuoteInput = Omit<Quote, 'id'>;
