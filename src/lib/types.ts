export type Status = "new" | "open" | "awaiting_customer" | "resolved";
export type Channel = "whatsapp" | "web" | "manual" | "native";
export type ProviderKind = "meta" | "native" | "none";
export type DeliveryState = "queued" | "pending" | "sent" | "delivered" | "read" | "failed";

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
  channel?: Channel;
  provider?: ProviderKind;
  author?: string;
  deliveryState?: DeliveryState;
  remoteMessageId?: string;
  metadata?: Record<string, unknown>;
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
  channel: Channel;
  provider: ProviderKind;
  unreadCount: number;
  priority: "low" | "medium" | "high";
  labels: string[];
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

export type MetaConnectionState = {
  configured: boolean;
  webhookConfigured: boolean;
  sendEnabled: boolean;
  mode: "sandbox" | "live";
  phoneNumberId?: string;
  businessAccountId?: string;
  webhookPath: string;
};

export type ConnectorHealth = {
  provider: ProviderKind;
  enabled: boolean;
  label: string;
  detail: string;
};

export type MetaInboundRecord = {
  id: string;
  phone: string;
  contact_name?: string | null;
  body: string;
  received_at: string;
  wamid?: string;
  metadata?: Record<string, unknown>;
};

export type SendMessageResult =
  | {
      ok: true;
      conversationId: string;
      messageId: string;
      provider: ProviderKind;
      remoteMessageId?: string;
    }
  | {
      ok: false;
      conversationId?: string;
      messageId?: string;
      provider?: ProviderKind;
      error: string;
    };

export type AppState = {
  contacts: Contact[];
  conversations: Conversation[];
  rules: Rule[];
  quotes: Quote[];
  products: Product[];
  team: TeamMember[];
};
