const FICHIER_DE_TEST =
  '[.](?:spec|integration|stories|cy|steps|cucumber|test)[.]tsx?$|/fixtures/'

const TEST_UNITAIRE = '[.](?:spec|stories|cy)[.]tsx?$'

const TEST_DE_COMPOSITION = '[.](?:integration|steps|cucumber)[.]ts$|/fixtures/'

const donnees = (nom) => require(`./.dependency-cruiser/${nom}.json`)

const {
  'fichiers-de-test-admis': FICHIERS_DE_TEST_ADMIS,
  'hors-de-src-admis': HORS_DE_SRC_ADMIS,
  'racine-du-depot-admise': RACINE_DU_DEPOT_ADMISE,
  'app-admise-dans-une-feature': APP_ADMISE_DANS_UNE_FEATURE,
} = donnees('global')

const { routes: ROUTES_ADMISES, 'server-actions': SERVER_ACTIONS_ADMISES } =
  donnees('app')

const IMPORTS_ADMIS = donnees('couches')

const IMPORTS_ADMIS_DES_LIBRARIES = donnees('libraries')

const IMPORTS_ADMIS_DE_LA_CONFIGURATION = donnees('configuration')

const IMPORTS_ADMIS_DES_JOBS = donnees('jobs')

const IMPORTS_ADMIS_DU_CLI = donnees('cli')

const CONFINEMENT = donnees('confinement')

const DEV_DEPENDENCIES_ADMISES = {}

const MODULES_NODE_DEPRECIES = [
  '^v8/tools/codemap$',
  '^v8/tools/consarray$',
  '^v8/tools/csvparser$',
  '^v8/tools/logreader$',
  '^v8/tools/profile_view$',
  '^v8/tools/profile$',
  '^v8/tools/SourceMap$',
  '^v8/tools/splaytree$',
  '^v8/tools/tickprocessor-driver$',
  '^v8/tools/tickprocessor$',
  '^node-inspect/lib/_inspect$',
  '^node-inspect/lib/internal/inspect_client$',
  '^node-inspect/lib/internal/inspect_repl$',
  '^punycode$',
  '^domain$',
  '^constants$',
  '^sys$',
  '^_linklist$',
  '^_stream_wrap$',
]

const PAQUET = (noms) => `node_modules/(?:${noms.join('|')})/`

const cheminExact = (chemin) =>
  `^${chemin.replace(/[.()[\]$^+?*{}|\\]/g, (caractere) => (caractere === ']' ? '\\]' : `[${caractere}]`))}$`

const cible = (nom) =>
  nom.startsWith('node:')
    ? `^(?:node:)?${nom.slice(5)}$`
    : /^(?:libraries|configuration|features|generated|styles)\//.test(nom)
      ? /[.][a-z]+$/.test(nom)
        ? cheminExact(`src/${nom}`)
        : `^src/${nom}/`
      : `node_modules/${nom}/`

const parModule = (table) =>
  Object.entries(table).reduce(
    (parNom, [cibleAdmise, modules]) =>
      modules.reduce(
        (acc, module) => ({
          ...acc,
          [module]: [...(acc[module] ?? []), cibleAdmise],
        }),
        parNom,
      ),
    {},
  )

const FICHIERS_DES_ROUTES_ADMISES = parModule(ROUTES_ADMISES)

const FICHIERS_DES_SERVER_ACTIONS_ADMISES = parModule(SERVER_ACTIONS_ADMISES)

const DANS_UNE_FEATURE = (suite) => [
  `^src/features/[^/]+/${suite}`,
  `^src/features/[^/]+/abilities/[^/]+/${suite}`,
]

const IMPORTS_D_UNE_ROUTE = [
  ...DANS_UNE_FEATURE('ui/(?:pages|layouts|slots|presenters|filtres)/'),
  ...DANS_UNE_FEATURE('action/[^/]+[.]key[.]ts$'),
  ...DANS_UNE_FEATURE('(?:domain|implementations)/'),
  '^src/features/[^/]+/middlewares/',
  '^src/app/_actions/',
  '^src/configuration/projet/(?:index|serveur)[.]ts$',
  '^src/configuration/telemetry/serveur[.]ts$',
  '^src/configuration/environnement/serveur[.]ts$',
  '^src/libraries/nextjs/',
  '^src/libraries/etat-encode/',
  PAQUET(['next', 'react', '@arckit/nextjs']),
]

