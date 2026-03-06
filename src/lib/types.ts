export type Status = "open" | "pending" | "closed";

export type Contact = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  tags: string[];
};

export type MessageDirection = "inbound" | "outbound" | "internal";

export type Message = {
  id: string;
  direction: MessageDirection;
  body: string;
  createdAt: string;
};

export type Note = {
  id: string;
  body: string;
  createdAt: string;
};

export type Conversation = {
  id: string;
  contactId: string;
  status: Status;
  assignedTo?: string;
  subject: string;
  lastMessagePreview: string;
  updatedAt: string;
  messages: Message[];
  notes: Note[];
};

export type RuleMatchType = "contains" | "exact" | "startsWith";
export type RuleChannel = "inbox" | "quotes" | "both";

export type Rule = {
  id: string;
  name: string;
  keyword: string;
  autoReply: string;
  enabled: boolean;
  matchType: RuleMatchType;
  channel: RuleChannel;
  usageCount: number;
  lastTriggeredAt?: string;
};

export type QuoteStatus = "draft" | "sent" | "accepted" | "rejected";

export type QuoteItem = {
  id: string;
  productId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

export type Quote = {
  id: string;
  customer: string;
  contactId?: string;
  conversationId?: string;
  status: QuoteStatus;
  items: QuoteItem[];
  subtotal: number;
  discount: number;
  total: number;
  amount: number;
  validUntil: string;
  updatedAt: string;
  notes?: string;
};

export type ProductStatus = "active" | "draft";

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  status: ProductStatus;
  featured: boolean;
  updatedAt: string;
};

export type TeamMember = {
  id: string;
  name: string;
  role: "admin" | "agent";
};

export type AppState = {
  contacts: Contact[];
  conversations: Conversation[];
  rules: Rule[];
  quotes: Quote[];
  products: Product[];
  team: TeamMember[];
};
