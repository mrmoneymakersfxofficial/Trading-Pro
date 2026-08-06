import Link from "next/link";
import { Bot } from "lucide-react";
import PremiumHeader from "@/components/shared/PremiumHeader";

const sections = [
  {
    title: "Depósito mínimo inicial",
    content:
      "$650 USD (capital 100% del cliente en su cuenta de broker). El dinero nunca pasa por EA Trading Pro. El cliente mantiene control absoluto sobre sus fondos en todo momento.",
  },
  {
    title: "Profit share",
    content:
      "20% solo sobre ganancias mensuales netas generadas por el algoritmo. Sin ganancias, sin costo. El cálculo se realiza al cierre de cada mes calendario.",
  },
  {
    title: "Sin costo de suscripción fija",
    content:
      "No cobramos mensualidad, setup fee ni ningún cargo recurrente. El único cobro es el 20% de profit share sobre ganancias efectivamente generadas.",
  },
  {
    title: "Pausa del algoritmo por retiro de capital",
    content:
      "Si el cliente retira capital y el saldo resultante compromete la operatividad del algoritmo, el servicio se pausa hasta que el saldo sea restaurado. Este umbral es interno y se determina según parámetros de gestión de riesgo.",
  },
  {
    title: "Pérdidas por trading",
    content:
      "Las pérdidas por trading NUNCA bloquean el acceso al algoritmo. El bot sigue operando sin interrupción independientemente del drawdown. Solo cobramos los meses en que se generan ganancias.",
  },
  {
    title: "Relación comercial con el broker",
    content:
      "EA Trading Pro mantiene relaciones comerciales con el broker recomendado. Esto no afecta las condiciones de ejecución ni los spreads del cliente. La recomendación se basa en compatibilidad técnica con el algoritmo.",
  },
  {
    title: "Vinculación de licencia",
    content:
      "1 licencia = 1 VPS (dirección MAC) + 1 cuenta MT5. No se permite compartir, transferir o ejecutar el algoritmo en múltiples dispositivos simultáneamente.",
  },
  {
    title: "Revocación",
    content:
      "EA Trading Pro se reserva el derecho de revocar licencias por uso indebido, manipulación del algoritmo, incumplimiento del profit share o violación de estos términos.",
  },
  {
    title: "Disclaimer de riesgo",
    content:
      "El trading de Forex conlleva riesgos significativos y puede no ser adecuado para todos los inversores. Los resultados pasados no garantizan resultados futuros. Puede perder todo o parte de su inversión. Solo opere con capital que pueda permitirse perder. EA Trading Pro no garantiza rentabilidad.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <PremiumHeader variant="landing" />
      <div className="max-w-3xl mx-auto px-6 py-16 pt-24">
        <Link
          href="/"
          className="inline-block mb-8 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          ← Volver al inicio
        </Link>

        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Bot className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Términos de Servicio</h1>
        </div>

        <p className="text-sm text-zinc-400 mb-8">
          Última actualización: {new Date().toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="space-y-6">
          {sections.map((section, i) => (
            <div
              key={i}
              className="p-6 rounded-xl border border-zinc-800/60 bg-zinc-900/30"
            >
              <h2 className="text-lg font-semibold text-white mb-2">
                {i + 1}. {section.title}
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
