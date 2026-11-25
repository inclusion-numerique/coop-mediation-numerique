import { spawnSync } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'

const DOSSIER = '.dependency-cruiser'

const TABLES_VIDES = {
  couches: {},
  app: { routes: {}, 'server-actions': {} },
  libraries: {},
  configuration: {},
  jobs: {},
  cli: {},
}

const chemin = (table) => `${DOSSIER}/${table}.json`

const lire = (table) => readFile(chemin(table), 'utf8')

const ecrire = (table, contenu) =>
  writeFile(chemin(table), `${JSON.stringify(contenu, null, 2)}\n`)

const paquet = (cible) => {
  const segments = cible.split('node_modules/').at(-1).split('/')
  return segments[0].startsWith('@')
    ? segments.slice(0, 2).join('/')
    : segments[0]
}

const nomDeLaCible = (cible, configurationExacte) =>
  cible.includes('node_modules/')
    ? paquet(cible)
    : /^src\/(?:features|styles)\//.test(cible) ||
        (configurationExacte && cible.startsWith('src/configuration/'))
      ? cible.slice(4)
      : /^src\/(?:libraries|configuration|generated)\//.test(cible)
        ? cible.split('/').slice(1, 3).join('/')
        : `node:${cible.replace(/^node:/, '')}`

const dossierDeLaCouche = (source) =>
  source.match(
    /^src\/features\/([^/]+\/(?:abilities\/[^/]+\/)?(?:domain|action|middlewares|implementations\/[^/]+|ui\/[^/]+))\//,
  )[1]

const premierSegment = (source) => source.split('/')[2]

const fixtureAdmiseDuCli = ({ from, to }) =>
  from.startsWith('src/cli/fixtures/') &&
  /^src\/features\/[^/]+\/fixtures\//.test(to)

const LIGNES = [
  {
    regle: /^couche/,
    table: 'couches',
    ligne: ({ from, to }) => [nomDeLaCible(to, false), dossierDeLaCouche(from)],
  },
  {
    regle: /^imports-d-une-route/,
    table: 'routes',
    ligne: ({ from, to }) => [nomDeLaCible(to, true), from.slice(4)],
  },
  {
    regle: /^imports-d-une-server-action$/,
    table: 'server-actions',
    ligne: ({ from, to }) => [nomDeLaCible(to, true), from.slice(4)],
  },
  {
    regle: /^imports-d-une-library$/,
    table: 'libraries',
    ligne: ({ from, to }) => [nomDeLaCible(to, false), premierSegment(from)],
  },
  {
    regle: /^imports-d-un-module-de-configuration$/,
    table: 'configuration',
    ligne: ({ from, to }) => [nomDeLaCible(to, false), premierSegment(from)],
  },
  {
    regle: /^imports-d-un-job$/,
    table: 'jobs',
    ligne: ({ from, to }) => [nomDeLaCible(to, false), premierSegment(from)],
  },
  {
    regle: /^imports-du-cli$/,
    table: 'cli',
    ligne: ({ from, to }) => [nomDeLaCible(to, false), premierSegment(from)],
  },
]

const ligneDe = (violation) =>
  LIGNES.find(({ regle }) => regle.test(violation.rule.name))

const ajouter = (tables, { table, cible, origine }) => ({
  ...tables,
  [table]: {
    ...tables[table],
    [cible]: [...new Set([...(tables[table][cible] ?? []), origine])],
  },
})

const trier = (table) =>
  Object.fromEntries(
    Object.entries(table)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([cible, origines]) => [cible, [...origines].sort()]),
  )

const anciennes = Object.fromEntries(
  await Promise.all(
    Object.keys(TABLES_VIDES).map(async (table) => [table, await lire(table)]),
  ),
)

await Promise.all(
  Object.entries(TABLES_VIDES).map(([table, vide]) => ecrire(table, vide)),
)

const cruise = spawnSync(
  'pnpm',
  ['--silent', 'lint:imports', '--output-type', 'json'],
  { encoding: 'utf8', maxBuffer: 1024 * 1024 * 1024 },
)

const violations = JSON.parse(cruise.stdout).summary.violations.filter(
  (violation) => !fixtureAdmiseDuCli(violation),
)

const horsTables = violations.filter((violation) => !ligneDe(violation))

if (horsTables.length > 0) {
  await Promise.all(
    Object.entries(anciennes).map(([table, contenu]) =>
      writeFile(chemin(table), contenu),
    ),
  )
  process.stderr.write(
    `${[
      'Ces imports ne relèvent d’aucune table : corrige-les avant de régénérer.',
      ...horsTables.map(
        ({ rule, from, to }) => `  ${rule.name} : ${from} → ${to}`,
      ),
    ].join('\n')}\n`,
  )
  process.exit(1)
}

const tables = violations.reduce(
  (acc, violation) => {
    const { table, ligne } = ligneDe(violation)
    const [cible, origine] = ligne(violation)
    return ajouter(acc, { table, cible, origine })
  },
  {
    couches: {},
    routes: {},
    'server-actions': {},
    libraries: {},
    configuration: {},
    jobs: {},
    cli: {},
  },
)

await Promise.all([
  ecrire('couches', trier(tables.couches)),
  ecrire('app', {
    routes: trier(tables.routes),
    'server-actions': trier(tables['server-actions']),
  }),
  ecrire('libraries', trier(tables.libraries)),
  ecrire('configuration', trier(tables.configuration)),
  ecrire('jobs', trier(tables.jobs)),
  ecrire('cli', trier(tables.cli)),
])

spawnSync('pnpm', ['exec', 'biome', 'format', '--write', DOSSIER], {
  stdio: 'ignore',
})

process.stdout.write(
  `${Object.entries(tables)
    .map(
      ([table, lignes]) =>
        `${table} : ${Object.values(lignes).flat().length} lignes`,
    )
    .join('\n')}\n`,
)
