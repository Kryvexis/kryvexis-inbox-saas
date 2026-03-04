export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-2xl bg-black text-white grid place-items-center font-semibold">
        KX
      </div>
      <div className="leading-tight">
        <div className="font-semibold">Kryvexis</div>
        <div className="text-sm text-neutral-500">Inbox SaaS</div>
      </div>
    </div>
  );
}
