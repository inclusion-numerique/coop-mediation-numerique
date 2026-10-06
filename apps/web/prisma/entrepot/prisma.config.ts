import { defineConfig } from 'prisma/config'

const entrepotDatabaseUrl = process.env.ENTREPOT_DATABASE_URL?.startsWith(
  'postgres',
)
  ? process.env.ENTREPOT_DATABASE_URL
  : process.env.DATABASE_URL

export default defineConfig({
  schema: 'schema.prisma',
  datasource: {
    url: entrepotDatabaseUrl ?? '',
  },
})
