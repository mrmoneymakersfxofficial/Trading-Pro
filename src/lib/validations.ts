import { z } from "zod";

// ─── AUTH ────────────────────────────────────────────────────
export const registerSchema = z.object({
  name: z.string().min(1, "Nombre es obligatorio").max(100),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres").max(128),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Contraseña obligatoria"),
});

// ─── LICENSES ────────────────────────────────────────────────
export const licenseKeySchema = z.string().regex(
  /^TP-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/,
  "Formato inválido. Use: TP-XXXX-XXXX-XXXX-XXXX"
);

export const activateLicenseSchema = z.object({
  key: licenseKeySchema,
});

export const generateLicenseSchema = z.object({
  level: z.enum(["standard", "pro"]),
  durationMonths: z.enum(["1", "3", "6", "12"]).transform(Number),
  count: z.number().int().min(1).max(50),
});

export const validateLicenseSchema = z.object({
  key: licenseKeySchema,
  brokerId: z.string().optional(),
});

// ─── USERS ───────────────────────────────────────────────────
export const updateBrokerSchema = z.object({
  brokerId: z.string().max(50).optional(),
});

// ─── PAYMENTS (MercadoPago) ─────────────────────────────────
export const createPaymentSchema = z.object({
  licenseLevel: z.enum(["standard", "pro"]),
  licenseDuration: z.enum(["1", "3", "6", "12"]).transform(Number),
});

export const mpWebhookSchema = z.object({
  type: z.string(),
  data: z.object({
    id: z.string(),
  }),
});
