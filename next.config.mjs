import path from 'node:path'
import { fileURLToPath } from 'node:url'
import withBundleAnalyzer from '@next/bundle-analyzer'
import { withSentryConfig } from '@sentry/nextjs/config'

const withBundleAnalyzerConfig = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

// Some packages export a lot of modules in a single index file. To avoid them being compiled
// next has added native support for modularize import transform
// https://nextjs.org/docs/advanced-features/compiler#modularize-imports
// https://github.com/vercel/next.js/tree/canary/examples/modularize-imports
const modularizeImports = {
  'date-fns': { transform: 'date-fns/{{member}}' },
}

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  transpilePackages: ['@app/emails'],
  // `mjml` et ses satellites ne peuvent pas être empaquetés (ils font des `require`
  // dynamiques). Ils étaient jusqu'ici poussés dans les `externals` du
  // hook webpack ; `serverExternalPackages` exprime la même chose pour les deux bundlers.
  serverExternalPackages: ['html-minifier-terser', 'mjml', 'mjml-core'],
  // This includes files from the monorepo base two directories up
  outputFileTracingRoot: dirname,
  modularizeImports,
  // L'option `eslint` a été supprimée en Next 16, en même temps que la commande `next lint` :
  // `next build` ne lance plus aucun linter. Le dépôt lint avec Biome, dans un job dédié.
  typescript: {
    // Type checks are done in other parts of the build process
    ignoreBuildErrors: true,
  },
}

const enableRelease = process.env.SENTRY_ENABLE_RELEASE === 'true'

export default withBundleAnalyzerConfig(
  withSentryConfig(nextConfig, {
    silent: false, // Suppresses all logs
    tunnelRoute: '/monitoring',
    widenClientFileUpload: true,
    authToken: process.env.SENTRY_CI_TOKEN,
    release: { create: enableRelease },
    sourcemaps: {
      disable: !enableRelease,
    },
    // Sentry 10 a regroupé les réglages propres au bundler sous `webpack`. Les équivalents
    // à la racine existent encore mais sont dépréciés et émettent un avertissement.
    //
    // Trois options ont par ailleurs été retirées d'ici : `hideSourceMaps`,
    // `disableServerWebpackPlugin` et `disableClientWebpackPlugin`. Elles n'apparaissent nulle
    // part dans le code livré, ni en 10 ni en 9 — elles étaient déjà inertes avant cette
    // montée, et les supprimer ne change donc aucun comportement. Le téléversement des source
    // maps reste piloté par `sourcemaps.disable` ci-dessus.
    webpack: {
      autoInstrumentServerFunctions: true,
      autoInstrumentMiddleware: true,
      reactComponentAnnotation: {
        enabled: false, // this fails mjml compilation
      },
    },
  }),
)
