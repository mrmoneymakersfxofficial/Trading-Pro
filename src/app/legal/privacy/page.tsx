import Link from "next/link";
import { Bot } from "lucide-react";

const sections = [
  {
    title: "Datos recopilados",
    content: "Email, nombre y número de cuenta MT5. Solo la información mínima necesaria para operar el servicio.",
  },
  {
    title: "Uso de los datos",
    content:
      "Verificación de licencia, métricas operativas del algoritmo y comunicación relacionada con el servicio.",
  },
  {
    title: "Compartición con terceros",
    content: "No compartimos tus datos personales con terceros. Nunca.",
  },
  {
    title: "Almacenamiento",
    content:
      "Supabase (PostgreSQL). Datos encriptados en tránsito (TLS) y en reposo. Infraestructura con estándares enterprise.",
  },
  {
    title: "Tus derechos",
    content:
      "Podés solicitar la eliminación de tus datos en cualquier momento contactando a soporte. Se eliminará toda tu información dentro de los 30 días siguientes.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-block mb-8 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          ← Volver
        </Link>

        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Bot className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Política de Privacidad</h1>
        </div>

        <div className="space-y-6">
          {sections.map((section, i) => (
            <div
              key={i}
              className="p-6 rounded-xl border border-zinc-800/60 bg-zinc-900/30"
            >
              <h2 className="text-lg font-semibold text-white mb-2">
                {section.title}
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {section.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
