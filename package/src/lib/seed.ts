import type { AppState } from "./types";

const now = new Date();
const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();

export const seedState: AppState = {
  contacts: [
    { id: "c1", name: "Sipho M.", phone: "+27 68 628 2874", email: "sipho@example.com", company: "Sipho Retail", tags: ["lead", "priority"] },
    { id: "c2", name: "Lerato K.", phone: "+27 72 123 0000", email: "lerato@example.com", company: "LK Events", tags: ["paid", "repeat"] },
    { id: "c3", name: "Ahmed D.", phone: "+27 61 999 2201", email: "ahmed@example.com", company: "Apex Supplies", tags: ["lead"] }
  ],
  conversations: [
    {
      id: "v1",
      contactId: "c1",
      status: "open",
      assignedTo: "t2",
      subject: "Pricing and delivery request",
      lastMessagePreview: "Sure — here are our current package options.",
      updatedAt: hoursAgo(1),
      unreadCount: 1,
      channel: "whatsapp",
      priority: "high",
      labels: ["pricing", "delivery"],
      messages: [
        { id: "m1", direction: "inbound", body: "Hi 👋 can you send your prices and delivery options?", createdAt: hoursAgo(2), channel: "whatsapp", deliveryState: "read" },
        { id: "m2", direction: "outbound", body: "Sure — here are our current package options.", createdAt: hoursAgo(1), channel: "whatsapp", deliveryState: "delivered", author: "Nomsa" }
      ],
      notes: [
        { id: "n1", body: "High-intent lead. Wants a same-day follow-up and quote.", createdAt: hoursAgo(1) }
      ]
    },
    {
      id: "v2",
      contactId: "c2",
      status: "waiting",
      assignedTo: "t3",
      subject: "Invoice follow-up",
      lastMessagePreview: "Please resend my invoice.",
      updatedAt: hoursAgo(5),
      unreadCount: 0,
      channel: "whatsapp",
      priority: "normal",
      labels: ["invoice", "returning customer"],
      messages: [
        { id: "m3", direction: "inbound", body: "Please resend my invoice when you can.", createdAt: hoursAgo(6), channel: "whatsapp", deliveryState: "read" },
        { id: "m4", direction: "outbound", body: "Resending now. Let me know once it reaches you.", createdAt: hoursAgo(5), channel: "whatsapp", deliveryState: "read", author: "Mpho" }
      ],
      notes: []
    },
    {
      id: "v3",
      contactId: "c3",
      status: "new",
      assignedTo: "t2",
      subject: "Quote request from web form",
      lastMessagePreview: "I need a quote for 10 units this week.",
      updatedAt: hoursAgo(0.4),
      unreadCount: 2,
      channel: "web",
      priority: "high",
      labels: ["quote", "new lead"],
      messages: [
        { id: "m5", direction: "inbound", body: "I need a quote for 10 units this week.", createdAt: hoursAgo(0.5), channel: "web", deliveryState: "read" }
      ],
      notes: [
        { id: "n2", body: "Move to WhatsApp once quote is approved.", createdAt: hoursAgo(0.4) }
      ]
    }
  ],
  rules: [
    { id: "r1", name: "Price Auto-Reply", keyword: "price", autoReply: "Thanks for reaching out. I can send our latest pricing options right away.", enabled: true },
    { id: "r2", name: "Delivery Auto-Reply", keyword: "deliver", autoReply: "Yes, we deliver. Please share your area and preferred delivery date.", enabled: true }
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