const IMPORTS_D_UNE_ROUTE_D_API = [
  ...IMPORTS_D_UNE_ROUTE,
  '^src/libraries/json-api/',
]

const IMPORTS_D_UNE_SERVER_ACTION = [
  '^src/features/[^/]+/middlewares/',
  ...DANS_UNE_FEATURE('(?:domain|implementations)/'),
  ...DANS_UNE_FEATURE('action/[^/]+[.](?:validation|errors|transfer)[.]ts$'),
  ...DANS_UNE_FEATURE('ui/presenters/'),
  '^src/configuration/nextjs/',
  '^src/configuration/telemetry/serveur[.]ts$',
  '^src/libraries/(?:nextjs|result)/',
]

const cles = (table) => Object.keys(table)

const exceptions = (nom, table, regle) =>
  Object.entries(table).map(([de, admis]) => ({
    name: `${nom} (${de})`,
    severity: 'error',
    comment: `Exception de ${nom} : ce fichier n'importe que ce que sa table lui accorde`,
    ...regle(de, admis),
  }))

const GLOBAL = [
  {
    name: 'pas-de-cycle',
    severity: 'error',
    comment:
      'Aucun cycle, imports de type compris : un module ne dépend pas, même indirectement, de ce qui dépend de lui',
    from: {},
    to: { circular: true },
  },
  {
    name: 'import-resolu',
    severity: 'error',
    comment: 'Tout import se résout vers un fichier ou un paquet existant',
    from: {},
    to: { couldNotResolve: true },
  },
  {
    name: 'paquet-declare',
    severity: 'error',
    comment: 'Un paquet importé est déclaré dans package.json',
    from: {},
    to: { dependencyTypes: ['npm-no-pkg', 'npm-unknown'] },
  },
  {
    name: 'module-node-non-deprecie',
    severity: 'error',
    comment: 'Aucun module de Node déprécié',
    from: {},
    to: { dependencyTypes: ['core'], path: MODULES_NODE_DEPRECIES },
  },
  {
    name: 'pas-de-dev-dependency-en-production',
    severity: 'error',
    comment:
      "Le code de production n'importe aucune devDependency : elle n'est pas installée en production",
    from: {
      path: '^src/',
      pathNot: [FICHIER_DE_TEST, ...cles(DEV_DEPENDENCIES_ADMISES)],
    },
    to: { dependencyTypes: ['npm-dev'] },
  },
  ...exceptions(
    'pas-de-dev-dependency-en-production',
    DEV_DEPENDENCIES_ADMISES,
    (de, admis) => ({
      from: { path: de },
      to: { dependencyTypes: ['npm-dev'], pathNot: admis },
    }),
  ),
  {
    name: 'pas-d-import-d-un-test',
    severity: 'error',
    comment:
      "Le code qui n'est pas un test n'importe ni un test, ni des steps, ni des fixtures",
    from: {
      pathNot: [FICHIER_DE_TEST, '^e2e/', ...cles(FICHIERS_DE_TEST_ADMIS)],
    },
    to: { path: FICHIER_DE_TEST },
  },
  ...exceptions(
    'pas-d-import-d-un-test',
    FICHIERS_DE_TEST_ADMIS,
    (de, admis) => ({
      from: { path: de },
      to: { path: FICHIER_DE_TEST, pathNot: admis },
    }),
  ),
  {
    name: 'rien-hors-de-src',
    severity: 'error',
    comment: "Le code de src/ n'importe rien hors de src/, sauf des paquets",
    from: { path: '^src/', pathNot: cles(HORS_DE_SRC_ADMIS) },
    to: {
      pathNot: ['^src/', '^node_modules/'],
      dependencyTypesNot: ['core'],
    },
  },
  ...exceptions('rien-hors-de-src', HORS_DE_SRC_ADMIS, (de, admis) => ({
    from: { path: de },
    to: {
      pathNot: ['^src/', '^node_modules/', ...admis],
      dependencyTypesNot: ['core'],
    },
  })),
  {
    name: 'racine-du-depot',
    severity: 'error',
    comment:
      "Les fichiers de configuration des outils n'importent de src/ que src/configuration/",
    from: {
      pathNot: ['^src/', '^e2e/', ...cles(RACINE_DU_DEPOT_ADMISE)],
    },
    to: {
      pathNot: ['^src/configuration/', '^node_modules/'],
      dependencyTypesNot: ['core'],
    },
  },
  ...exceptions('racine-du-depot', RACINE_DU_DEPOT_ADMISE, (de, admis) => ({
    from: { path: de },
    to: {
      pathNot: ['^src/configuration/', '^node_modules/', ...admis],
      dependencyTypesNot: ['core'],
    },
  })),
]

