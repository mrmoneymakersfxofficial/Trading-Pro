import Link from "next/link";
import { Bot } from "lucide-react";

const sections = [
  {
    title: "Datos recopilados",
    content:
      "Recopilamos la siguiente información mínima necesaria para operar el servicio: dirección de email, nombre completo y número de cuenta MT5. No solicitamos ni almacenamos datos bancarios, contraseñas de broker ni información financiera sensible.",
  },
  {
    title: "Uso de los datos",
    content:
      "Los datos recopilados se utilizan exclusivamente para: verificación de licencia y activación del algoritmo, cálculo de métricas operativas del algoritmo (win rate, profit share, drawdown), comunicación relacionada con el servicio (notificaciones de estado, actualizaciones) y cumplimiento de obligaciones contractuales.",
  },
  {
    title: "Compartición con terceros",
    content:
      "No compartimos tus datos personales con terceros. Nunca vendemos, alquilamos ni distribuimos información de clientes. Los datos solo se procesan dentro de la infraestructura de EA Trading Pro y nuestro proveedor de base de datos (Supabase).",
  },
  {
    title: "Almacenamiento y seguridad",
    content:
      "Los datos se almacenan en Supabase (PostgreSQL) con infraestructura que cumple estándares enterprise. Toda la comunicación está encriptada en tránsito mediante TLS. Los datos en reposo están protegidos por los mecanismos de seguridad de Supabase, incluyendo Row Level Security (RLS).",
  },
  {
    title: "Tus derechos",
    content:
      "Podés solicitar la eliminación de tus datos en cualquier momento contactando a soporte. Se eliminará toda tu información personal dentro de los 30 días siguientes a la solicitud. La eliminación implica la revocación de licencias activas y el cese del servicio.",
  },
  {
    title: "Cookies y seguimiento",
    content:
      "Utilizamos cookies exclusivamente para gestión de sesión autenticada (Supabase Auth y NextAuth). No utilizamos cookies de seguimiento, analytics de terceros ni píxeles de remarketing.",
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
          ← Volver al inicio
        </Link>

        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Bot className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Política de Privacidad</h1>
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
