import Link from "next/link";

export const metadata = {
  title: "Settings | TradeVault Admin",
};

export default function AdminSettingsPage() {
  const policies = [
    { icon: "person", title: "User", text: "Can access their TradeVault account and only their own support tickets." },
    { icon: "admin_panel_settings", title: "Admin", text: "Can manage users, account access, and all support tickets through protected APIs." },
    { icon: "verified_user", title: "Active", text: "Authentication and authorized API access are allowed." },
    { icon: "person_off", title: "Deactivated", text: "Login and authenticated API access are blocked until reactivated." },
    { icon: "block", title: "Suspended", text: "Login and authenticated API access are blocked by an administrative action." },
  ];

  return (
    <div className="pb-20">
      <header className="mb-8"><span className="mb-2 block text-[10px] font-extrabold tracking-[.16em] text-primary-container">ACCESS SETTINGS</span><h2 className="text-[clamp(28px,4vw,40px)] leading-tight tracking-[-.04em]">Roles and account status</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant">Review the access model enforced by the TradeVault backend. User-specific changes are made from the Users section.</p></header>
      <section className="grid grid-cols-2 gap-5 max-[760px]:grid-cols-1">{policies.map((policy) => <article key={policy.title} className="stitch-panel rounded-2xl p-6"><span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><span className="material-symbols-outlined">{policy.icon}</span></span><h3 className="mt-5 text-lg">{policy.title}</h3><p className="mt-2 text-sm leading-6 text-on-surface-variant">{policy.text}</p></article>)}</section>
      <section className="mt-6 rounded-2xl border border-tertiary/15 bg-tertiary/[.035] p-6"><div className="flex items-center justify-between gap-6 max-[620px]:flex-col max-[620px]:items-start"><div><h3 className="text-lg">Manage an account</h3><p className="mt-2 text-sm text-on-surface-variant">Role and status changes are validated against the authenticated administrator’s current database record. Administrators cannot disable, demote, or delete themselves.</p></div><Link href="/admin/users" className="shrink-0 rounded-xl bg-primary px-5 py-3 text-xs font-extrabold text-on-primary">Open Users</Link></div></section>
    </div>
  );
}