const exceptionsDeApp = (nom, fichiers, imports) =>
  Object.entries(fichiers).map(([fichier, admis]) => ({
    name: `${nom} (${fichier})`,
    severity: 'error',
    comment: `Exception de ${nom} : ce fichier importe en plus ${admis.join(', ')}`,
    from: { path: cheminExact(`src/${fichier}`) },
    to: { pathNot: [...imports, ...admis.map(cible)] },
  }))

const APP = [
  {
    name: 'imports-d-une-route',
    severity: 'error',
    comment:
      "Une route compose : elle n'importe que les pages, layouts, slots, présentateurs, filtres, clés d'action, domaines, implémentations et middlewares des features, les server actions, et le strict nécessaire de la configuration et des libraries (UI-1, AR-5)",
    from: {
      path: '^src/app/',
      pathNot: [
        '^src/app/_actions/',
        '^src/app/api/v1/',
        FICHIER_DE_TEST,
        ...cles(FICHIERS_DES_ROUTES_ADMISES).map((fichier) =>
          cheminExact(`src/${fichier}`),
        ),
      ],
    },
    to: { pathNot: IMPORTS_D_UNE_ROUTE },
  },
  {
    name: 'imports-d-une-route-d-api',
    severity: 'error',
    comment:
      "Une route de l'API v1 importe ce qu'importe une route, et la library json-api",
    from: {
      path: '^src/app/api/v1/',
      pathNot: [
        FICHIER_DE_TEST,
        ...cles(FICHIERS_DES_ROUTES_ADMISES).map((fichier) =>
          cheminExact(`src/${fichier}`),
        ),
      ],
    },
    to: { pathNot: IMPORTS_D_UNE_ROUTE_D_API },
  },
  ...exceptionsDeApp(
    'imports-d-une-route',
    FICHIERS_DES_ROUTES_ADMISES,
    IMPORTS_D_UNE_ROUTE,
  ).map((regle) =>
    regle.from.path.startsWith('^src/app/api/v1/')
      ? {
          ...regle,
          to: {
            pathNot: [
              ...regle.to.pathNot,
              ...IMPORTS_D_UNE_ROUTE_D_API.slice(IMPORTS_D_UNE_ROUTE.length),
            ],
          },
        }
      : regle,
  ),
  {
    name: 'imports-d-une-server-action',
    severity: 'error',
    comment:
      "Une server action compose : elle n'importe que les middlewares, domaines, implémentations et contrats d'action des features, le constructeur d'actions et le rapporteur d'erreurs de la configuration, et les libraries nextjs et result",
    from: {
      path: '^src/app/_actions/',
      pathNot: [
        FICHIER_DE_TEST,
        ...cles(FICHIERS_DES_SERVER_ACTIONS_ADMISES).map((fichier) =>
          cheminExact(`src/${fichier}`),
        ),
      ],
    },
    to: { pathNot: IMPORTS_D_UNE_SERVER_ACTION },
  },
  ...exceptionsDeApp(
    'imports-d-une-server-action',
    FICHIERS_DES_SERVER_ACTIONS_ADMISES,
    IMPORTS_D_UNE_SERVER_ACTION,
  ),
]

