"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Bot } from "lucide-react";

const faqs = [
  {
    q: "¿Qué broker puedo usar?",
    a: "Cualquier broker que soporte MetaTrader 5 (MT5).",
  },
  {
    q: "¿Cuánto puedo ganar?",
    a: "Los retornos son variables. Históricamente el algoritmo ha generado +12.4% mensual promedio. Resultados pasados no garantizan futuros.",
  },
  {
    q: "¿Puedo retirar mis ganancias?",
    a: "Sí, en cualquier momento. Solo asegúrate de mantener un saldo operativo de al menos ~$250 USD.",
  },
  {
    q: "¿Qué pasa si tengo pérdidas?",
    a: "El algoritmo sigue operando. Las pérdidas por trading NUNCA bloquean tu acceso.",
  },
  {
    q: "¿Hay costo mensual fijo?",
    a: "No. Solo cobramos 20% de las ganancias mensuales. Sin ganancias, sin costo.",
  },
  {
    q: "¿Qué pares opera?",
    a: "EUR/USD, GBP/USD y USD/JPY en timeframe M15.",
  },
  {
    q: "¿En qué horarios opera?",
    a: "Sesiones de Londres y Nueva York. La sesión asiática está bloqueada.",
  },
  {
    q: "¿Cómo se vincula el bot?",
    a: "Recibes una licencia que vinculas a tu MT5. Se conecta 1 VPS + 1 cuenta.",
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
          ← Volver
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
