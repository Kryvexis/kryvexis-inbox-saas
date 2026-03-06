import type { AppState } from "./types";

const now = new Date().toISOString();

export const seedState: AppState = {
  contacts: [
    { id: "c1", name: "Sipho M.", phone: "+27 68 628 2874", email: "sipho@example.com", tags: ["lead", "priority"] },
    { id: "c2", name: "Lerato K.", phone: "+27 72 123 0000", email: "lerato@example.com", tags: ["paid"] },
    { id: "c3", name: "Ahmed D.", phone: "+27 61 999 2201", email: "ahmed@example.com", tags: ["lead"] }
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
    }
  ],
  rules: [
    { id: "r1", name: "Price Auto-Reply", keyword: "price", autoReply: "Here are our latest prices and packages.", enabled: true },
    { id: "r2", name: "Delivery Auto-Reply", keyword: "deliver", autoReply: "Yes, we deliver. Please share your area.", enabled: true }
  ],
  quotes: [
    { id: "q1", customer: "Sipho M.", amount: 2499, status: "sent" },
    { id: "q2", customer: "Ahmed D.", amount: 799, status: "draft" }
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
    }
  ],
  team: [
    { id: "t1", name: "Ant", role: "admin" },
    { id: "t2", name: "Nomsa", role: "agent" },
    { id: "t3", name: "Mpho", role: "agent" }
  ]
};