const FEATURES = [
  {
    name: 'feature-sans-app',
    severity: 'error',
    comment:
      "Une feature n'importe rien de app/ : ce sont les points d'entrée qui l'importent",
    from: {
      path: '^src/features/',
      pathNot: cles(APP_ADMISE_DANS_UNE_FEATURE),
    },
    to: { path: '^src/app/' },
  },
  ...exceptions(
    'feature-sans-app',
    APP_ADMISE_DANS_UNE_FEATURE,
    (de, admis) => ({
      from: { path: de },
      to: { path: '^src/app/', pathNot: admis },
    }),
  ),
  {
    name: 'feature-isolee',
    severity: 'error',
    comment:
      "Une feature n'importe aucune autre feature, tests compris : seuls les points d'entrée composent plusieurs features",
    from: { path: '^src/features/([^/]+)/' },
    to: { path: '^src/features/', pathNot: '^src/features/$1/' },
  },
  {
    name: 'ability-isolee',
    severity: 'error',
    comment:
      "Une ability n'importe aucune autre ability ; seuls ses tests de composition (intégration, steps, hooks Cucumber, fixtures) importent les abilities de leur feature",
    from: {
      path: '^src/features/([^/]+)/abilities/([^/]+)/',
      pathNot: TEST_DE_COMPOSITION,
    },
    to: {
      path: '^src/features/$1/abilities/',
      pathNot: '^src/features/$1/abilities/$2/',
    },
  },
  {
    name: 'racine-d-une-feature-sans-ses-abilities',
    severity: 'error',
    comment:
      "La racine d'une feature n'importe pas ses abilities ; seuls ses tests de composition (intégration, steps, hooks Cucumber, fixtures) les importent",
    from: {
      path: '^src/features/([^/]+)/',
      pathNot: ['^src/features/[^/]+/abilities/', TEST_DE_COMPOSITION],
    },
    to: { path: '^src/features/$1/abilities/' },
  },
  {
    name: 'test-unitaire-sans-fixture',
    severity: 'error',
    comment:
      "Un test unitaire, une story ou un test de composant n'importe aucune fixture : il écrit ses valeurs avec les constructeurs du domaine",
    from: { path: `^(.+)${TEST_UNITAIRE}` },
    to: { path: '/fixtures/', pathNot: '^$1[.]tsx?$' },
  },
]

const SOCLES = {
  domain: ['zod', 'libraries/model', 'libraries/result', '@arckit/resultset'],
  action: ['zod', 'libraries/nextjs'],
  middlewares: ['libraries/nextjs', 'next'],
  'implementations/api': ['axios', 'zod', 'libraries/result'],
  'implementations/api-entreprise': [
    'configuration/recherche-entreprises',
    'libraries/recherche-entreprises',
  ],
  'implementations/api-v1': ['libraries/json-api', 'zod', 'next'],
  'implementations/ban': ['libraries/ban'],
  'implementations/brevo': ['configuration/brevo', 'axios'],
  'implementations/crypto': ['node:crypto'],
  'implementations/csv': ['csv-stringify'],
  'implementations/email': [
    'libraries/emails',
    '@faire/mjml-react',
    'configuration/smtp',
    'configuration/projet',
  ],
  'implementations/entrepot': ['configuration/prisma', 'generated/entrepot'],
  'implementations/excel': ['exceljs', 'libraries/tableur'],
  'implementations/fichier': ['node:fs', 'node:readline'],
  'implementations/next': ['next'],
  'implementations/next-auth': ['next-auth'],
  'implementations/oauth': [],
  'implementations/prisma': [
    'configuration/prisma',
    'generated/prisma',
    'libraries/result',
    '@arckit/resultset',
  ],
  'implementations/proconnect': ['next-auth', '@auth/core'],
  'implementations/recherche-entreprises': [
    'configuration/recherche-entreprises',
    'libraries/recherche-entreprises',
  ],
  'implementations/secret': ['node:crypto'],
  'implementations/session': ['next', 'react', 'server-only'],
  'implementations/webhook': ['node:crypto'],
  'ui/pages': [
    'react',
    'next',
    '@codegouvfr/react-dsfr',
    'libraries/ui',
    'libraries/liens-d-evitement',
    'classnames',
  ],
  'ui/layouts': [
    'react',
    'next',
    '@codegouvfr/react-dsfr',
    'libraries/ui',
    'libraries/liens-d-evitement',
    'classnames',
  ],
  'ui/components': [
    'react',
    'next',
    '@codegouvfr/react-dsfr',
    'libraries/ui',
    'libraries/nextjs',
    'classnames',
    '@arckit/resultset',
  ],
  'ui/slots': [
    'react',
    'next',
    '@codegouvfr/react-dsfr',
    'libraries/ui',
    'libraries/nextjs',
    'classnames',
  ],
  'ui/forms': [
    'react',
    'next',
    '@codegouvfr/react-dsfr',
    'libraries/ui',
    'libraries/nextjs',
    'classnames',
    'libraries/formulaire',
    '@tanstack/react-form',
    'zod',
  ],
  'ui/labels': ['react', 'libraries/ui', 'libraries/pictograms'],
  'ui/filtres': ['libraries/etat-d-url', '@arckit/resultset'],
  'ui/hooks': ['react', 'libraries/nextjs'],
  'ui/columns': ['react', 'libraries/ui', '@codegouvfr/react-dsfr'],
  'ui/presenters': ['@arckit/resultset'],
  'ui/search-params': [],
}

