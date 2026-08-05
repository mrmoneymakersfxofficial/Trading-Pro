"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Shield,
  Zap,
  TrendingUp,
  Clock,
  Lock,
  BarChart3,
  CheckCircle2,
  Star,
  Sun,
  Moon,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
  }),
};

// ─── HERO ────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-emerald-500/5 blur-[120px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm mb-8">
            <Zap className="w-4 h-4" />
            Trading Automatizado con IA
          </div>
        </motion.div>

        <motion.h1
          className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          Opera con{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            Precisión
          </span>
          <br />
          mientras tú descansas
        </motion.h1>

        <motion.p
          className="mt-6 text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          Trading Pro automatiza tus estrategias en MT4/MT5 con licencias
          seguras, resultados verificables y control total desde cualquier
          dispositivo.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
        >
          <Link href="/auth/register">
            <Button
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold px-8 h-13 text-base rounded-xl shadow-lg shadow-emerald-500/25"
            >
              Comenzar Ahora
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="#como-funciona">
            <Button
              variant="outline"
              size="lg"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 h-13 text-base rounded-xl px-8"
            >
              Ver Demo
            </Button>
          </Link>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          {[
            { value: "2.4K+", label: "Usuarios Activos" },
            { value: "98.7%", label: "Uptime" },
            { value: "150+", label: "Estrategias" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-emerald-400">
                {stat.value}
              </div>
              <div className="text-sm text-zinc-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── CÓMO FUNCIONA ───────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      icon: <Lock className="w-7 h-7" />,
      title: "1. Obtén tu Licencia",
      desc: "Regístrate y adquiere una clave de licencia que desbloquea el bot de trading según tu plan (Standard o Pro).",
    },
    {
      icon: <Bot className="w-7 h-7" />,
      title: "2. Conecta tu Broker",
      desc: "Ingresa tu ID de cuenta MT4/MT5 y el bot se vincula automáticamente con tu broker para operar por ti.",
    },
    {
      icon: <TrendingUp className="w-7 h-7" />,
      title: "3. Opera Automáticamente",
      desc: "El bot ejecuta estrategias probadas 24/7 con gestión de riesgo integrada. Monitorea resultados en tiempo real.",
    },
  ];

  return (
    <section id="como-funciona" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          custom={0}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Cómo Funciona
          </h2>
          <p className="mt-4 text-zinc-400 text-lg">
            Tres pasos para automatizar tu trading
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              className="relative p-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:border-emerald-500/30 transition-colors group"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeUp}
              custom={i + 1}
            >
              <div className="w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:bg-emerald-500/20 transition-colors">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {step.title}
              </h3>
              <p className="text-zinc-400 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CARACTERÍSTICAS ─────────────────────────────────────────
function Features() {
  const features = [
    {
      icon: <Bot className="w-6 h-6" />,
      title: "Bot Autónomo 24/7",
      desc: "Ejecuta estrategias de trading sin intervención humana. Opera mercados globales las 24 horas, 7 días a la semana.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Gestión de Riesgo",
      desc: "Stop-loss dinámico, límites de exposición por operación y por día. Protección de capital integrada en cada estrategia.",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Dashboard en Tiempo Real",
      desc: "Visualiza P&L, operaciones abiertas, historial y métricas de rendimiento desde cualquier dispositivo.",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Licencias Flexibles",
      desc: "Planes de 1, 3, 6 o 12 meses. Niveles Standard y Pro. Activa, pausa o revoca desde tu panel de usuario.",
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Seguridad Enterprise",
      desc: "Encriptación AES-256, autenticación OAuth, claves únicas por licencia y auditoría de accesos completa.",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Multi-Broker",
      desc: "Compatible con MT4 y MT5. Conecta múltiples cuentas y brokers simultáneamente sin conflictos.",
    },
  ];

  return (
    <section className="py-24 px-6 bg-zinc-950/50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          custom={0}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Características que Marcan la Diferencia
          </h2>
          <p className="mt-4 text-zinc-400 text-lg">
            Todo lo que necesitas para operar con confianza
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 hover:border-emerald-500/20 transition-all group"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeUp}
              custom={i + 1}
            >
              <div className="w-11 h-11 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                {feat.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {feat.title}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {feat.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── TESTIMONIOS ─────────────────────────────────────────────
function Testimonials() {
  const testimonials = [
    {
      name: "Carlos M.",
      role: "Trader Independiente",
      text: "En 3 meses mi cuenta creció un 34% operando el bot Pro. La gestión de riesgo es impecable — nunca una pérdida mayor al 2% por operación.",
      stars: 5,
    },
    {
      name: "Ana R.",
      role: "Inversora Particular",
      text: "Por fin puedo automatizar sin estar pegada a la pantalla. El dashboard me da tranquilidad de ver todo en tiempo real desde el celular.",
      stars: 5,
    },
    {
      name: "Miguel T.",
      role: "Fundador de Fund",
      text: "Gestionamos 12 cuentas con el plan Pro multi-broker. La auditoría y seguridad enterprise nos da compliance total con reguladores.",
      stars: 5,
    },
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          custom={0}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Resultados que Hablan
          </h2>
          <p className="mt-4 text-zinc-400 text-lg">
            Lo que dicen nuestros traders
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeUp}
              custom={i + 1}
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star
                    key={j}
                    className="w-4 h-4 text-emerald-400 fill-emerald-400"
                  />
                ))}
              </div>
              <p className="text-zinc-300 leading-relaxed mb-6">
                &ldquo;{t.text}&rdquo;
              </p>
              <div>
                <div className="font-semibold text-white">{t.name}</div>
                <div className="text-sm text-zinc-500">{t.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA FINAL ──────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          custom={0}
        >
          <div className="relative p-12 md:p-16 rounded-3xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/5 to-transparent overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px]" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Comienza a Operar con IA Hoy
              </h2>
              <p className="text-zinc-400 text-lg mb-8 max-w-xl mx-auto">
                Únete a miles de traders que ya automatizan sus operaciones.
                Sin tarjeta de crédito para empezar.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/auth/register">
                  <Button
                    size="lg"
                    className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold px-8 h-13 text-base rounded-xl shadow-lg shadow-emerald-500/25"
                  >
                    Crear Cuenta Gratis
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
              <div className="mt-6 flex items-center justify-center gap-6 text-sm text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Setup en 5 min
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Soporte 24/7
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Cancela cuando quieras
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── PRICING ──────────────────────────────────────────────────
function Pricing() {
  const plans = [
    {
      name: "Standard",
      price: 49,
      level: "standard",
      duration: 1,
      features: ["1 Bot de Trading", "1 Cuenta MT4/MT5", "Estrategias Standard", "Soporte por Email", "Dashboard Básico"],
    },
    {
      name: "Pro",
      price: 99,
      level: "pro",
      duration: 1,
      popular: true,
      features: ["Bots Ilimitados", "Multi-Cuenta MT4/MT5", "Estrategias Pro + IA", "Soporte Prioritario 24/7", "Dashboard Avanzado + Realtime"],
    },
  ];

  return (
    <section className="py-24 px-6 bg-zinc-950/50">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          custom={0}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Planes y Precios
          </h2>
          <p className="mt-4 text-zinc-400 text-lg">
            Elige el plan que impulse tu trading
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              className={`relative p-8 rounded-2xl border ${
                plan.popular
                  ? "border-emerald-500/40 bg-emerald-500/5"
                  : "border-zinc-800 bg-zinc-900/50"
              }`}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeUp}
              custom={i + 1}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-black">
                  Más Popular
                </Badge>
              )}
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-white">${plan.price}</span>
                <span className="text-zinc-400">/mes</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2 text-sm text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
              <Link href="/auth/register">
                <Button
                  className={`w-full rounded-xl font-semibold ${
                    plan.popular
                      ? "bg-emerald-500 hover:bg-emerald-600 text-black"
                      : "border-zinc-700 text-white hover:bg-zinc-800"
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  Comenzar con {plan.name}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ─────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-zinc-800 py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-emerald-400" />
          <span className="font-semibold text-white">Trading Pro</span>
        </div>
        <p className="text-sm text-zinc-500">
          &copy; {new Date().getFullYear()} Trading Pro. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}

// ─── THEME TOGGLE ────────────────────────────────────────────
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

// ─── LANDING PAGE COMPLETA ──────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Bot className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-lg font-bold text-white">Trading Pro</span>
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
                className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-lg"
              >
                Registro
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Features />
        <Pricing />
        <Testimonials />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
