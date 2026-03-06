export type Status = "open" | "pending" | "closed";

export type Contact = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  tags: string[];
};

export type Message = {
  id: string;
  direction: "inbound" | "outbound" | "internal";
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

export type Rule = {
  id: string;
  name: string;
  keyword: string;
  autoReply: string;
  enabled: boolean;
};

export type Quote = {
  id: string;
  customer: string;
  amount: number;
  status: "draft" | "sent" | "approved";
};

export type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
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