const OUTILS_DE_TEST = ['vitest', '@storybook/react', 'storybook']

const VALEURS = [
  'libraries/insee',
  'libraries/telephone',
  'libraries/nom-affiche',
  'libraries/departement',
  'libraries/code-postal',
  'libraries/adresse',
  'libraries/texte-riche',
]

const OUTILS_GENERIQUES = ['libraries/collections', 'libraries/texte']

const AFFICHAGE = [
  'libraries/date',
  'libraries/pluriel',
  'libraries/nombre',
  'libraries/proportions',
  'libraries/pictograms',
  'libraries/ui',
  'libraries/data-table',
  'libraries/navigateur',
  'libraries/chemin-interne',
  'libraries/liens-d-evitement',
  'libraries/nextjs',
  'libraries/model',
  'libraries/etat-d-url',
  'libraries/formulaire',
  '@tanstack/react-form',
]

const SOCLES_DES_COUCHES = {
  domain: [],
  action: OUTILS_GENERIQUES,
  middlewares: OUTILS_GENERIQUES,
  implementations: [...VALEURS, ...OUTILS_GENERIQUES, 'libraries/date'],
  ui: [...VALEURS, ...OUTILS_GENERIQUES, ...AFFICHAGE],
}

const TECHNIQUES = cles(SOCLES)
  .filter((couche) => couche.startsWith('implementations/'))
  .map((couche) => couche.slice('implementations/'.length))

const ROLES = cles(SOCLES)
  .filter((couche) => couche.startsWith('ui/'))
  .map((couche) => couche.slice('ui/'.length))

const internes = ({ feature, ability, couche, sous }) => {
  const racine = `^src/features/${feature}/`
  const niveaux = ability
    ? [racine, `${racine}abilities/${ability}/`]
    : [racine]
  const parCouche = {
    domain: () => niveaux.map((n) => `${n}domain/`),
    action: () => niveaux.flatMap((n) => [`${n}domain/`, `${n}action/`]),
    middlewares: () => [
      `${racine}domain/`,
      `${racine}implementations/`,
      `${racine}middlewares/`,
    ],
    implementations: () =>
      niveaux.flatMap((n) => [`${n}domain/`, `${n}implementations/${sous}/`]),
    ui: () =>
      niveaux.flatMap((n) => [
        `${n}domain/`,
        `${n}action/[^/]+[.](?:key|validation)[.]ts$`,
        `${n}ui/`,
      ]),
  }
  return parCouche[couche]()
}

const admisDans = (emplacement, supplementaires) => [
  ...internes(emplacement),
  ...SOCLES_DES_COUCHES[emplacement.couche].map(cible),
  ...(
    SOCLES[
      emplacement.sous
        ? `${emplacement.couche}/${emplacement.sous}`
        : emplacement.couche
    ] ?? []
  ).map(cible),
  ...OUTILS_DE_TEST.map(cible),
  ...supplementaires.map(cible),
]

