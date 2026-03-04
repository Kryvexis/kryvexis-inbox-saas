import { redirect } from "next/navigation";
import { listConversations, listMessages, getProfile, requireTenant } from "@/lib/data";
import Link from "next/link";

function fmt(ts: string) {
  return new Date(ts).toLocaleString();
}

type SearchParams = Record<string, string | string[] | undefined>;

export default async function InboxPage({
  // Next.js 15 types model `searchParams` as async (Promise-backed) in PageProps.
  // `await` works for both Promises and plain objects at runtime.
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};

  const profile = await getProfile();
  if (!profile) redirect("/login");
  const tenant = await requireTenant(profile);
  if ("redirectTo" in tenant) redirect(tenant.redirectTo);

  const tenantId = tenant.tenantId;
  const convos = await listConversations(tenantId);
  const selected = String(sp.id || convos?.[0]?.id || "");
  const messages = selected ? await listMessages(tenantId, selected) : [];

  const demo = String(sp.demo || "") === "1";

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="kx-h2">Inbox</div>
          <div className="text-sm text-neutral-500">Team conversations, Apple-clean.</div>
        </div>

        <form action="/api/dev/inject" method="post" className="flex gap-2">
          <input type="hidden" name="mode" value="lead" />
          <button className="kx-btn kx-btn-primary">+ Inject demo lead</button>
          <Link className="kx-btn kx-btn-ghost border border-neutral-200" href="/app/inbox">
            Refresh
          </Link>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4">
        <div className="kx-card2 overflow-hidden">
          <div className="border-b border-neutral-200 p-3 flex items-center justify-between">
            <div className="text-sm font-medium">Conversations</div>
            <span className="kx-badge">{convos.length}</span>
          </div>
          <div className="max-h-[70vh] overflow-auto">
            {convos.map((c: any) => (
              <Link
                key={c.id}
                href={`/app/inbox?id=${c.id}`}
                className={`block p-4 border-b border-neutral-100 hover:bg-neutral-50 ${selected === c.id ? "bg-neutral-50" : ""}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium truncate">
                    {c.contact?.name || c.contact?.phone || "Unknown"}
                  </div>
                  <span className="kx-badge">{c.status}</span>
                </div>
                <div className="mt-1 text-xs text-neutral-500 truncate">{c.last_message_preview || c.subject || ""}</div>
                <div className="mt-2 flex gap-2 flex-wrap text-xs text-neutral-500">
                  <span className="kx-badge">{c.contact?.phone || "—"}</span>
                  {c.assigned?.email ? <span className="kx-badge">Assigned: {c.assigned.email}</span> : <span className="kx-badge">Unassigned</span>}
                </div>
              </Link>
            ))}
            {!convos.length ? (
              <div className="p-6 text-sm text-neutral-500">
                No conversations yet. Click <b>Inject demo lead</b>.
              </div>
            ) : null}
          </div>
        </div>

        <div className="kx-card2 overflow-hidden">
          <div className="border-b border-neutral-200 p-3 flex items-center justify-between">
            <div className="text-sm font-medium">Messages</div>
            {selected ? <span className="kx-badge">#{selected.slice(0, 8)}</span> : <span className="kx-badge">Select a chat</span>}
          </div>

          <div className="p-4 max-h-[62vh] overflow-auto space-y-3">
            {messages.map((m: any) => (
              <div
                key={m.id}
                className={`max-w-[80%] rounded-2xl border border-neutral-200 p-3 text-sm ${
                  m.direction === "outbound" ? "ml-auto bg-black text-white border-black" : "bg-white"
                }`}
              >
                <div className="whitespace-pre-wrap">{m.body}</div>
                <div className={`mt-1 text-xs ${m.direction === "outbound" ? "text-white/70" : "text-neutral-500"}`}>
                  {m.direction} • {fmt(m.created_at)}
                </div>
              </div>
            ))}
            {!messages.length ? <div className="text-sm text-neutral-500">No messages yet.</div> : null}
          </div>

          {selected ? (
            <form action="/api/messages/send" method="post" className="border-t border-neutral-200 p-3">
              <input type="hidden" name="conversation_id" value={selected} />
              <div className="flex gap-2">
                <input name="body" className="kx-input" placeholder="Write a reply…" />
                <button className="kx-btn kx-btn-primary">Send</button>
              </div>
              <div className="mt-2 text-xs text-neutral-500">
                Works without WhatsApp APIs. Later we connect WhatsApp Cloud API to inbound/outbound.
              </div>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
}
