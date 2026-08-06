"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  ZapOff,
  Globe2,
  Crosshair,
  AlertTriangle,
  CheckCircle2,
  Bot,
  DollarSign,
  Link2,
  TrendingUp,
  Activity,
  BarChart3,
  Target,
  Layers,
  ScanSearch,
  Timer,
  Scale,
  ShieldAlert,
  Banknote,
  Percent,
  Wallet,
  LockOpen,
  Flame,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import PremiumHeader from "@/components/shared/PremiumHeader";
import GlowParticleTrail from "@/components/effects/GlowParticleTrail";
import BackgroundParticles from "@/components/effects/BackgroundParticles";

// ─── Animation variants ──────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// ─── HERO ────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-16">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      {/* Radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full bg-emerald-500/[0.06] blur-[160px]" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/[0.07] text-emerald-400 text-xs font-medium tracking-wide uppercase mb-8">
            <ZapOff className="w-3.5 h-3.5" />
            Algoritmo Propietario · 100% Automatizado
          </div>
        </motion.div>

        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.5rem] font-bold text-white leading-[1.1] tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          Trading Algorítmico Automatizado{" "}
          <span className="text-emerald-400">para MT5</span>
        </motion.h1>

        <motion.p
          className="mt-6 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
        >
          Usted gana el <span className="text-zinc-200 font-medium">80%</span>, nosotros el{" "}
          <span className="text-zinc-200 font-medium">20%</span>.
          Si no gana, no cobramos.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Link href="/auth/register">
            <Button
              size="lg"
              className="h-14 px-8 text-base font-semibold rounded-full bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_32px_rgba(16,185,129,0.3)] hover:shadow-[0_0_48px_rgba(16,185,129,0.45)] transition-all duration-300 hover:scale-[1.02]"
            >
              Solicitar Licencia — $650 USD
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link
            href="#como-funciona"
            className="text-sm text-zinc-400 hover:text-white transition-colors underline underline-offset-4 decoration-zinc-600 hover:decoration-emerald-500"
          >
            Ver cómo funciona
          </Link>
        </motion.div>

        {/* Metrics bar */}
        <motion.div
          className="mt-14 flex items-center justify-center gap-8 sm:gap-14"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55 }}
        >
          {[
            { label: "Rendimiento", value: "+12.4%", icon: TrendingUp },
            { label: "Win Rate", value: "68.2%", icon: Target },
            { label: "Operaciones", value: "580+", icon: Activity },
          ].map((m) => (
            <div key={m.label} className="text-center group">
              <m.icon className="w-5 h-5 text-emerald-500/40 mx-auto mb-2 group-hover:text-emerald-400 transition-colors" />
              <p className="text-2xl sm:text-3xl font-bold text-emerald-400">{m.value}</p>
              <p className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-wider mt-1">{m.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Dashboard mockup */}
        <motion.div
          className="mt-16 relative mx-auto max-w-3xl"
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-sm p-6 shadow-2xl shadow-black/40 relative overflow-hidden">
            {/* Inner glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.03] to-transparent pointer-events-none" />
            {/* Top bar */}
            <div className="flex items-center gap-2 mb-5 relative">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
              <span className="ml-3 text-xs text-zinc-500 font-mono">EA Trading Pro — Live</span>
            </div>
            {/* Chart */}
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-3 space-y-3">
                <div className="h-2 w-28 bg-emerald-500/20 rounded" />
                <svg className="w-full h-28 text-emerald-500/30" viewBox="0 0 400 100" fill="none">
                  <path d="M0 80 Q50 70 80 50 T160 35 T240 45 T320 20 T400 30" stroke="currentColor" strokeWidth="2" />
                  <path d="M0 80 Q50 70 80 50 T160 35 T240 45 T320 20 T400 30" stroke="url(#glow)" strokeWidth="1" filter="blur(2px)" />
                  <defs>
                    <linearGradient id="glow" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="rgb(16,185,129)" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="rgb(16,185,129)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="space-y-2">
                {[
                  { label: "P&L", value: "+12.4%", green: true },
                  { label: "Win Rate", value: "68.2%" },
                  { label: "Drawdown", value: "-2.1%" },
                  { label: "Ops/mes", value: "580+" },
                ].map((s) => (
                  <div key={s.label} className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 border border-zinc-800/40">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{s.label}</p>
                    <p className={`text-sm font-semibold font-mono ${s.green ? "text-emerald-400" : "text-zinc-200"}`}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Glow behind card */}
          <div className="absolute -inset-4 bg-emerald-500/[0.04] blur-3xl rounded-3xl -z-10" />
        </motion.div>
      </div>
    </section>
  );
}

// ─── CÓMO FUNCIONA ──────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      icon: Banknote,
      title: "Abra su cuenta en el broker recomendado",
      desc: "Spreads bajos, ejecución rápida y compatibilidad total. Depósito mínimo: $650 USD. Capital 100% suyo.",
      accent: "from-emerald-500/20 to-emerald-500/5",
    },
    {
      icon: Link2,
      title: "Conecte su MetaTrader 5",
      desc: "Instrucciones paso a paso. Toma 10 minutos. Vinculación segura a su VPS y cuenta MT5.",
      accent: "from-cyan-500/20 to-cyan-500/5",
    },
    {
      icon: TrendingUp,
      title: "El algoritmo opera profesionalmente",
      desc: "Usted gana el 80%, nosotros el 20%. Sin costo fijo. Si no gana, no cobramos. 100% automático 24/5.",
      accent: "from-green-500/20 to-green-500/5",
    },
  ];

  return (
    <section id="como-funciona" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          custom={0}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Un modelo alineado con su éxito
          </h2>
          <p className="text-zinc-400 mt-3 max-w-xl mx-auto text-sm">
            Sin suscripción fija. Sin sorpresas. Solo ganancias compartidas.
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
        >
          {steps.map((step, i) => (
            <motion.div key={step.title} variants={fadeUp} custom={i}>
              <div className="relative p-8 rounded-2xl border border-zinc-800/60 bg-zinc-900/30 h-full group hover:border-emerald-500/30 hover:bg-zinc-900/50 transition-all duration-300">
                {/* Gradient overlay */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${step.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                {/* Step number */}
                <span className="absolute top-6 right-6 text-5xl font-bold text-zinc-800/40 select-none group-hover:text-emerald-500/10 transition-colors">
                  {i + 1}
                </span>
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40 transition-all duration-300">
                    <step.icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── TECNOLOGÍA DEL ALGORITMO ──────────────────────────────
function Technology() {
  const items = [
    { icon: BarChart3, text: "EUR/USD · GBP/USD · USD/JPY en M15" },
    { icon: TrendingUp, text: "Trend following + patrones de liquidez institucional" },
    { icon: ScanSearch, text: "Algoritmo propietario multi-filtro con confirmación escalonada" },
    { icon: Timer, text: "Trailing stop dinámico" },
    { icon: Layers, text: "Escala parcial de ganancias" },
    { icon: Globe2, text: "Filtro macroeconómico automático" },
    { icon: ShieldAlert, text: "Circuit breaker diario de protección (-3%)" },
    { icon: Crosshair, text: "Riesgo controlado: 1% por operación" },
  ];

  return (
    <section className="py-24 px-6 bg-zinc-950/50">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          custom={0}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Tecnología del Algoritmo
          </h2>
          <p className="text-zinc-400 mt-3 max-w-xl mx-auto text-sm">
            Algoritmo propietario con gestión de riesgo institucional.
          </p>
        </motion.div>

        <motion.div
          className="grid sm:grid-cols-2 gap-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
        >
          {items.map((item, i) => (
            <motion.div key={i} variants={fadeUp} custom={i}>
              <div className="flex items-center gap-4 p-5 rounded-xl border border-zinc-800/50 bg-zinc-900/20 group hover:border-emerald-500/30 hover:bg-zinc-900/40 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40 transition-all duration-300">
                  <item.icon className="w-4.5 h-4.5 text-emerald-400" />
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed group-hover:text-zinc-200 transition-colors">{item.text}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── PROTECCIÓN DE CAPITAL ────────────────────────────────
function RiskManagement() {
  const cards = [
    {
      icon: Crosshair,
      title: "Riesgo Milimétrico",
      desc: "1% por operación. Cada trade está calculado para proteger su capital.",
    },
    {
      icon: ZapOff,
      title: "Circuit Breaker Diario",
      desc: "-3% en un día → bot se apaga hasta mañana. Cero venganzas contra el mercado.",
    },
    {
      icon: Globe2,
      title: "Filtro Macroeconómico",
      desc: "Exposición al 50% durante NFP, CPI y FOMC. Se adapta a noticias.",
    },
    {
      icon: ShieldCheck,
      title: "Estrategia Pura",
      desc: "Cero martingala, cero grid, cero hedging agresivo. Ratios 1:1 y 1:2.",
    },
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          custom={0}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Protección de Capital por Diseño
          </h2>
        </motion.div>

        <motion.div
          className="grid sm:grid-cols-2 gap-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
        >
          {cards.map((card, i) => (
            <motion.div key={card.title} variants={fadeUp} custom={i}>
              <div className="p-6 rounded-xl border border-zinc-800/50 bg-zinc-900/20 h-full group hover:border-emerald-500/30 hover:bg-zinc-900/40 transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40 transition-all duration-300">
                    <card.icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed pl-[52px] group-hover:text-zinc-300 transition-colors">{card.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── REGLAS DEL SISTEMA ─────────────────────────────────────
function Rules() {
  const rules = [
    { icon: Banknote, text: "Depósito inicial mínimo: $650 USD (capital 100% suyo)" },
    { icon: Percent, text: "20% solo sobre ganancias mensuales" },
    { icon: Scale, text: "Sin ganancias = sin costo" },
    { icon: Wallet, text: "Retire sus ganancias cuando desee" },
    { icon: LockOpen, text: "Las pérdidas por trading NUNCA bloquean su acceso" },
    { icon: Flame, text: "Sin martingale · Sin grid · Sin hedging agresivo" },
    { icon: Clock, text: "Opera en sesiones London + New York (alta liquidez)" },
  ];

  return (
    <section className="py-24 px-6 bg-zinc-950/50">
      <div className="max-w-3xl mx-auto">
        <motion.div
          className="text-center mb-14"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          custom={0}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Reglas Claras para Relaciones a Largo Plazo
          </h2>
        </motion.div>

        <motion.div
          className="space-y-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
        >
          {rules.map((rule, i) => (
            <motion.div key={i} variants={fadeUp} custom={i}>
              <div className="flex items-center gap-4 p-5 rounded-xl border border-zinc-800/50 bg-zinc-900/20 group hover:border-emerald-500/30 hover:bg-zinc-900/40 transition-all duration-300">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40 transition-all duration-300">
                  <rule.icon className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed group-hover:text-zinc-200 transition-colors">{rule.text}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── FOOTER / CTA FINAL ────────────────────────────────────
function FinalCTA() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          custom={0}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            ¿Listo para automatizar su trading?
          </h2>
          <p className="text-zinc-400 mb-8 max-w-lg mx-auto text-sm">
            Sin costo fijo. Sin riesgo oculto. Solo 20% de las ganancias que el algoritmo genere.
          </p>

          <Link href="/auth/register">
            <Button
              size="lg"
              className="h-14 px-10 text-base font-semibold rounded-full bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_32px_rgba(16,185,129,0.3)] hover:shadow-[0_0_48px_rgba(16,185,129,0.45)] transition-all duration-300 hover:scale-[1.02]"
            >
              Activar mi Licencia Hoy
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>

          <p className="mt-10 text-xs text-zinc-600 leading-relaxed max-w-xl mx-auto">
            <AlertTriangle className="w-3 h-3 inline mr-1 -mt-0.5" />
            Disclaimer: El trading de Forex conlleva riesgos significativos y puede no ser adecuado para todos los inversores.
            Los resultados pasados no garantizan resultados futuros. Solo opere con capital que pueda permitirse perder.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ─── FOOTER ─────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-zinc-800/40 py-8 px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-emerald-400" />
          <span className="font-semibold text-white text-sm">EA Trading Pro</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/legal/terms" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            Términos
          </Link>
          <Link href="/legal/privacy" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            Privacidad
          </Link>
          <Link href="/pricing" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            Precios
          </Link>
          <Link href="/faq" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            FAQ
          </Link>
        </div>
        <p className="text-xs text-zinc-600">
          &copy; {new Date().getFullYear()} EA Trading Pro. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}

// ─── LANDING PAGE COMPLETA ──────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white">
      {/* Premium Effects — Landing only */}
      <GlowParticleTrail />
      <BackgroundParticles />

      {/* Global Premium Header */}
      <PremiumHeader variant="landing" />

      <main className="flex-1 relative z-10">
        <Hero />
        <HowItWorks />
        <Technology />
        <RiskManagement />
        <Rules />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