const DOSSIERS_ADMIS = Object.entries(IMPORTS_ADMIS).reduce(
  (parDossier, [nom, dossiers]) =>
    dossiers.reduce(
      (acc, dossier) => ({ ...acc, [dossier]: [...(acc[dossier] ?? []), nom] }),
      parDossier,
    ),
  {},
)

const emplacementDe = (dossier) => {
  const [, feature, ability, couche, sous] = dossier.match(
    /^([^/]+)\/(?:abilities\/([^/]+)\/)?(domain|action|middlewares|implementations|ui)(?:\/([^/]+))?$/,
  )
  return { feature, ability, couche, sous }
}

const DOSSIERS_DES_TABLES = cles(DOSSIERS_ADMIS).map(
  (dossier) => `^src/features/${dossier}/`,
)

const coucheGenerique = (couche, sous, autresSous) =>
  [
    { ability: false, chemin: '^src/features/([^/]+)/' },
    { ability: true, chemin: '^src/features/([^/]+)/abilities/([^/]+)/' },
  ]
    .filter(({ ability }) => !ability || couche !== 'middlewares')
    .map(({ ability, chemin }) => {
      const groupeDuSous = ability ? '$3' : '$2'
      const sousCapture = sous === null
      const emplacement = {
        feature: '$1',
        ability: ability ? '$2' : null,
        couche,
        sous: sousCapture ? groupeDuSous : sous,
      }
      return {
        name: `couche-${couche}${sous ? `-${sous}` : sousCapture ? '-autre' : ''}${ability ? '-d-une-ability' : '-d-une-feature'}`,
        severity: 'error',
        comment: `Ce que la couche ${couche}${sous ? `/${sous}` : ''} ${ability ? "d'une ability" : "d'une feature"} peut importer : ses couches voisines admises, son socle, et les lignes d'IMPORTS_ADMIS`,
        from: {
          path: `${chemin}${couche}/${sousCapture ? '([^/]+)/' : sous ? `${sous}/` : ''}`,
          pathNot: [
            TEST_DE_COMPOSITION,
            ...DOSSIERS_DES_TABLES,
            ...(sousCapture
              ? [`${chemin}${couche}/(?:${autresSous.join('|')})/`]
              : []),
            ...(ability ? [] : ['^src/features/[^/]+/abilities/']),
          ],
        },
        to: { pathNot: admisDans(emplacement, []) },
      }
    })

const COUCHES = [
  ...coucheGenerique('domain', undefined),
  ...coucheGenerique('action', undefined),
  ...coucheGenerique('middlewares', undefined),
  ...TECHNIQUES.flatMap((technique) =>
    coucheGenerique('implementations', technique),
  ),
  ...coucheGenerique('implementations', null, TECHNIQUES),
  ...ROLES.flatMap((role) => coucheGenerique('ui', role)),
  ...Object.entries(DOSSIERS_ADMIS).map(([dossier, noms]) => ({
    name: `couches (${dossier})`,
    severity: 'error',
    comment: `Exception des couches : ${dossier} importe en plus ${noms.join(', ')}`,
    from: {
      path: `^src/features/${dossier}/`,
      pathNot: TEST_DE_COMPOSITION,
    },
    to: { pathNot: admisDans(emplacementDe(dossier), noms) },
  })),
  {
    name: 'ui-sans-jsx-sans-composant',
    severity: 'error',
    comment:
      "Un fichier de l'UI sans JSX (présentateur, filtre, search-params, colonnes…) n'importe aucun composant",
    from: { path: '^src/features/.+/ui/.+[^x]$' },
    to: {
      path: '^src/features/.+/ui/(?:pages|layouts|slots|components|forms)/.+[.]tsx$',
    },
  },
  {
    name: 'slot-injecte-par-app',
    severity: 'error',
    comment:
      "Un slot est injecté par app/ : ni une page, ni un layout, ni un composant, ni un formulaire ne l'importe",
    from: {
      path: '^src/features/.+/ui/(?:pages|layouts|components|forms)/',
      pathNot: '[.](?:stories|cy)[.]tsx$',
    },
    to: { path: '^src/features/.+/ui/slots/' },
  },
]

