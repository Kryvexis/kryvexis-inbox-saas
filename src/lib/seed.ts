import type { AppState } from "./types";

const now = new Date().toISOString();
const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

export const seedState: AppState = {
  contacts: [
    { id: "c1", name: "Sipho M.", phone: "+27 68 628 2874", email: "sipho@example.com", tags: ["lead", "priority"] },
    { id: "c2", name: "Lerato K.", phone: "+27 72 123 0000", email: "lerato@example.com", tags: ["paid"] },
    { id: "c3", name: "Ahmed D.", phone: "+27 61 999 2201", email: "ahmed@example.com", tags: ["lead"] },
    { id: "c4", name: "Precious N.", phone: "+27 73 555 8821", email: "precious@example.com", tags: ["vip", "repeat"] },
  ],
  conversations: [
    {
      id: "v1",
      contactId: "c1",
      status: "open",
      assignedTo: "t2",
      subject: "Pricing inquiry",
      lastMessagePreview: "Can you send prices?",
      updatedAt: now,
      messages: [
        { id: "m1", direction: "inbound", body: "Hi 👋 can you send your prices?", createdAt: now },
        { id: "m2", direction: "outbound", body: "Sure — here are our packages.", createdAt: now }
      ],
      notes: [
        { id: "n1", body: "Hot lead. Wants response today.", createdAt: now }
      ]
    },
    {
      id: "v2",
      contactId: "c2",
      status: "pending",
      assignedTo: "t3",
      subject: "Invoice follow-up",
      lastMessagePreview: "Please resend invoice",
      updatedAt: now,
      messages: [
        { id: "m3", direction: "inbound", body: "Please resend my invoice.", createdAt: now }
      ],
      notes: []
    },
    {
      id: "v3",
      contactId: "c4",
      status: "closed",
      assignedTo: "t2",
      subject: "Bulk order confirmed",
      lastMessagePreview: "Thank you, approved for Friday delivery.",
      updatedAt: now,
      messages: [
        { id: "m4", direction: "inbound", body: "Please quote 10 business packages and setup support.", createdAt: now },
        { id: "m5", direction: "outbound", body: "Sent — I included onboarding and the support add-on.", createdAt: now },
        { id: "m6", direction: "inbound", body: "Thank you, approved for Friday delivery.", createdAt: now }
      ],
      notes: [
        { id: "n2", body: "Strong repeat buyer. Prioritise upsell to support retainer next month.", createdAt: now }
      ]
    }
  ],
  rules: [
    { id: "r1", name: "Price Auto-Reply", keyword: "price", autoReply: "Here are our latest prices and packages.", enabled: true, matchType: "contains", channel: "inbox", usageCount: 14, lastTriggeredAt: now },
    { id: "r2", name: "Delivery Auto-Reply", keyword: "deliver", autoReply: "Yes, we deliver. Please share your area.", enabled: true, matchType: "contains", channel: "both", usageCount: 9, lastTriggeredAt: now },
    { id: "r3", name: "Quote Follow-up", keyword: "quote", autoReply: "Absolutely — I can prepare a quote for you. Please confirm the package or quantity.", enabled: true, matchType: "contains", channel: "quotes", usageCount: 6, lastTriggeredAt: now }
  ],
  quotes: [
    {
      id: "q1",
      customer: "Sipho M.",
      contactId: "c1",
      conversationId: "v1",
      status: "sent",
      items: [
        { id: "qi1", productId: "p2", name: "Business Package", quantity: 1, unitPrice: 1499 },
        { id: "qi2", name: "Priority Setup", quantity: 1, unitPrice: 1000 }
      ],
      subtotal: 2499,
      discount: 0,
      total: 2499,
      amount: 2499,
      validUntil: nextWeek,
      updatedAt: now,
      notes: "Waiting for customer approval by Friday."
    },
    {
      id: "q2",
      customer: "Ahmed D.",
      contactId: "c3",
      status: "draft",
      items: [
        { id: "qi3", productId: "p1", name: "Starter Package", quantity: 1, unitPrice: 499 },
        { id: "qi4", name: "Delivery", quantity: 1, unitPrice: 300 }
      ],
      subtotal: 799,
      discount: 0,
      total: 799,
      amount: 799,
      validUntil: nextWeek,
      updatedAt: now,
      notes: "Needs delivery confirmation before sending."
    },
    {
      id: "q3",
      customer: "Precious N.",
      contactId: "c4",
      conversationId: "v3",
      status: "accepted",
      items: [
        { id: "qi5", productId: "p2", name: "Business Package", quantity: 2, unitPrice: 1499 },
        { id: "qi6", name: "Onboarding Session", quantity: 1, unitPrice: 1500 }
      ],
      subtotal: 4498,
      discount: 499,
      total: 3999,
      amount: 3999,
      validUntil: nextWeek,
      updatedAt: now,
      notes: "Accepted verbally. Delivery booked."
    }
  ],
  products: [
    {
      id: "p1",
      name: "Starter Package",
      sku: "KX-START-001",
      category: "Packages",
      description: "Ideal entry package for first-time clients who need a quick, affordable setup.",
      price: 499,
      stock: 12,
      status: "active",
      featured: true,
      updatedAt: now,
    },
    {
      id: "p2",
      name: "Business Package",
      sku: "KX-BIZ-010",
      category: "Packages",
      description: "Most popular offer for growing businesses that need stronger support and faster turnaround.",
      price: 1499,
      stock: 7,
      status: "active",
      featured: true,
      updatedAt: now,
    },
    {
      id: "p3",
      name: "Enterprise Package",
      sku: "KX-ENT-100",
      category: "Enterprise",
      description: "Premium rollout with advanced service handling, custom workflow coverage, and priority onboarding.",
      price: 3499,
      stock: 3,
      status: "draft",
      featured: false,
      updatedAt: now,
    },
    {
      id: "p4",
      name: "Support Retainer",
      sku: "KX-SUP-200",
      category: "Services",
      description: "Monthly support retainer for follow-ups, admin assistance, and inbox handling.",
      price: 999,
      stock: 25,
      status: "active",
      featured: false,
      updatedAt: now,
    }
  ],
  team: [
    { id: "t1", name: "Ant", role: "admin" },
    { id: "t2", name: "Nomsa", role: "agent" },
    { id: "t3", name: "Mpho", role: "agent" }
  ]
};
