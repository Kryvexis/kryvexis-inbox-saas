import type { AppState } from "./types";

const now = new Date().toISOString();

export const seedState: AppState = {
  contacts: [
    { id: "c1", name: "Sipho M.", phone: "+27 68 628 2874", email: "sipho@example.com", tags: ["lead", "priority"] },
    { id: "c2", name: "Lerato K.", phone: "+27 72 123 0000", email: "lerato@example.com", tags: ["customer"] },
    { id: "c3", name: "Ahmed D.", phone: "+27 61 999 2201", email: "ahmed@example.com", tags: ["lead"] }
  ],
  conversations: [
    {
      id: "v1",
      contactId: "c1",
      status: "open",
      assignedTo: "t2",
      subject: "Pricing request from WhatsApp",
      lastMessagePreview: "Please send your latest pricing.",
      updatedAt: now,
      channel: "whatsapp",
      provider: "meta",
      unreadCount: 1,
      priority: "high",
      labels: ["pricing", "hot lead"],
      persisted: false,
      messages: [
        { id: "m1", direction: "inbound", body: "Hi 👋 can you send your latest prices?", createdAt: now, channel: "whatsapp", provider: "meta", author: "Sipho M." },
        { id: "m2", direction: "outbound", body: "Absolutely. I can send packages and delivery options.", createdAt: now, channel: "whatsapp", provider: "meta", author: "Ant", deliveryState: "read", remoteMessageId: "wamid.seed.1" }
      ],
      notes: [
        { id: "n1", body: "High intent. Follow up with quote before close of business.", createdAt: now }
      ]
    },
    {
      id: "v2",
      contactId: "c2",
      status: "awaiting_customer",
      assignedTo: "t3",
      subject: "Invoice resend",
      lastMessagePreview: "I’ve resent the invoice to your email address.",
      updatedAt: now,
      channel: "manual",
      provider: "native",
      unreadCount: 0,
      priority: "medium",
      labels: ["billing", "native"],
      persisted: false,
      messages: [
        { id: "m3", direction: "inbound", body: "Please resend my invoice.", createdAt: now, channel: "manual", provider: "native", author: "Lerato K." },
        { id: "m4", direction: "outbound", body: "Done. Please confirm once you receive it.", createdAt: now, channel: "manual", provider: "native", author: "Mpho", deliveryState: "sent" }
      ],
      notes: []
    },
    {
      id: "v3",
      contactId: "c3",
      status: "new",
      assignedTo: "t2",
      subject: "Stock check",
      lastMessagePreview: "Do you still have the Business Package available?",
      updatedAt: now,
      channel: "web",
      provider: "native",
      unreadCount: 2,
      priority: "low",
      labels: ["website", "native"],
      persisted: false,
      messages: [
        { id: "m5", direction: "inbound", body: "Do you still have the Business Package available?", createdAt: now, channel: "web", provider: "native", author: "Ahmed D." }
      ],
      notes: []
    }
  ],
  rules: [
    { id: "r1", name: "Pricing auto-reply", keyword: "price", autoReply: "Thanks for reaching out. I can send the latest pricing and package options.", enabled: true },
    { id: "r2", name: "Delivery auto-reply", keyword: "deliver", autoReply: "Yes, delivery is available. Please send your area so I can confirm lead time.", enabled: true }
  ],
  quotes: [
    { id: "q1", customer: "Sipho M.", amount: 2499, status: "sent" },
    { id: "q2", customer: "Ahmed D.", amount: 799, status: "draft" }
  ],
  products: [
    { id: "p1", name: "Starter Package", price: 499, stock: 12 },
    { id: "p2", name: "Business Package", price: 1499, stock: 7 },
    { id: "p3", name: "Enterprise Package", price: 3499, stock: 3 }
  ],
  team: [
    { id: "t1", name: "Ant", role: "admin" },
    { id: "t2", name: "Nomsa", role: "agent" },
    { id: "t3", name: "Mpho", role: "agent" }
  ]
};
