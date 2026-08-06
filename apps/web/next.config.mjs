import path from 'node:path'
import { fileURLToPath } from 'node:url'
import withBundleAnalyzer from '@next/bundle-analyzer'
import { withSentryConfig } from '@sentry/nextjs'

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
  // dynamiques), et `xlsx` non plus. Ils étaient jusqu'ici poussés dans les `externals` du
  // hook webpack ; `serverExternalPackages` exprime la même chose pour les deux bundlers.
  serverExternalPackages: ['html-minifier', 'mjml', 'mjml-core', 'xlsx'],
  // This includes files from the monorepo base two directories up
  outputFileTracingRoot: path.join(dirname, '../../'),
  modularizeImports,
  // L'option `eslint` a été supprimée en Next 16, en même temps que la commande `next lint` :
  // `next build` ne lance plus aucun linter. Le dépôt lint avec Biome, dans un job dédié.
  typescript: {
    // Type checks are done in other parts of the build process
    ignoreBuildErrors: true,
  },
  // Le hook `webpack` a disparu avec le passage à Turbopack. Ses deux règles écartaient les
  // `.min.css` du traitement, parce que le `css-loader` de webpack déborde sa pile d'appels
  // sur `dsfr.min.css` — 701 Ko sur une seule ligne. Turbopack les compile sans difficulté ;
  // seul Cypress en a encore besoin, et la règle vit désormais dans son propre
  // `packages/e2e/next.config.js`.
  turbopack: {
    // Le DSFR embarque deux blocs `@media screen and (min-width: 0\0) …`, un hack qui ne
    // vise qu'Internet Explorer 8 à 11 : le `0\0` y est parsé, partout ailleurs il rend la
    // requête invalide et le bloc inopérant. Turbopack refuse de la parser et écarte ces
    // blocs — 171 Ko dans `utility.min.css`, 2 Ko dans `dsfr.min.css`.
    //
    // C'est le comportement souhaitable : ces règles ne s'appliquaient déjà dans aucun
    // navigateur vivant, et leurs équivalents non-IE, eux, sont conservés. Mais
    // l'avertissement se répétait à chaque requête du serveur de dev. On le tait ici, en
    // visant les deux fichiers concernés, pour ne pas masquer une vraie erreur ailleurs.
    ignoreIssue: [
      {
        path: /public\/dsfr\/.*\.min\.css$/,
        title: /Parsing CSS source code failed/,
      },
    ],
  },
}

const enableRelease = process.env.SENTRY_ENABLE_RELEASE === 'true'

export default withBundleAnalyzerConfig(
  withSentryConfig(nextConfig, {
    silent: false, // Suppresses all logs
    tunnelRoute: '/monitoring',
    widenClientFileUpload: true,
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
