export default function Home() {
  return (
    <main className="container-app py-10">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Financial Tracker</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              UI is ready. Start at{" "}
              <a className="text-primary underline underline-offset-4" href="/login">
                /login
              </a>
              .
            </p>
          </div>
          <div className="hidden sm:block">
            <div className="rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-700 dark:bg-slate-950 dark:text-slate-200">
              Backend endpoints live under <span className="font-mono">/api</span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-2 text-sm text-slate-700 dark:text-slate-200">
          <div className="font-mono">POST /api/auth/register</div>
          <div className="font-mono">POST /api/auth/login</div>
          <div className="font-mono">POST /api/auth/refresh</div>
          <div className="font-mono">GET/POST /api/business</div>
          <div className="font-mono">GET/POST /api/accounts</div>
          <div className="font-mono">DELETE /api/accounts/:id</div>
          <div className="font-mono">GET/POST /api/transactions</div>
          <div className="font-mono">GET /api/financials/dashboard</div>
        </div>
      </div>
    </main>
  );
}
