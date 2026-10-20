import { build } from 'esbuild'

const variablesPubliques = Object.fromEntries(
  Object.entries(process.env)
    .filter(([nom]) => nom.startsWith('NEXT_PUBLIC_'))
    .map(([nom, valeur]) => [`process.env.${nom}`, JSON.stringify(valeur)]),
)

await build({
  entryPoints: ['src/jobs/run-job.ts'],
  outfile: 'dist/run-job.js',
  bundle: true,
  platform: 'node',
  target: 'node24',
  format: 'cjs',
  tsconfig: 'tsconfig.json',
  alias: { 'server-only': './node_modules/server-only/empty.js' },
  define: variablesPubliques,
  logLevel: 'warning',
})
