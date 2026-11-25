import { z } from 'zod'

const schemaOutillage = z.object({
  CONTAINER_NAMESPACE_NAME: z.string().default(''),
  DATABASE_INSTANCE_ID: z.string().optional(),
  DATABASE_INSTANCE_NAME: z.string().default(''),
  DATABASE_PASSWORD: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  DATASPACE_BACKUP_DATABASE_NAME: z.string().optional(),
  DATASPACE_DATABASE_INSTANCE_ID: z.string().optional(),
  GITHUB_TOKEN: z.string().optional(),
  SCW_DEFAULT_REGION: z.string().default('fr-par'),
  SCW_PROJECT_ID: z.string().optional(),
  SCW_SECRET_KEY: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  SENTRY_CI_TOKEN: z.string().optional(),
  SENTRY_ENABLE_RELEASE: z
    .string()
    .optional()
    .transform((valeur) => valeur === 'true'),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  SENTRY_URL: z.url().default('https://sentry.io'),
  WEB_CONTAINER_IMAGE: z.string().optional(),
})

export type VariablesDeLOutillage = keyof z.input<typeof schemaOutillage>

export const environnementOutillage = () => schemaOutillage.parse(process.env)
