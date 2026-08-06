"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Bot } from "lucide-react";

const faqs = [
  {
    q: "¿Cómo gana EA Trading Pro?",
    a: "Solo ganamos cuando usted gana. Retenemos el 20% de las ganancias mensuales. Si en un mes no hay ganancias, no cobramos nada. Sin costo fijo. Nuestro éxito depende del suyo.",
  },
  {
    q: "¿Qué broker necesito?",
    a: "Después de probar múltiples brokers, recomendamos uno específico por sus spreads bajos, ejecución rápida y compatibilidad total con nuestro algoritmo. Le damos el enlace al registrarse.",
  },
  {
    q: "¿Cuánto puedo ganar?",
    a: "Varía según condiciones del mercado. Rendimiento histórico: +12.4% con 68% de operaciones ganadoras. Los resultados pasados no garantizan resultados futuros.",
  },
  {
    q: "¿Puedo retirar dinero?",
    a: "Sí. Puede retirar sus ganancias cuando desee. Si retira capital que comprometa la operatividad del algoritmo, el servicio se pausa hasta restaurar el saldo. Las pérdidas por trading nunca bloquean su acceso.",
  },
  {
    q: "¿Qué pasa si el algoritmo pierde?",
    a: "Las pérdidas son normales en trading. El algoritmo sigue operando sin interrupción. Solo cobramos los meses en que usted gana. Su acceso nunca se bloquea por pérdidas.",
  },
  {
    q: "¿El algoritmo opera solo?",
    a: "Sí. 100% automatizado. Solo necesita MetaTrader 5 abierto en su VPS o PC. El algoritmo detecta oportunidades, ejecuta operaciones y gestiona el riesgo automáticamente.",
  },
  {
    q: "¿Qué pasa si no pago el 20%?",
    a: "El acceso se pausa hasta regularizar el pago del profit share correspondiente. Una vez realizado el pago, el algoritmo se reanuda inmediatamente.",
  },
  {
    q: "¿Hay costo oculto?",
    a: "No. Sin suscripción. Sin cuota mensual. Sin setup fee. Solo el 20% de ganancias mensuales, únicamente si las hay. Si no gana, no paga nada.",
  },
  {
    q: "¿Qué pares opera?",
    a: "EUR/USD, GBP/USD y USD/JPY en timeframe de 15 minutos (M15). Estos pares ofrecen la liquidez necesaria para la estrategia del algoritmo.",
  },
  {
    q: "¿En qué horarios opera?",
    a: "Sesiones de Londres y Nueva York (08:00 a 22:00 UTC). La sesión asiática está bloqueada por baja liquidez, lo que reduce la calidad de las operaciones.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-block mb-8 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          ← Volver al inicio
        </Link>

        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Bot className="w-6 h-6 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Preguntas Frecuentes</h1>
          </div>
          <p className="text-zinc-400 text-sm mt-2">
            Todo lo que necesitás saber sobre EA Trading Pro.
          </p>
        </motion.div>

        <div className="space-y-0">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              className="py-6 border-b border-zinc-800"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={i}
            >
              <h3 className="text-base font-semibold text-white mb-2">
                {faq.q}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {faq.a}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
