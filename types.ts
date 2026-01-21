
export interface ColumnMetadata {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
}

export interface TableData {
  columns: ColumnMetadata[];
  rows: any[];
  fileName: string;
}

export interface QueryResult {
  sql: string;
  explanation: string;
  data: any[];
  error?: string;
}

export interface AIResponse {
  sql: string;
  explanation: string;
  isAmbiguous: boolean;
  clarificationMessage?: string;
}

export interface QueryHistoryItem {
  id: string;
  question: string;
  sql: string;
  explanation: string;
  timestamp: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  // Add missing properties for Pro plan to resolve errors in PricingPage and PaymentService
  plan?: 'free' | 'pro';
  isSubscriptionActive?: boolean;
  stripeSubscriptionId?: string;
}
