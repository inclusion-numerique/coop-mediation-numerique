import { build } from 'esbuild'

const variablesPubliques = Object.fromEntries(
  Object.entries(process.env)
    .filter(([nom]) => nom.startsWith('NEXT_PUBLIC_'))
    .map(([nom, valeur]) => [`process.env.${nom}`, JSON.stringify(valeur)]),
)

await build({
  entryPoints: ['src/jobs/run-job.ts', 'src/jobs/verifier-le-bundle.ts'],
  outdir: 'dist',
  outExtension: { '.js': '.cjs' },
  bundle: true,
  platform: 'node',
  target: 'node24',
  format: 'cjs',
  jsx: 'automatic',
  tsconfig: 'tsconfig.json',
  alias: { 'server-only': './node_modules/server-only/empty.js' },
  define: variablesPubliques,
  logLevel: 'warning',
})
