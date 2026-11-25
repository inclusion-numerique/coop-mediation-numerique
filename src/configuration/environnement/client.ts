import { z } from 'zod'

const texte = z.string().min(1)

const schemaClient = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  NEXT_PUBLIC_APP_NAME: texte,
  NEXT_PUBLIC_APP_SLUG: texte,
  NEXT_PUBLIC_BRANCH: z.string().optional(),
  NEXT_PUBLIC_CONTACT_EMAIL: z.email(),
  NEXT_PUBLIC_MATOMO_HOST: z.string().optional(),
  NEXT_PUBLIC_MATOMO_SITE_ID: z.string().optional(),
  NEXT_PUBLIC_PROCONNECT_CLIENT_ID: texte,
  NEXT_PUBLIC_PROCONNECT_HOSTNAME: texte,
  NEXT_PUBLIC_RDV_SERVICE_PUBLIC_OAUTH_CLIENT_ID: texte,
  NEXT_PUBLIC_RDV_SERVICE_PUBLIC_OAUTH_HOSTNAME: texte,
  NEXT_PUBLIC_SENTRY_DSN: z.union([z.url(), z.literal('')]).optional(),
  NEXT_PUBLIC_SENTRY_ENVIRONMENT: z.string().default('local'),
})

export type VariablesDuClient = keyof z.input<typeof schemaClient>

export const environnementClient = () =>
  schemaClient.parse({
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_SLUG: process.env.NEXT_PUBLIC_APP_SLUG,
    NEXT_PUBLIC_BRANCH: process.env.NEXT_PUBLIC_BRANCH,
    NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
    NEXT_PUBLIC_MATOMO_HOST: process.env.NEXT_PUBLIC_MATOMO_HOST,
    NEXT_PUBLIC_MATOMO_SITE_ID: process.env.NEXT_PUBLIC_MATOMO_SITE_ID,
    NEXT_PUBLIC_PROCONNECT_CLIENT_ID:
      process.env.NEXT_PUBLIC_PROCONNECT_CLIENT_ID,
    NEXT_PUBLIC_PROCONNECT_HOSTNAME:
      process.env.NEXT_PUBLIC_PROCONNECT_HOSTNAME,
    NEXT_PUBLIC_RDV_SERVICE_PUBLIC_OAUTH_CLIENT_ID:
      process.env.NEXT_PUBLIC_RDV_SERVICE_PUBLIC_OAUTH_CLIENT_ID,
    NEXT_PUBLIC_RDV_SERVICE_PUBLIC_OAUTH_HOSTNAME:
      process.env.NEXT_PUBLIC_RDV_SERVICE_PUBLIC_OAUTH_HOSTNAME,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
  })
