import { execFile, spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { cp, mkdir, rm, writeFile } from 'node:fs/promises'
import { dirname, posix } from 'node:path'
import { promisify } from 'node:util'

const CONTENU = 'docs/site/src/content/docs'
const ANNEXES = 'docs/site/annexes'
const DEPOT =
  'https://github.com/inclusion-numerique/coop-mediation-numerique/blob/main/'
const FEATURES = 'src/features'

const lire = (chemin) => readFileSync(chemin, 'utf8')

const sousDossiers = (dossier) =>
  readdirSync(dossier, { withFileTypes: true })
    .filter((entree) => entree.isDirectory())
    .map((entree) => entree.name)
    .sort()

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n/

const PREMIER_TITRE = /^# (.+)\n?/m

const decouper = (texte) => {
  const frontmatter = texte.match(FRONTMATTER)
  const corps = frontmatter ? texte.slice(frontmatter[0].length) : texte
  const titre = corps.match(PREMIER_TITRE)
  return {
    frontmatter: frontmatter ? frontmatter[1] : null,
    titre: titre ? titre[1].trim() : null,
    corps: titre ? corps.replace(PREMIER_TITRE, '') : corps,
  }
}

const page = ({ titre, frontmatter = null, corps }) =>
  `---\n${[`title: ${JSON.stringify(titre)}`, frontmatter]
    .filter(Boolean)
    .join('\n')}\n---\n\n${corps.trimStart()}`

const urlRelative = (depuis, vers) => {
  const relatif = posix.relative(`/${depuis}`, `/${vers}`)
  return relatif === '' ? './' : `${relatif}/`
}

const LIEN = /\]\((?!https?:|mailto:|#)([^)\s]+)\)/g

const reecrireLesLiens = ({ corps, source, slug, slugs }) =>
  corps.replace(LIEN, (_, cible) => {
    const [chemin, ancre] = cible.split('#')
    const resolu = posix.normalize(posix.join(dirname(source), chemin))
    const suffixe = ancre ? `#${ancre}` : ''
    return slugs.has(resolu)
      ? `](${urlRelative(slug, slugs.get(resolu))}${suffixe})`
      : `](${DEPOT}${resolu}${suffixe})`
  })

const sansPrefixeGherkin = (titre) =>
  titre.replace(/^Fonctionnalité\s*:\s*/, '')

const decisions = readdirSync('docs/decisions')
  .filter((fichier) => fichier.endsWith('.md') && fichier !== 'adr-template.md')
  .sort()
  .map((fichier) => ({
    source: `docs/decisions/${fichier}`,
    slug:
      fichier === 'README.md'
        ? 'decisions'
        : `decisions/${fichier.replace(/\.md$/, '')}`,
    titreParDefaut: "Décisions d'architecture",
  }))

const specifications = sousDossiers(FEATURES).flatMap((feature) => [
  ...[`${FEATURES}/${feature}/${feature}.feature.md`]
    .filter((source) => existsSync(source))
    .map((source) => ({
      source,
      slug: `specifications/${feature}`,
      titreParDefaut: feature,
    })),
  ...(existsSync(`${FEATURES}/${feature}/abilities`)
    ? sousDossiers(`${FEATURES}/${feature}/abilities`)
    : []
  )
    .map((ability) => ({
      source: `${FEATURES}/${feature}/abilities/${ability}/${ability}.ability.md`,
      slug: `specifications/${feature}/${ability}`,
      titreParDefaut: ability,
    }))
    .filter(({ source }) => existsSync(source)),
])

const pagesDuDepot = [...decisions, ...specifications]

const slugs = new Map(pagesDuDepot.map(({ source, slug }) => [source, slug]))

const pageDuDepot = ({ source, slug, titreParDefaut }) => {
  const { frontmatter, titre, corps } = decouper(lire(source))
  return {
    slug,
    contenu: page({
      titre: sansPrefixeGherkin(titre ?? titreParDefaut),
      frontmatter,
      corps: reecrireLesLiens({ corps, source, slug, slugs }),
    }),
  }
}

const depcruise = async (arguments_) =>
  (
    await promisify(execFile)('node_modules/.bin/depcruise', arguments_, {
      encoding: 'utf8',
      maxBuffer: 256 * 1024 * 1024,
    })
  ).stdout

const grapheDeLaFeature = (feature) =>
  depcruise([
    'src',
    '--config',
    '.dependency-cruiser.cjs',
    '--include-only',
    `^src/features/${feature}/`,
    '--collapse',
    '^src/features/[^/]+/abilities/[^/]+/[^/]+/|^src/features/[^/]+/[^/]+/',
    '--output-type',
    'dot',
  ])

const enSvg = (dot) =>
  spawnSync('dot', ['-Tsvg'], { input: dot, encoding: 'utf8' })
    .stdout.replace(/^[\s\S]*?(?=<svg)/, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .split('\n')
    .filter((ligne) => ligne.trim() !== '')
    .map((ligne) => ligne.trimStart())
    .join('\n')

const lienVersLesSpecifications = (feature) =>
  specifications.some(({ slug }) => slug.split('/')[1] === feature)
    ? ` [Spécifications de la feature](${urlRelative(`architecture/features/${feature}`, premierePageDe(feature))}).`
    : ''

const pageDArchitecture = async (feature) => ({
  slug: `architecture/features/${feature}`,
  contenu: page({
    titre: feature,
    corps: [
      `Imports entre les couches de la feature, regroupés par couche de la feature et de chacune de ses abilities.${lienVersLesSpecifications(feature)}`,
      '',
      '<div class="graphe-des-imports">',
      enSvg(await grapheDeLaFeature(feature)),
      '</div>',
      '',
    ].join('\n'),
  }),
})

const cellule = (valeur) => `\`${valeur.replaceAll('|', '\\|')}\``

const tableau = (titres, lignes) =>
  [
    `| ${titres.join(' | ')} |`,
    `| ${titres.map(() => '---').join(' | ')} |`,
    ...lignes.map((ligne) => `| ${ligne.join(' | ')} |`),
  ].join('\n')

const tableParCible = (titre, table) =>
  [
    `## ${titre}`,
    '',
    tableau(
      ['Cible', 'Admise dans'],
      Object.entries(table).map(([cible, origines]) => [
        cellule(cible),
        origines.map(cellule).join('<br>'),
      ]),
    ),
    '',
  ].join('\n')

const tableParOrigine = (titre, table) =>
  [
    `## ${titre}`,
    '',
    tableau(
      ['Origine', 'Peut importer'],
      Object.entries(table).map(([origine, cibles]) => [
        cellule(origine),
        cibles.map(cellule).join('<br>'),
      ]),
    ),
    '',
  ].join('\n')

const tableJson = (nom) => JSON.parse(lire(`.dependency-cruiser/${nom}.json`))

const pageDesImportsAdmis = () => {
  const app = tableJson('app')
  const global = tableJson('global')
  return {
    slug: 'architecture/imports-admis',
    contenu: page({
      titre: 'Imports admis',
      corps: [
        'Chaque règle de dependency-cruiser part du plus restrictif ; les imports admis en plus sont des données, écrites par cible. Elles viennent des fichiers `.dependency-cruiser/*.json`.',
        '',
        tableParCible('Couches des features', tableJson('couches')),
        tableParCible('Routes', app.routes),
        tableParCible('Server actions', app['server-actions']),
        tableParCible('Libraries', tableJson('libraries')),
        tableParCible('Configuration', tableJson('configuration')),
        tableParCible('Jobs', tableJson('jobs')),
        tableParCible('CLI', tableJson('cli')),
        tableParOrigine(
          'Confinement des paquets sensibles',
          tableJson('confinement'),
        ),
        ...Object.entries(global).map(([nom, table]) =>
          tableParOrigine(`Règles globales : ${nom}`, table),
        ),
      ].join('\n'),
    }),
  }
}

const featuresAvecGraphe = sousDossiers(FEATURES)

const premierePageDe = (feature) =>
  specifications.find(({ slug }) => slug.split('/')[1] === feature).slug

const pageDesSpecifications = () => ({
  slug: 'specifications',
  contenu: page({
    titre: 'Spécifications exécutables',
    corps: [
      'Chaque ability est décrite par un scénario Gherkin, joué par Cucumber : ces spécifications font foi.',
      '',
      ...[...new Set(specifications.map(({ slug }) => slug.split('/')[1]))].map(
        (feature) =>
          `- [${feature}](${urlRelative('specifications', premierePageDe(feature))})`,
      ),
      '',
    ].join('\n'),
  }),
})

const pageDeLArchitecture = () => ({
  slug: 'architecture',
  contenu: page({
    titre: 'Architecture',
    corps: [
      'Les imports entre zones sont vérifiés par dependency-cruiser à chaque PR.',
      '',
      `- [Imports admis](${urlRelative('architecture', 'architecture/imports-admis')}) : les tables d'exceptions, par cible.`,
      `- [Rapport de dependency-cruiser](${urlRelative('architecture', 'annexes/imports')}index.html) : les imports refusés au moment de la publication.`,
      '',
      '## Graphes par feature',
      '',
      ...featuresAvecGraphe.map(
        (feature) =>
          `- [${feature}](${urlRelative('architecture', `architecture/features/${feature}`)})`,
      ),
      '',
    ].join('\n'),
  }),
})

const RAPPORTS = [
  {
    nom: 'Imports',
    dossier: 'imports',
    description: 'Rapport HTML de dependency-cruiser',
    source: null,
  },
  {
    nom: 'Couverture',
    dossier: 'couverture',
    description: 'Couverture des tests unitaires',
    source: 'coverage/lcov-report',
  },
]

const rapportsDisponibles = RAPPORTS.filter(
  ({ source }) => source === null || existsSync(source),
)

const pageDesRapports = () => ({
  slug: 'rapports',
  contenu: page({
    titre: 'Rapports',
    corps: [
      'Rapports produits par l’outillage du dépôt lors de la publication.',
      '',
      ...rapportsDisponibles.map(
        ({ nom, dossier, description }) =>
          `- [${nom}](${urlRelative('rapports', `annexes/${dossier}`)}index.html) : ${description}.`,
      ),
      '',
    ].join('\n'),
  }),
})

const pageDAccueil = () => ({
  slug: 'index',
  contenu: [
    '---',
    'title: "La Coop de la médiation numérique"',
    'description: "Documentation générée du dépôt"',
    'template: splash',
    'hero:',
    '  tagline: "Décisions, spécifications exécutables, architecture et rapports, générés à chaque fusion sur main."',
    '  actions:',
    '    - text: "Décisions"',
    '      link: "decisions/"',
    '      icon: right-arrow',
    '    - text: "Spécifications"',
    '      link: "specifications/"',
    '      variant: minimal',
    '    - text: "Architecture"',
    '      link: "architecture/"',
    '      variant: minimal',
    '    - text: "Rapports"',
    '      link: "rapports/"',
    '      variant: minimal',
    '---',
    '',
  ].join('\n'),
})

const fichierDeLaPage = (slug) =>
  slug === 'index' ? `${CONTENU}/index.md` : `${CONTENU}/${slug}.md`

const fichierDIndex = (slug) =>
  ['decisions', 'architecture', 'specifications'].includes(slug) ||
  (slug.startsWith('specifications/') && slug.split('/').length === 2)
    ? `${CONTENU}/${slug}/index.md`
    : fichierDeLaPage(slug)

const ecrirePage = async ({ slug, contenu }) => {
  const fichier = fichierDIndex(slug)
  await mkdir(dirname(fichier), { recursive: true })
  await writeFile(fichier, contenu)
}

const rapportDesImports = () =>
  spawnSync('pnpm', ['--silent', 'lint:imports', '--output-type', 'err-html'], {
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  }).stdout

await Promise.all([
  rm(CONTENU, { recursive: true, force: true }),
  rm(ANNEXES, { recursive: true, force: true }),
])

await mkdir(`${ANNEXES}/imports`, { recursive: true })

await cp('docs/content.config.mjs', 'docs/site/src/content.config.mjs')

const pages = [
  pageDAccueil(),
  ...pagesDuDepot.map(pageDuDepot),
  pageDesSpecifications(),
  pageDeLArchitecture(),
  pageDesImportsAdmis(),
  ...(await Promise.all(featuresAvecGraphe.map(pageDArchitecture))),
  pageDesRapports(),
]

await Promise.all([
  ...pages.map(ecrirePage),
  writeFile(`${ANNEXES}/imports/index.html`, rapportDesImports()),
  ...rapportsDisponibles
    .filter(({ source }) => source !== null)
    .map(({ source, dossier }) =>
      cp(source, `${ANNEXES}/${dossier}`, { recursive: true }),
    ),
])

process.stdout.write(
  `${pages.length} pages, rapports : ${rapportsDisponibles.map(({ nom }) => nom).join(', ')}\n`,
)
