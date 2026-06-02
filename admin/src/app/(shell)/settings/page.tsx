import { Settings, ShieldCheck } from 'lucide-react'

export default function AdminSettingsPage() {
  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Platform Settings</h1>
        <p className="text-slate-400 text-sm mt-0.5">TrustGrid administration configuration</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-indigo-400/10 rounded-xl flex items-center justify-center shrink-0">
            <Settings className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Platform Controls</h2>
            <p className="text-sm text-slate-400 mt-1">
              Global configuration controls will live here. Catalog management is available from the
              Service Catalog section.
            </p>
            <div className="flex items-center gap-2 mt-4 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              Platform-admin access is active
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
