// Generador de License Keys — formato: TP-XXXX-XXXX-XXXX-XXXX
export function generateLicenseKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Sin I,O,0,1 para evitar confusión
  const segment = () =>
    Array.from({ length: 4 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join("");

  return `TP-${segment()}-${segment()}-${segment()}-${segment()}`;
}

// Duraciones disponibles en meses
export const LICENSE_DURATIONS = [1, 3, 6, 12] as const;
export type LicenseDuration = (typeof LICENSE_DURATIONS)[number];

// Niveles de licencia
export const LICENSE_LEVELS = ["standard", "pro"] as const;
export type LicenseLevel = (typeof LICENSE_LEVELS)[number];

// Mapeo de labels
export const LICENSE_DURATION_LABELS: Record<LicenseDuration, string> = {
  1: "1 Mes",
  3: "3 Meses",
  6: "6 Meses",
  12: "12 Meses (Anual)",
};

export const LICENSE_LEVEL_LABELS: Record<LicenseLevel, string> = {
  standard: "Standard",
  pro: "Pro",
};

// Colores de estado para la UI
export const LICENSE_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  active: { label: "Activa", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" },
  expired: { label: "Vencida", color: "text-red-400", bg: "bg-red-500/10 border-red-500/30" },
  pending: { label: "Pendiente", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
  paused: { label: "Pausada", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30" },
  revoked: { label: "Revocada", color: "text-red-500", bg: "bg-red-500/10 border-red-500/30" },
  available: { label: "Disponible", color: "text-sky-400", bg: "bg-sky-500/10 border-sky-500/30" },
  assigned: { label: "Asignada", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" },
};
