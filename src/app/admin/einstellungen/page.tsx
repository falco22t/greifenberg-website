import { Settings } from 'lucide-react'

export default function AdminEinstellungenPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-black text-white flex items-center gap-2 mb-2">
        <Settings className="w-6 h-6 text-brand-light" /> Einstellungen
      </h1>
      <p className="text-slate-400 text-sm mb-8">Globale Website-Einstellungen</p>
      <div className="glass rounded-2xl border border-white/6 p-8 text-center">
        <p className="text-slate-400">Einstellungen werden in einem späteren Update hinzugefügt.</p>
      </div>
    </div>
  )
}
