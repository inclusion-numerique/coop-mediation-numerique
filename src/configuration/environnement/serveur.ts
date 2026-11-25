import { z } from 'zod'

const texte = z.string().min(1)

const active = z
  .string()
  .optional()
  .transform((valeur) => valeur === '1')

const schemaServeur = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  CI: z.string().optional().transform(Boolean),
  IS_E2E: z
    .string()
    .optional()
    .transform((valeur) => valeur === 'true' || valeur === '1'),
  BASE_URL: z.string().optional(),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: texte,
  ENTREPOT_DATABASE_URL: z.string().optional(),
  PRISMA_ENABLE_LOGGING: active,
  SMTP_SERVER: texte,
  SMTP_PORT: z.coerce.number().int().positive(),
  SMTP_USERNAME: texte,
  SMTP_PASSWORD: texte,
  EMAIL_FROM_ADDRESS: texte,
  EMAIL_FROM_NAME: texte,
  PROCONNECT_CLIENT_SECRET: texte,
  RDV_SERVICE_PUBLIC_OAUTH_CLIENT_SECRET: texte,
  RDV_SERVICE_PUBLIC_WEBHOOK_SECRET: texte,
  RDV_SERVICE_PUBLIC_WEBHOOK_DEBUG: active,
  HMAC_SECRET_KEY: texte,
  BREVO_API_KEY: z.string().default(''),
  BREVO_USERS_LIST_ID: z.coerce.number().int().positive(),
  SUDO_USURPATION: active,
})

const schemaServeurWeb = schemaServeur.extend({
  NEXTAUTH_SECRET: texte,
})

export type VariablesDuServeur = keyof z.input<typeof schemaServeurWeb>

export const environnementServeur = schemaServeur.parse(process.env)

export const verifierEnvironnementServeurWeb = () =>
  schemaServeurWeb.parse(process.env)
export * from './outillage'
