"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Link2,
  TrendingUp,
  ShieldAlert,
  ZapOff,
  Globe2,
  Crosshair,
  AlertTriangle,
  CheckCircle2,
  Sun,
  Moon,
  Bot,
  DollarSign,
  Clock,
  Ban,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

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

// ─── Theme Toggle ────────────────────────────────────────────
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
      aria-label="Toggle theme"
    >
      <Sun className="w-4 h-4 hidden dark:block" />
      <Moon className="w-4 h-4 block dark:hidden" />
    </button>
  );
}

// ─── HERO ────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      {/* Radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full bg-emerald-500/[0.04] blur-[140px]" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/[0.07] text-emerald-400 text-xs font-medium tracking-wide uppercase mb-8">
            <ZapOff className="w-3.5 h-3.5" />
            Algoritmo 100% Automatizado · Forex
          </div>
        </motion.div>

        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.5rem] font-bold text-white leading-[1.1] tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          Automatiza tu Trading{" "}
          <span className="text-emerald-400">Institucional</span>{" "}
          en Forex{" "}
          <br className="hidden md:block" />
          sin Perder el Control.
        </motion.h1>

        <motion.p
          className="mt-6 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
        >
          Algoritmo 100% automatizado operando las sesiones de{" "}
          <span className="text-zinc-200 font-medium">Londres</span> y{" "}
          <span className="text-zinc-200 font-medium">Nueva York</span>.
          Tú mantienes el control absoluto de tu capital.
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
              className="h-14 px-8 text-base font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_32px_rgba(16,185,129,0.25)] hover:shadow-[0_0_48px_rgba(16,185,129,0.35)] transition-all duration-300"
            >
              Solicitar Licencia (Mínimo $500 USD)
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

        {/* Abstract dashboard mockup */}
        <motion.div
          className="mt-16 relative mx-auto max-w-3xl"
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-sm p-6 shadow-2xl shadow-black/40">
            {/* Top bar */}
            <div className="flex items-center gap-2 mb-5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
              <span className="ml-3 text-xs text-zinc-500 font-mono">CPA EA Trading Bot — Live</span>
            </div>
            {/* Chart lines */}
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-3 space-y-3">
                <div className="h-2 w-24 bg-emerald-500/20 rounded" />
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
                  { label: "Ops/mes", value: "147" },
                ].map((s) => (
                  <div key={s.label} className="bg-zinc-800/40 rounded-lg px-3 py-2">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{s.label}</p>
                    <p className={`text-sm font-semibold ${s.green ? "text-emerald-400" : "text-zinc-200"}`}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Glow behind card */}
          <div className="absolute -inset-4 bg-emerald-500/[0.03] blur-3xl rounded-3xl -z-10" />
        </motion.div>
      </div>
    </section>
  );
}

// ─── CÓMO FUNCIONA ──────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      icon: DollarSign,
      title: "Fondea tu Cuenta",
      desc: "Abre tu cuenta en nuestro broker asociado con $500 USD — capital óptimo para gestión de riesgo.",
    },
    {
      icon: Link2,
      title: "Conexión Segura",
      desc: "Vinculamos nuestra tecnología a tu cuenta vía SaaS. Todo corre 24/5 en la nube.",
    },
    {
      icon: TrendingUp,
      title: "Crecimiento Compartido",
      desc: "Te quedas con el 80% de las ganancias. Nosotros cobramos un 20% a fin de mes. Si no ganas, no cobramos.",
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
            Un modelo alineado con tu éxito
          </h2>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
        >
          {steps.map((step, i) => (
            <motion.div key={step.title} variants={fadeUp} custom={i}>
              <div className="relative p-8 rounded-2xl border border-zinc-800/60 bg-zinc-900/30 h-full">
                {/* Step number */}
                <span className="absolute top-6 right-6 text-5xl font-bold text-zinc-800/50 select-none">
                  {i + 1}
                </span>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
                  <step.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── VENTAJA COMPETITIVA ────────────────────────────────────
function RiskManagement() {
  const cards = [
    {
      icon: Crosshair,
      title: "Riesgo Milimétrico",
      desc: "Riesgo estricto del 1% por operación.",
    },
    {
      icon: ZapOff,
      title: "Circuit Breaker Diario",
      desc: "Si la cuenta detecta -3% de retroceso en un día, el bot se apaga hasta el día siguiente. Cero venganzas contra el mercado.",
    },
    {
      icon: Globe2,
      title: "Filtro Macroeconómico",
      desc: "Reducción automática de exposición al 50% durante NFP, CPI y FOMC.",
    },
    {
      icon: ShieldAlert,
      title: "Estrategia Pura",
      desc: "Toma de liquidez en M15. Cero martingala, cero promedios. Ratios 1:1 y 1:2.",
    },
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
            Protección de Capital por Diseño
          </h2>
        </motion.div>

        <motion.div
          className="grid sm:grid-cols-2 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
        >
          {cards.map((card, i) => (
            <motion.div key={card.title} variants={fadeUp} custom={i}>
              <div className="p-7 rounded-2xl border border-zinc-800/60 bg-zinc-900/30 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <card.icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">{card.desc}</p>
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
    {
      icon: DollarSign,
      text: "Balance mínimo de operación: $600 USD (incluyendo margen de crecimiento).",
    },
    {
      icon: Ban,
      text: "Retiros que reduzcan el balance por debajo del mínimo pausarán el software.",
    },
    {
      icon: Clock,
      text: "El pago puntual del 20% de profit share es requisito para mantener la licencia activa.",
    },
  ];

  return (
    <section className="py-24 px-6">
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
          className="space-y-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
        >
          {rules.map((rule, i) => (
            <motion.div key={i} variants={fadeUp} custom={i}>
              <div className="flex items-start gap-4 p-6 rounded-xl border border-zinc-800/50 bg-zinc-900/20">
                <div className="w-9 h-9 rounded-lg bg-zinc-800/60 flex items-center justify-center shrink-0 mt-0.5">
                  <rule.icon className="w-4 h-4 text-zinc-400" />
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">{rule.text}</p>
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
    <section className="py-24 px-6 bg-zinc-950/50">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          custom={0}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            ¿Listo para escalar tus operaciones automáticas?
          </h2>

          <Link href="/auth/register">
            <Button
              size="lg"
              className="h-14 px-10 text-base font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_32px_rgba(16,185,129,0.25)] hover:shadow-[0_0_48px_rgba(16,185,129,0.35)] transition-all duration-300"
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
          <span className="font-semibold text-white text-sm">CPA EA Trading Bot</span>
        </div>
        <p className="text-xs text-zinc-600">
          &copy; {new Date().getFullYear()} CPA EA Trading Bot. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}

// ─── LANDING PAGE COMPLETA ──────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-zinc-800/40 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
              <Bot className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">CPA EA</span>
          </Link>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="#como-funciona"
              className="hidden sm:block text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Cómo Funciona
            </Link>
            <Link
              href="/auth/login"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link href="/auth/register">
              <Button
                size="sm"
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg transition-all duration-200"
              >
                Solicitar Licencia
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <RiskManagement />
        <Rules />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
