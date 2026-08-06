"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Bot,
  Sun,
  Moon,
  Menu,
  X,
  Sparkles,
  LogOut,
  LayoutDashboard,
  Shield,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  href: string;
  icon?: React.ElementType;
}

interface PremiumHeaderProps {
  variant?: "landing" | "app" | "auth";
  userName?: string;
  userRole?: string;
  onSignOut?: () => void;
}

/**
 * Ultra Premium Immersive Header — Global
 *
 * Variants:
 * - landing: full nav with links + CTA
 * - app: compact with user info + sign out (dashboard/admin)
 * - auth: minimal with just logo + back link
 */
export default function PremiumHeader({
  variant = "landing",
  userName,
  userRole,
  onSignOut,
}: PremiumHeaderProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const landingNav: NavItem[] = [
    { label: "Cómo Funciona", href: "#como-funciona" },
    { label: "Precios", href: "/pricing" },
    { label: "FAQ", href: "/faq" },
  ];

  const isActive = (href: string) => {
    if (href.startsWith("#")) return false;
    return pathname === href;
  };

  const isDark = mounted ? theme === "dark" : true;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-zinc-950/80 backdrop-blur-xl border-b border-emerald-500/10 shadow-[0_4px_30px_rgba(16,185,129,0.06)]"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        {/* Top glow line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Left — Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center transition-all duration-300 group-hover:bg-emerald-500/25 group-hover:border-emerald-500/40 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <Bot className="w-5 h-5 text-emerald-400" />
              </div>
              {/* Subtle ping */}
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-white tracking-tight">EA Trading Pro</span>
              {variant === "landing" && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] text-[10px] text-emerald-400 font-medium tracking-wider uppercase">
                  <Sparkles className="w-2.5 h-2.5" />
                  Algoritmo Propietario
                </span>
              )}
              {variant === "app" && userRole === "admin" && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-[10px] text-emerald-400 font-medium tracking-wider uppercase">
                  ADMIN
                </span>
              )}
            </div>
          </Link>

          {/* Center — Desktop Nav (landing only) */}
          {variant === "landing" && (
            <nav className="hidden md:flex items-center gap-1">
              {landingNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                    isActive(item.href)
                      ? "text-emerald-400"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                  }`}
                >
                  {item.label}
                  {isActive(item.href) && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute bottom-0 left-2 right-2 h-[2px] bg-emerald-400 rounded-full"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </nav>
          )}

          {/* Right — Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme toggle */}
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all duration-200"
              aria-label="Toggle theme"
            >
              <Sun className="w-4 h-4 hidden dark:block" />
              <Moon className="w-4 h-4 block dark:hidden" />
            </button>

            {variant === "landing" && (
              <>
                <Link
                  href="/auth/login"
                  className="hidden sm:block text-sm text-zinc-400 hover:text-white transition-colors px-2 py-1"
                >
                  Iniciar Sesión
                </Link>
                <Link href="/auth/register" className="hidden sm:block">
                  <Button
                    size="sm"
                    className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-full px-5 shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all duration-300"
                  >
                    Solicitar Licencia
                  </Button>
                </Link>
              </>
            )}

            {variant === "app" && (
              <>
                <span className="hidden sm:block text-sm text-zinc-400 max-w-[160px] truncate">
                  {userName}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-zinc-400 hover:text-white hover:bg-zinc-800/60 rounded-lg"
                  onClick={onSignOut}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            )}

            {variant === "auth" && (
              <Link
                href="/"
                className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
              >
                <Home className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Volver al inicio</span>
              </Link>
            )}

            {/* Mobile hamburger (landing & app) */}
            {(variant === "landing" || variant === "app") && (
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all"
                aria-label="Menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (variant === "landing" || variant === "app") && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Slide-in panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[280px] bg-zinc-950/95 backdrop-blur-xl border-l border-emerald-500/10 md:hidden"
            >
              <div className="flex flex-col h-full p-6">
                {/* Close */}
                <div className="flex justify-end mb-8">
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Brand */}
                <div className="flex items-center gap-2.5 mb-8">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-lg font-bold text-white">EA Trading Pro</span>
                </div>

                {/* Nav links */}
                <nav className="flex flex-col gap-1 flex-1">
                  {variant === "landing" && (
                    <>
                      {landingNav.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-all text-sm"
                        >
                          {item.label}
                        </Link>
                      ))}
                      <div className="my-4 border-t border-zinc-800" />
                      <Link
                        href="/auth/login"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-all text-sm"
                      >
                        Iniciar Sesión
                      </Link>
                    </>
                  )}

                  {variant === "app" && (
                    <>
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-all text-sm"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                      {userRole === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-all text-sm"
                        >
                          <Shield className="w-4 h-4" />
                          Admin
                        </Link>
                      )}
                      <div className="my-4 border-t border-zinc-800" />
                      <button
                        onClick={() => {
                          setMobileOpen(false);
                          onSignOut?.();
                        }}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesión
                      </button>
                    </>
                  )}
                </nav>

                {/* CTA */}
                {variant === "landing" && (
                  <Link href="/auth/register" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl py-3 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
                      Solicitar Licencia
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Body scroll lock when mobile menu open */}
      {mobileOpen && (
        <style dangerouslySetInnerHTML={{ __html: "body{overflow:hidden}" }} />
      )}
    </>
  );
}