const sousDossiers = (dossier) =>
  require('node:fs')
    .readdirSync(dossier, { withFileTypes: true })
    .filter((entree) => entree.isDirectory())
    .map((entree) => entree.name)

const zoneDeModules = ({ racine, nom, regles, entrees, interdits, table }) => {
  const admis = parModule(table)
  const admisDansLeModule = (module, supplementaires) => [
    `^src/${racine}/${module}/`,
    ...OUTILS_DE_TEST.map(cible),
    ...supplementaires.map(cible),
  ]
  return [
    {
      name: regles.sansMetier,
      severity: 'error',
      comment: `${nom} n'importe ni ${interdits.join(', ni ')}`,
      from: { path: `^src/${racine}/` },
      to: {
        path: `^src/(?:${interdits.map((zone) => zone.replace(/\/$/, '')).join('|')})/`,
      },
    },
    ...sousDossiers(`src/${racine}`).map((module) => ({
      name: `${regles.entrees} (${module})`,
      severity: 'error',
      comment: `Hors de lui-même, ${racine}/${module} s'importe par ses entrées`,
      from: { pathNot: `^src/${racine}/${module}/` },
      to: {
        path: `^src/${racine}/${module}/`,
        pathNot: entrees.map((entree) => `^src/${racine}/${module}/${entree}`),
      },
    })),
    {
      name: regles.imports,
      severity: 'error',
      comment: `${nom} n'importe que lui-même et ses outils de test ; le reste est une ligne de sa table d'imports admis`,
      from: {
        path: `^src/${racine}/([^/]+)/`,
        pathNot: cles(admis).map((module) => `^src/${racine}/${module}/`),
      },
      to: { pathNot: admisDansLeModule('$1', []) },
    },
    ...Object.entries(admis).map(([module, noms]) => ({
      name: `${regles.imports} (${module})`,
      severity: 'error',
      comment: `Exception : ${racine}/${module} importe en plus ${noms.join(', ')}`,
      from: { path: `^src/${racine}/${module}/` },
      to: { pathNot: admisDansLeModule(module, noms) },
    })),
  ]
}

const LIBRARIES_REGLES = zoneDeModules({
  racine: 'libraries',
  nom: 'Une library',
  regles: {
    sansMetier: 'library-sans-metier',
    entrees: 'entrees-de-la-library',
    imports: 'imports-d-une-library',
  },
  entrees: ['index[.]tsx?$', '[^/]+/index[.]tsx?$'],
  interdits: ['app', 'features', 'configuration', 'jobs', 'cli'],
  table: IMPORTS_ADMIS_DES_LIBRARIES,
})

const CONFIGURATION_REGLES = zoneDeModules({
  racine: 'configuration',
  nom: 'Un module de configuration',
  regles: {
    sansMetier: 'configuration-sans-metier',
    entrees: 'entrees-du-module-de-configuration',
    imports: 'imports-d-un-module-de-configuration',
  },
  entrees: ['index[.]tsx?$', 'serveur[.]tsx?$', '[^/]+/index[.]tsx?$'],
  interdits: ['app', 'features', 'jobs', 'cli'],
  table: IMPORTS_ADMIS_DE_LA_CONFIGURATION,
})

const emplacementDansLEntree = (racine, segment) =>
  segment.includes('.')
    ? `^src/${racine}/${segment.replaceAll('.', '[.]')}$`
    : `^src/${racine}/${segment}/`

const zoneDEntree = ({ racine, nom, regle, socle, internes, table }) => {
  const admis = parModule(table)
  const admisDans = (segment, supplementaires) => [
    `^src/${racine}/`,
    ...internes(segment),
    ...[...socle, ...OUTILS_DE_TEST, ...supplementaires].map(cible),
  ]
  return [
    {
      name: regle,
      severity: 'error',
      comment: `${nom} n'importe que lui-même, ce que sa règle admet et son socle ; le reste est une ligne de sa table d'imports admis`,
      from: {
        path: `^src/${racine}/`,
        pathNot: cles(admis).map((segment) =>
          emplacementDansLEntree(racine, segment),
        ),
      },
      to: { pathNot: admisDans(null, []) },
    },
    ...Object.entries(admis).map(([segment, noms]) => ({
      name: `${regle} (${segment})`,
      severity: 'error',
      comment: `Exception : ${racine}/${segment} importe en plus ${noms.join(', ')}`,
      from: { path: emplacementDansLEntree(racine, segment) },
      to: { pathNot: admisDans(segment, noms) },
    })),
  ]
}

