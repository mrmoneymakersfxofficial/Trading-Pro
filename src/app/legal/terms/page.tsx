import Link from "next/link";
import { Bot } from "lucide-react";

const sections = [
  {
    title: "Depósito mínimo inicial",
    content: "$650 USD (capital 100% del cliente en su broker). El dinero nunca pasa por EA Trading Pro.",
  },
  {
    title: "Profit share",
    content: "20% solo sobre ganancias mensuales netas. Sin ganancias, sin costo.",
  },
  {
    title: "Sin costo de suscripción fija",
    content: "No cobramos mensualidad, setup fee ni ningún cargo recurrente. Solo el 20% de profit share.",
  },
  {
    title: "Pausa del algoritmo",
    content:
      "Si el cliente retira capital y el saldo baja del mínimo operativo (~$250 USD), el algoritmo se pausa automáticamente. Se reanuda al reponer el saldo.",
  },
  {
    title: "Pérdidas por trading",
    content:
      "Las pérdidas por trading NUNCA bloquean el acceso al algoritmo. El bot sigue operando siempre que el saldo operativo lo permita.",
  },
  {
    title: "Vinculación de licencia",
    content: "1 licencia = 1 VPS (MAC address) + 1 cuenta MT5. No se permite compartir o transferir licencias.",
  },
  {
    title: "Revocación",
    content:
      "EA Trading Pro se reserva el derecho de revocar licencias por uso indebido, manipulación del algoritmo o incumplimiento de estos términos.",
  },
  {
    title: "Disclaimer",
    content:
      "El trading de Forex conlleva riesgos significativos y puede no ser adecuado para todos los inversores. Los resultados pasados no garantizan resultados futuros. Solo opere con capital que pueda permitirse perder.",
  },
];

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold text-white">Términos de Servicio</h1>
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
