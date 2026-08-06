"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Bot, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  "Depósito inicial: $650 USD (va al broker, no a nosotros)",
  "Algoritmo 100% automatizado 24/5",
  "Pares: EUR/USD, GBP/USD, USD/JPY en M15",
  "Gestión de riesgo institucional (1% por op, circuit breaker -3%)",
  "Actualizaciones y soporte incluidos",
  "Sin ganancias = sin costo",
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-block mb-8 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          ← Volver
        </Link>

        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex items-center justify-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Bot className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Planes y Precios</h1>
          <p className="text-lg text-zinc-400">Sin costo fijo. Solo pagas cuando ganas.</p>
        </motion.div>

        <motion.div
          className="max-w-lg mx-auto"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <div className="relative p-8 rounded-2xl border-2 border-emerald-500/40 bg-zinc-900/50">
            {/* Popular badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-500 text-black text-xs font-semibold">
              Profit Share
            </div>

            <div className="text-center mb-8 pt-2">
              <div className="text-4xl font-bold text-white">$0<span className="text-lg font-normal text-zinc-400">/mes</span></div>
              <p className="text-sm text-zinc-400 mt-2">
                + 20% profit share solo sobre ganancias
              </p>
            </div>

            <div className="space-y-4 mb-8">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.06 }}
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-zinc-300">{feature}</p>
                </motion.div>
              ))}
            </div>

            <Link href="/auth/register" className="block">
              <Button
                size="lg"
                className="w-full h-12 text-base font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_32px_rgba(16,185,129,0.25)] hover:shadow-[0_0_48px_rgba(16,185,129,0.35)] transition-all duration-300"
              >
                Solicitar Licencia
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