const JOBS_REGLES = zoneDEntree({
  racine: 'jobs',
  nom: 'Un job',
  regle: 'imports-d-un-job',
  socle: [
    'configuration/prisma',
    'configuration/telemetry',
    'libraries/console',
    'zod',
  ],
  internes: () => DANS_UNE_FEATURE('(?:domain|implementations)/'),
  table: IMPORTS_ADMIS_DES_JOBS,
})

const CLI_REGLES = zoneDEntree({
  racine: 'cli',
  nom: 'Le CLI',
  regle: 'imports-du-cli',
  socle: ['@commander-js/extra-typings', 'libraries/console'],
  internes: (segment) =>
    segment === 'fixtures' ? ['^src/features/[^/]+/fixtures/'] : [],
  table: IMPORTS_ADMIS_DU_CLI,
})

const CONFINEMENT_REGLES = Object.entries(CONFINEMENT).map(
  ([paquet, lieux]) => ({
    name: `confinement (${paquet})`,
    severity: 'error',
    comment: `${paquet} n'est importé que là où sa ligne de CONFINEMENT l'admet, tests, e2e et fichiers racine compris`,
    from: {
      pathNot: lieux.map((lieu) =>
        lieu === 'tests de composition' ? TEST_DE_COMPOSITION : lieu,
      ),
    },
    to: { path: cible(paquet) },
  }),
)

const MODULES_CLIENT = require('node:fs')
  .readdirSync('src', { recursive: true })
  .map((chemin) => `src/${chemin}`)
  .filter(
    (chemin) => /[.]tsx?$/.test(chemin) && !chemin.startsWith('src/generated/'),
  )
  .filter((chemin) =>
    /^\s*['"]use client['"]/.test(
      require('node:fs').readFileSync(chemin, 'utf8'),
    ),
  )

const ENVIRONNEMENTS = [
  {
    name: 'node-sans-dsfr-ni-css',
    severity: 'error',
    comment:
      "Le code chargé par Node (domaines, implémentations, tests de composition, CLI, jobs, racine d'une library, entrées d'un module de configuration) n'atteint, même indirectement et par un import de type, ni le DSFR ni une feuille de style",
    from: {
      path: [
        '/domain/',
        '/implementations/',
        TEST_DE_COMPOSITION,
        '^src/cli/',
        '^src/jobs/',
        '^src/libraries/[^/]+/index[.]ts$',
        '^src/configuration/[^/]+/(?:index|serveur)[.]ts$',
      ],
      pathNot: '^src/configuration/dsfr/',
    },
    to: {
      path: ['node_modules/@codegouvfr/react-dsfr/', '[.]css$'],
      reachable: true,
    },
  },
  {
    name: 'client-sans-serveur',
    severity: 'error',
    comment:
      "Un module 'use client' n'atteint, même indirectement, ni un serveur.ts, ni configuration/prisma, ni un client généré, ni server-only",
    from: { path: MODULES_CLIENT.map(cheminExact) },
    to: {
      path: [
        '^src/configuration/[^/]+/serveur[.]ts$',
        '^src/configuration/prisma/',
        '^src/generated/',
        'node_modules/server-only/',
      ],
      reachable: true,
    },
  },
]

module.exports = {
  forbidden: [
    ...GLOBAL,
    ...APP,
    ...FEATURES,
    ...COUCHES,
    ...LIBRARIES_REGLES,
    ...CONFIGURATION_REGLES,
    ...JOBS_REGLES,
    ...CLI_REGLES,
    ...CONFINEMENT_REGLES,
    ...ENVIRONNEMENTS,
  ],
  options: {
    doNotFollow: { path: ['node_modules', '^src/generated/'] },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      mainFields: ['module', 'main', 'types', 'typings'],
    },
  },
}
