export default function PendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="max-w-md w-full bg-slate-900/80 border border-slate-700 rounded-2xl p-8 shadow-2xl text-center space-y-4">
        <h1 className="text-2xl font-bold text-white">Account Under Review</h1>
        <p className="text-sm text-slate-300">
          Your account has been created but does not have any roles yet.
        </p>
        <p className="text-sm text-slate-400">
          An administrator must review your registration and assign access
          (Sales, Vendor, Finance, Cashier, Support, or Customer) before you
          can use the system.
        </p>
        <p className="text-xs text-slate-500">
          You can safely close this window. Once approved, sign in again from
          the appropriate portal subdomain.
        </p>
      </div>
    </div>
  )
}

