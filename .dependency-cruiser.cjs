const FICHIER_DE_TEST =
  '[.](?:spec|integration|stories|cy|steps|cucumber|test)[.]tsx?$|/fixtures/'

const TEST_UNITAIRE = '[.](?:spec|stories|cy)[.]tsx?$'

const TEST_DE_COMPOSITION = '[.](?:integration|steps|cucumber)[.]ts$|/fixtures/'

const FICHIERS_DE_TEST_ADMIS = {
  '^src/app/_actions/utilisateurs/reinitialiser-une-fixture[.]action[.]ts$': [
    '^src/features/utilisateurs/fixtures/personas[.]ts$',
    '^src/features/lieux-activite/fixtures/lieux-de-demonstration[.]ts$',
    '^src/features/lieux-activite/fixtures/activites-dans-les-lieux-de-demonstration[.]ts$',
    '^src/features/beneficiaire/fixtures/beneficiaires-de-demonstration[.]ts$',
    '^src/features/beneficiaire/fixtures/semer-les-beneficiaires-de-demonstration[.]ts$',
    '^src/features/equipe/fixtures/semer-les-coordinations-de-demonstration[.]ts$',
    '^src/features/activites/fixtures/semer-les-cras-de-demonstration[.]ts$',
  ],
  '^src/features/utilisateurs/abilities/reinitialiser-une-fixture/implementations/prisma/reinitialiser[.]mutation[.]ts$':
    [
      '^src/features/utilisateurs/fixtures/personas[.]ts$',
      '^src/features/utilisateurs/fixtures/reinitialiser-un-utilisateur[.]ts$',
    ],
}

const DEV_DEPENDENCIES_ADMISES = {}

const HORS_DE_SRC_ADMIS = {
  '^src/app/.+/(?:page|route)[.]test[.]ts$': ['^e2e/support/helpers[.]ts$'],
  '^src/.+[.]cy[.]tsx$': ['^e2e/support/monter-avec-l-url[.]tsx$'],
}

const RACINE_DU_DEPOT_ADMISE = {
  '^cypress[.]config[.]ts$': ['^e2e/support/task-manager[.]ts$'],
}

const APP_ADMISE_DANS_UNE_FEATURE = {
  '^src/features/clients-api/abilities/[^/]+/[^/]+[.]steps[.]ts$': [
    '^src/app/api/v1/',
  ],
}

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

const DANS_UNE_FEATURE = (suite) => [
  `^src/features/[^/]+/${suite}`,
  `^src/features/[^/]+/abilities/[^/]+/${suite}`,
]

const ROUTES_ADMISES = {
  '^src/app/[(]public[)]/[(]authentication[)]/deconnexion/callback/route[.]ts$':
    ['^src/libraries/etat-encode/'],
  '^src/app/[(]public[)]/[(]authentication[)]/deconnexion/start/route[.]ts$': [
    '^src/libraries/chemin-interne/',
    '^src/libraries/etat-encode/',
    PAQUET(['uuid']),
  ],
  '^src/app/administration/clients-api/creer/page[.]tsx$': [
    '^src/libraries/date/',
  ],
  '^src/app/administration/utilisateurs/[[]id\\]/export/accompagnements/route[.]ts$':
    ['^src/libraries/date/'],
  '^src/app/administration/utilisateurs/[[]id\\]/export/statistiques/route[.]ts$':
    ['^src/libraries/date/'],
  '^src/app/administration/utilisateurs/[[]id\\]/page[.]tsx$': [
    PAQUET(['@arckit/resultset']),
  ],
  '^src/app/administration/utilisateurs/export/route[.]ts$': [
    '^src/libraries/date/',
    '^src/libraries/texte/',
  ],
  '^src/app/administration/utilisateurs/page[.]tsx$': ['^src/libraries/texte/'],
  '^src/app/api/auth/[[][.][.][.]nextauth\\]/route[.]ts$': [
    '^src/configuration/ban/index[.]ts$',
    PAQUET(['next-auth']),
  ],
  '^src/app/api/ppg/accompagnements-departements[.]csv/route[.]ts$': [
    PAQUET(['zod']),
  ],
  '^src/app/api/rdv-service-public/auth/callback/route[.]ts$': [
    '^src/features/rdvsp/abilities/connecter-compte-rdv/action/connecter-compte-rdv[.]errors[.]ts$',
    '^src/libraries/etat-encode/',
  ],
  '^src/app/api/v1/activites/route[.]ts$': ['^src/libraries/json-api/'],
  '^src/app/api/v1/archives-v1/cras/route[.]ts$': ['^src/libraries/json-api/'],
  '^src/app/api/v1/health/route[.]ts$': ['^src/libraries/json-api/'],
  '^src/app/api/v1/structures/route[.]ts$': ['^src/libraries/json-api/'],
  '^src/app/api/v1/utilisateurs/route[.]ts$': ['^src/libraries/json-api/'],
  '^src/app/coop/[(]full-width-layout[)]/mes-beneficiaires/importer/analyse/route[.]ts$':
    [PAQUET(['uuid'])],
  '^src/app/coop/[(]full-width-layout[)]/mes-beneficiaires/nouveau/page[.]tsx$':
    ['^src/libraries/etat-encode/'],
  '^src/app/coop/[(]full-width-layout[)]/mes-equipes/[[]coordinateurId\\]/export/route[.]ts$':
    ['^src/libraries/date/'],
  '^src/app/coop/[(]full-width-layout[)]/mon-reseau/[[]departement\\]/acteurs/[[]userId\\]/page[.]tsx$':
    ['^src/libraries/departement/', PAQUET(['@arckit/resultset'])],
  '^src/app/coop/[(]full-width-layout[)]/mon-reseau/[[]departement\\]/lieux/[[]id\\]/page[.]tsx$':
    ['^src/libraries/departement/'],
  '^src/app/coop/[(]sidemenu-layout[)]/mes-activites/export/route[.]ts$': [
    '^src/libraries/date/',
  ],
  '^src/app/coop/[(]sidemenu-layout[)]/mes-beneficiaires/[(]liste[)]/export/route[.]ts$':
    [
      '^src/features/beneficiaire/abilities/exporter-beneficiaires/action/filtres-de-l-export[.]validation[.]ts$',
      '^src/libraries/date/',
    ],
  '^src/app/coop/[(]sidemenu-layout[)]/mes-beneficiaires/[[]beneficiaireId\\]/[(]consultation[)]/[(]informations[)]/page[.]tsx$':
    [PAQUET(['@arckit/resultset'])],
  '^src/app/coop/[(]sidemenu-layout[)]/mes-coordinations/export/route[.]ts$': [
    '^src/libraries/date/',
  ],
  '^src/app/coop/[(]sidemenu-layout[)]/mes-outils/[[]slug\\]/page[.]tsx$': [
    '^src/libraries/insee/',
  ],
  '^src/app/coop/[(]sidemenu-layout[)]/mes-statistiques/export/[[]shareId\\]/route[.]ts$':
    ['^src/libraries/date/'],
  '^src/app/coop/[(]sidemenu-layout[)]/mes-statistiques/export/route[.]ts$': [
    '^src/libraries/date/',
  ],
  '^src/app/coop/[(]sidemenu-layout[)]/mon-reseau/[[]departement\\]/page[.]tsx$':
    ['^src/libraries/departement/'],
  '^src/app/coop/[(]sidemenu-layout[)]/mon-reseau/page[.]tsx$': [
    '^src/libraries/departement/',
  ],
  '^src/app/global-error[.]tsx$': ['^src/configuration/telemetry/index[.]ts$'],
  '^src/app/error[.]tsx$': ['^src/configuration/telemetry/index[.]ts$'],
  '^src/app/coop/error[.]tsx$': ['^src/configuration/telemetry/index[.]ts$'],
  '^src/app/administration/error[.]tsx$': [
    '^src/configuration/telemetry/index[.]ts$',
  ],
  '^src/app/administration/outils/page[.]tsx$': [
    '^src/configuration/telemetry/index[.]ts$',
  ],
  '^src/app/inscription/[(]etapes[)]/initialiser/page[.]tsx$': [
    '^src/configuration/ban/index[.]ts$',
  ],
  '^src/app/invitations/[[]data\\]/page[.]tsx$': [
    '^src/libraries/etat-encode/',
  ],
  '^src/app/layout[.]tsx$': [
    '^src/configuration/dsfr/index[.]ts$',
    '^src/configuration/dsfr/serveur[.]ts$',
    '^src/configuration/telemetry/index[.]ts$',
    '^src/libraries/ui/',
    '^src/styles/app[.]css$',
    PAQUET(['@codegouvfr/react-dsfr']),
    PAQUET(['nuqs']),
  ],
  '^src/app/template[.]tsx$': ['^src/configuration/dsfr/index[.]ts$'],
}

const SERVER_ACTIONS_ADMISES = {
  '^src/app/_actions/activites/rechercher-employeuses-des-activites[.]action[.]ts$':
    [
      '^src/features/activites/abilities/rechercher-les-employeuses-des-activites/ui/presenters/options-d-employeuses[.]presenter[.]ts$',
    ],
  '^src/app/_actions/activites/rechercher-les-lieux-de-mes-activites[.]action[.]ts$':
    [
      '^src/features/activites/abilities/rechercher-les-lieux-des-statistiques/ui/presenters/options-de-lieux[.]presenter[.]ts$',
    ],
  '^src/app/_actions/employeuse/rechercher-structure-employeuse[.]action[.]ts$':
    [
      '^src/features/employeuse/ui/presenters/employeuse-recherchee[.]presenter[.]ts$',
    ],
  '^src/app/_actions/employeuse/renseigner-structure-employeuse[.]action[.]ts$':
    ['^src/configuration/ban/index[.]ts$'],
  '^src/app/_actions/equipe/rechercher-des-membres[.]action[.]ts$': [
    '^src/features/equipe/abilities/lister-les-membres-a-filtrer/ui/presenters/options-de-membres[.]presenter[.]ts$',
  ],
  '^src/app/_actions/inscription/renseigner-structure-employeuse[.]action[.]ts$':
    ['^src/configuration/ban/index[.]ts$'],
  '^src/app/_actions/mon-reseau/rechercher-des-communes-du-reseau[.]action[.]ts$':
    ['^src/libraries/etat-d-url/'],
  '^src/app/_actions/rdvsp/creer-activite-depuis-rdv[.]action[.]ts$': [
    '^src/features/activites/ui/presenters/saisie/url-de-saisie-depuis-un-rendez-vous[.]presenter[.]ts$',
    '^src/configuration/projet/serveur[.]ts$',
  ],
  '^src/app/_actions/rdvsp/prendre-rendez-vous[.]action[.]ts$': [
    '^src/configuration/projet/serveur[.]ts$',
  ],
  '^src/app/_actions/statistiques/rechercher-les-employeuses-du-partage[.]action[.]ts$':
    [
      '^src/features/activites/abilities/rechercher-les-employeuses-des-activites/ui/presenters/options-d-employeuses[.]presenter[.]ts$',
    ],
  '^src/app/_actions/statistiques/rechercher-les-lieux-de-mes-statistiques[.]action[.]ts$':
    [
      '^src/features/activites/abilities/rechercher-les-lieux-des-statistiques/ui/presenters/options-de-lieux[.]presenter[.]ts$',
    ],
  '^src/app/_actions/statistiques/rechercher-les-lieux-du-partage[.]action[.]ts$':
    [
      '^src/features/activites/abilities/rechercher-les-lieux-des-statistiques/ui/presenters/options-de-lieux[.]presenter[.]ts$',
    ],
  '^src/app/_actions/statistiques/rechercher-les-lieux-nationaux[.]action[.]ts$':
    [
      '^src/features/activites/abilities/rechercher-les-lieux-des-statistiques/ui/presenters/options-de-lieux[.]presenter[.]ts$',
    ],
  '^src/app/_actions/statistiques/rechercher-les-tags-collectifs[.]action[.]ts$':
    [
      '^src/features/tags/abilities/lire-les-tags-visibles/ui/presenters/tag-collectif[.]presenter[.]ts$',
    ],
  '^src/app/_actions/statistiques/rechercher-les-tags-du-partage[.]action[.]ts$':
    ['^src/features/tags/ui/presenters/tag-affiche[.]presenter[.]ts$'],
  '^src/app/_actions/tags/creer-un-tag[.]action[.]ts$': [
    '^src/features/tags/ui/presenters/tag-affiche[.]presenter[.]ts$',
  ],
  '^src/app/_actions/tags/rechercher-des-destinations[.]action[.]ts$': [
    '^src/features/tags/abilities/fusionner-un-tag/ui/presenters/destinations[.]presenter[.]ts$',
  ],
  '^src/app/_actions/tags/rechercher-des-tags[.]action[.]ts$': [
    '^src/features/tags/ui/presenters/tag-affiche[.]presenter[.]ts$',
  ],
  '^src/app/_actions/utilisateurs/rechercher-des-coordinateurs[.]action[.]ts$':
    [
      '^src/features/utilisateurs/abilities/lister-les-utilisateurs/ui/presenters/coordinateur-a-choisir[.]presenter[.]ts$',
    ],
  '^src/app/_actions/utilisateurs/rechercher-des-communes[.]action[.]ts$': [
    '^src/features/employeuse/abilities/rechercher-employeuse/ui/presenters/option-de-la-commune[.]presenter[.]ts$',
  ],
  '^src/app/_actions/utilisateurs/rechercher-des-employeuses[.]action[.]ts$': [
    '^src/features/employeuse/ui/presenters/employeuse[.]presenter[.]ts$',
  ],
  '^src/app/_actions/utilisateurs/reinitialiser-une-fixture[.]action[.]ts$': [
    '^src/features/activites/fixtures/semer-les-cras-de-demonstration[.]ts$',
    '^src/features/beneficiaire/fixtures/beneficiaires-de-demonstration[.]ts$',
    '^src/features/beneficiaire/fixtures/semer-les-beneficiaires-de-demonstration[.]ts$',
    '^src/features/equipe/fixtures/semer-les-coordinations-de-demonstration[.]ts$',
    '^src/features/lieux-activite/fixtures/activites-dans-les-lieux-de-demonstration[.]ts$',
    '^src/features/lieux-activite/fixtures/lieux-de-demonstration[.]ts$',
    '^src/features/utilisateurs/fixtures/personas[.]ts$',
  ],
  '^src/app/_actions/utilisateurs/usurper-un-utilisateur[.]action[.]ts$': [
    '^src/configuration/environnement/serveur[.]ts$',
  ],
}

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
  PAQUET(['next', 'react', '@arckit/nextjs']),
]

const IMPORTS_D_UNE_SERVER_ACTION = [
  '^src/features/[^/]+/middlewares/',
  ...DANS_UNE_FEATURE('(?:domain|implementations)/'),
  ...DANS_UNE_FEATURE('action/[^/]+[.](?:validation|errors|transfer)[.]ts$'),
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

const APP = [
  {
    name: 'imports-d-une-route',
    severity: 'error',
    comment:
      "Une route compose : elle n'importe que les pages, layouts, slots, présentateurs, filtres, clés d'action, domaines, implémentations et middlewares des features, les server actions, et le strict nécessaire de la configuration et des libraries (UI-1, AR-5)",
    from: {
      path: '^src/app/',
      pathNot: ['^src/app/_actions/', FICHIER_DE_TEST, ...cles(ROUTES_ADMISES)],
    },
    to: { pathNot: IMPORTS_D_UNE_ROUTE },
  },
  ...exceptions('imports-d-une-route', ROUTES_ADMISES, (de, admis) => ({
    from: { path: de },
    to: { pathNot: [...IMPORTS_D_UNE_ROUTE, ...admis] },
  })),
  {
    name: 'imports-d-une-server-action',
    severity: 'error',
    comment:
      "Une server action compose : elle n'importe que les middlewares, domaines, implémentations et contrats d'action des features, le constructeur d'actions et le rapporteur d'erreurs de la configuration, et les libraries nextjs et result",
    from: {
      path: '^src/app/_actions/',
      pathNot: [FICHIER_DE_TEST, ...cles(SERVER_ACTIONS_ADMISES)],
    },
    to: { pathNot: IMPORTS_D_UNE_SERVER_ACTION },
  },
  ...exceptions(
    'imports-d-une-server-action',
    SERVER_ACTIONS_ADMISES,
    (de, admis) => ({
      from: { path: de },
      to: { pathNot: [...IMPORTS_D_UNE_SERVER_ACTION, ...admis] },
    }),
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
  domain: ['zod', 'libraries/model', 'libraries/result'],
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
  'implementations/entrepot': ['configuration/prisma'],
  'implementations/excel': ['exceljs', 'libraries/tableur'],
  'implementations/fichier': ['node:fs', 'node:readline'],
  'implementations/next': ['next'],
  'implementations/next-auth': ['next-auth'],
  'implementations/oauth': [],
  'implementations/prisma': ['configuration/prisma', 'libraries/result'],
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
  'ui/presenters': [],
  'ui/search-params': [],
}

const OUTILS_DE_TEST = ['vitest', '@storybook/react', 'storybook']

const IMPORTS_ADMIS = {
  '@arckit/resultset': [
    'activites/abilities/lister-mes-activites/implementations/prisma',
    'activites/domain',
    'beneficiaire/abilities/exporter-beneficiaires/domain',
    'beneficiaire/abilities/lister-beneficiaires/domain',
    'beneficiaire/abilities/lister-beneficiaires/implementations/prisma',
    'beneficiaire/abilities/lister-beneficiaires/ui/pages',
    'beneficiaire/abilities/lister-beneficiaires/ui/presenters',
    'employeuse/abilities/lister-employeuses/domain',
    'employeuse/abilities/lister-employeuses/implementations/prisma',
    'employeuse/abilities/lister-employeuses/ui/presenters',
    'equipe/abilities/exporter-les-membres/implementations/excel',
    'equipe/abilities/lister-les-membres/domain',
    'equipe/abilities/lister-les-membres/implementations/prisma',
    'equipe/domain',
    'equipe/implementations/prisma',
    'lieux-activite/abilities/lister-les-lieux-du-departement/implementations/prisma',
    'lieux-activite/abilities/lister-les-lieux-du-mediateur/implementations/prisma',
    'lieux-activite/abilities/lister-les-lieux-du-mediateur/ui/components',
    'lieux-activite/abilities/lister-tous-les-lieux/domain',
    'lieux-activite/abilities/lister-tous-les-lieux/implementations/prisma',
    'mon-reseau/abilities/consulter-les-lieux-du-departement/domain',
    'mon-reseau/abilities/consulter-les-lieux-du-departement/ui/components',
    'mon-reseau/abilities/lister-les-acteurs-du-departement/domain',
    'mon-reseau/abilities/lister-les-acteurs-du-departement/implementations/prisma',
    'mon-reseau/abilities/lister-les-acteurs-du-departement/ui/components',
    'tags/abilities/lister-les-tags/domain',
    'tags/abilities/lister-les-tags/implementations/prisma',
    'tags/abilities/lister-les-tags/ui/components',
    'tags/abilities/lister-les-tags/ui/presenters',
    'utilisateurs/abilities/lister-les-utilisateurs/domain',
    'utilisateurs/abilities/lister-les-utilisateurs/implementations/prisma',
    'utilisateurs/abilities/lister-les-utilisateurs/ui/presenters',
  ],
  '@auth/prisma-adapter': ['authentification/implementations/prisma'],
  '@date-fns/tz': [
    'mediateurs/abilities/choisir-la-visibilite-apres-rupture/domain',
  ],
  '@gouvfr-anct/lieux-de-mediation-numerique': [
    'clients-api/abilities/lire-les-lieux-activite/implementations/api-v1',
    'lieux-activite/abilities/ajouter-des-lieux-activite/action',
    'lieux-activite/abilities/ajouter-des-lieux-activite/domain',
    'lieux-activite/abilities/ajouter-des-lieux-activite/implementations/entrepot',
    'lieux-activite/abilities/ajouter-des-lieux-activite/implementations/prisma',
    'lieux-activite/abilities/ajouter-des-lieux-activite/ui/presenters',
    'lieux-activite/abilities/creer-lieu-activite/action',
    'lieux-activite/abilities/fusionner-des-lieux/domain',
    'lieux-activite/abilities/fusionner-des-lieux/implementations/prisma',
    'lieux-activite/abilities/fusionner-des-lieux/ui/presenters',
    'lieux-activite/abilities/lister-les-lieux-du-mediateur/ui/presenters',
    'lieux-activite/abilities/modifier-la-fiche-du-lieu/action',
    'lieux-activite/abilities/modifier-la-fiche-du-lieu/domain',
    'lieux-activite/abilities/modifier-la-fiche-du-lieu/ui/components',
    'lieux-activite/abilities/modifier-la-fiche-du-lieu/ui/forms',
    'lieux-activite/abilities/modifier-la-fiche-du-lieu/ui/presenters',
    'lieux-activite/abilities/publier-les-lieux/domain',
    'lieux-activite/abilities/publier-les-lieux/implementations/api',
    'lieux-activite/abilities/rechercher-des-lieux-a-ajouter/domain',
    'lieux-activite/abilities/rechercher-des-lieux-a-ajouter/implementations/api-entreprise',
    'lieux-activite/abilities/rechercher-des-lieux-a-ajouter/implementations/entrepot',
    'lieux-activite/abilities/rechercher-des-lieux-a-ajouter/implementations/prisma',
    'lieux-activite/abilities/rechercher-un-lieu-activite/domain',
    'lieux-activite/abilities/rechercher-un-lieu-activite/implementations/prisma',
    'lieux-activite/action',
    'lieux-activite/domain',
    'lieux-activite/implementations/prisma',
    'lieux-activite/ui/forms',
    'lieux-activite/ui/labels',
    'lieux-activite/ui/presenters',
  ],
  '@gouvfr-anct/timetable-to-osm-opening-hours': [
    'lieux-activite/abilities/creer-lieu-activite/action',
    'lieux-activite/abilities/modifier-la-fiche-du-lieu/ui/components',
    'lieux-activite/abilities/modifier-la-fiche-du-lieu/ui/presenters',
    'lieux-activite/action',
    'lieux-activite/domain',
    'lieux-activite/ui/forms',
  ],
  '@hookform/resolvers': ['authentification/abilities/se-connecter/ui/forms'],
  '@scalar/api-reference-react': ['clients-api/ui/pages'],
  '@tanstack/react-form': [
    'activites/ui/components',
    'employeuse/abilities/rattacher-a-une-employeuse/ui/slots',
    'inscription/abilities/choisir-profil/ui/pages',
    'lieux-activite/abilities/ajouter-des-lieux-activite/ui/pages',
    'lieux-activite/abilities/modifier-la-fiche-du-lieu/ui/components',
    'tags/abilities/creer-un-tag/ui/slots',
    'tags/abilities/fusionner-un-tag/ui/slots',
    'tags/abilities/modifier-un-tag/ui/slots',
  ],
  axios: ['authentification/implementations/proconnect'],
  'change-case': [
    'activites/abilities/compter-les-thematiques-abordees/implementations/prisma',
    'activites/implementations/prisma',
  ],
  'configuration/environnement': [
    'authentification/implementations/email',
    'authentification/implementations/next-auth',
    'authentification/implementations/proconnect',
    'clients-api/implementations/secret',
    'rdvsp/implementations/api',
    'rdvsp/implementations/oauth',
    'rdvsp/implementations/webhook',
    'utilisateurs/implementations/brevo',
  ],
  'configuration/projet': [
    'accueil/abilities/consulter-l-accueil/ui/components',
    'authentification/abilities/se-connecter/ui/components',
    'authentification/abilities/se-connecter/ui/pages',
    'authentification/implementations/next-auth',
    'authentification/implementations/proconnect',
    'beneficiaire/abilities/importer-beneficiaires/ui/components',
    'clients-api/abilities/lire-les-activites/implementations/api-v1',
    'clients-api/abilities/lire-les-cras-v1/implementations/api-v1',
    'clients-api/abilities/lire-les-statistiques/implementations/api-v1',
    'clients-api/abilities/lire-les-structures/implementations/api-v1',
    'clients-api/abilities/lire-les-utilisateurs/implementations/api-v1',
    'inscription/abilities/valider/ui/components',
    'legal/ui/pages',
    'navigation/ui/slots',
    'rdvsp/abilities/connecter-compte-rdv/implementations/next',
    'rdvsp/abilities/synchroniser-compte-rdv/implementations/webhook',
    'rdvsp/implementations/api',
    'rdvsp/implementations/oauth',
    'vitrine/ui/components',
  ],
  'configuration/smtp': ['authentification/implementations/next-auth'],
  'configuration/telemetry': [
    'authentification/implementations/next-auth',
    'beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/ban',
    'clients-api/abilities/authentifier-un-client-api/implementations/api-v1',
    'equipe/abilities/inviter-des-membres/implementations/prisma',
    'equipe/abilities/relancer-une-invitation/implementations/prisma',
    'equipe/implementations/email',
    'inscription/abilities/ajouter-structure-employeuse-en-lieu/implementations/ban',
    'rdvsp/abilities/effacer-empreinte-rdv/implementations/prisma',
    'registre-des-personnes/implementations/prisma',
    'utilisateurs/abilities/fusionner-des-comptes/implementations/brevo',
    'utilisateurs/implementations/brevo',
  ],
  'date-fns': [
    'activites/abilities/exporter-les-activites-de-coordination/ui/presenters',
    'activites/abilities/exporter-mes-accompagnements/ui/presenters',
    'activites/domain',
    'clients-api/domain',
    'equipe/implementations/prisma',
    'lieux-activite/ui/presenters',
    'mediateurs/abilities/choisir-la-visibilite-apres-rupture/domain',
    'mediateurs/abilities/consulter-le-contrat/domain',
    'mediateurs/abilities/consulter-le-contrat/ui/presenters',
    'mon-reseau/abilities/consulter-un-acteur/domain',
    'mon-reseau/abilities/consulter-un-acteur/implementations/prisma',
    'utilisateurs/abilities/anonymiser-les-comptes-inactifs/domain',
    'utilisateurs/abilities/anonymiser-les-comptes-inactifs/implementations/prisma',
  ],
  'features/authentification/implementations/email/send-verification-request.mutation.ts':
    ['authentification/implementations/next-auth'],
  'features/authentification/implementations/prisma/account-tokens.mutation.ts':
    ['authentification/implementations/next-auth'],
  'features/authentification/implementations/prisma/derniere-connexion.mutation.ts':
    ['authentification/implementations/next-auth'],
  'features/authentification/implementations/prisma/donnees-de-l-utilisateur.mutation.ts':
    ['authentification/implementations/next-auth'],
  'features/authentification/implementations/prisma/next-auth.adapter.ts': [
    'authentification/implementations/next-auth',
  ],
  'features/authentification/implementations/prisma/synchroniser-la-personne.mutation.ts':
    ['authentification/implementations/next-auth'],
  'features/authentification/implementations/proconnect/proconnect-provider.client.ts':
    ['authentification/implementations/next-auth'],
  'features/utilisateurs/fixtures/personas.ts': [
    'utilisateurs/abilities/reinitialiser-une-fixture/implementations/prisma',
  ],
  'features/utilisateurs/fixtures/reinitialiser-un-utilisateur.ts': [
    'utilisateurs/abilities/reinitialiser-une-fixture/implementations/prisma',
  ],
  'js-cookie': [
    'accueil/abilities/consulter-l-accueil/ui/components',
    'authentification/abilities/se-connecter/ui/forms',
  ],
  jsonwebtoken: ['authentification/implementations/proconnect'],
  'libraries/adresse': [
    'beneficiaire/abilities/rechercher-beneficiaires/ui/presenters',
    'beneficiaire/ui/forms',
    'employeuse/abilities/rattacher-a-une-employeuse/ui/forms',
    'employeuse/ui/slots',
    'inscription/abilities/ajouter-structure-employeuse-en-lieu/domain',
    'lieux-activite/abilities/ajouter-des-lieux-activite/ui/forms',
    'lieux-activite/abilities/modifier-la-fiche-du-lieu/action',
    'lieux-activite/abilities/modifier-la-fiche-du-lieu/ui/forms',
    'lieux-activite/abilities/modifier-la-fiche-du-lieu/ui/presenters',
    'lieux-activite/action',
    'lieux-activite/ui/components',
    'lieux-activite/ui/forms',
  ],
  'libraries/ban': [
    'activites/ui/forms',
    'beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/prisma',
    'beneficiaire/ui/forms',
    'employeuse/abilities/rattacher-a-une-employeuse/implementations/prisma',
    'lieux-activite/abilities/ajouter-des-lieux-activite/ui/forms',
    'lieux-activite/abilities/ajouter-des-lieux-activite/ui/pages',
    'lieux-activite/abilities/modifier-la-fiche-du-lieu/ui/forms',
    'lieux-activite/ui/forms',
  ],
  'libraries/chemin-interne': [
    'activites/abilities/enregistrer-un-accompagnement-individuel/ui/forms',
    'activites/abilities/enregistrer-un-atelier-collectif/ui/forms',
    'activites/abilities/enregistrer-une-activite-de-coordination/ui/forms',
    'beneficiaire/ui/forms',
  ],
  'libraries/chemins': [
    'beneficiaire/abilities/importer-beneficiaires/implementations/fichier',
  ],
  'libraries/code-postal': [
    'activites/domain',
    'employeuse/abilities/rattacher-a-une-employeuse/implementations/prisma',
    'employeuse/domain',
    'equipe/abilities/exporter-les-membres/ui/presenters',
    'equipe/domain',
    'equipe/implementations/prisma',
  ],
  'libraries/collections': [
    'activites/abilities/compter-les-thematiques-abordees/ui/presenters',
    'activites/abilities/decrire-les-personnes-accompagnees/ui/presenters',
    'activites/abilities/exporter-mes-accompagnements/ui/presenters',
    'activites/abilities/lister-mes-activites/ui/presenters',
    'activites/abilities/repartir-les-accompagnements/ui/presenters',
    'activites/ui/presenters',
    'beneficiaire/implementations/prisma',
    'inscription/abilities/renseigner-lieux-activite/domain',
    'legal/abilities/consulter-les-statistiques-publiques/implementations/prisma',
    'legal/abilities/consulter-les-statistiques-publiques/ui/components',
    'lieux-activite/abilities/ajouter-des-lieux-activite/domain',
    'lieux-activite/abilities/fusionner-des-lieux/implementations/prisma',
    'lieux-activite/abilities/lister-les-lieux-du-departement/implementations/prisma',
    'mon-reseau/abilities/lister-les-acteurs-du-departement/implementations/prisma',
    'statistiques/abilities/exposer-les-statistiques/implementations/api',
    'tags/abilities/mesurer-l-usage-des-tags/implementations/prisma',
  ],
  'libraries/data-table': [
    'activites/abilities/lister-mes-activites/ui/components',
    'beneficiaire/abilities/lister-beneficiaires/ui/components',
    'employeuse/abilities/lister-employeuses/ui/components',
    'equipe/abilities/lister-les-membres/ui/components',
    'lieux-activite/abilities/lister-tous-les-lieux/ui/components',
    'utilisateurs/abilities/lister-les-utilisateurs/ui/components',
  ],
  'libraries/date': [
    'activites/abilities/compter-les-accompagnements/ui/components',
    'activites/abilities/exporter-les-activites-de-coordination/ui/presenters',
    'activites/abilities/exporter-mes-accompagnements/ui/presenters',
    'activites/abilities/lister-les-activites-de-coordination/ui/presenters',
    'activites/abilities/lister-les-dernieres-activites/ui/presenters',
    'activites/abilities/lister-mes-activites/ui/presenters',
    'activites/implementations/prisma',
    'activites/ui/labels',
    'activites/ui/presenters',
    'beneficiaire/abilities/consulter-beneficiaire/ui/pages',
    'clients-api/abilities/lister-les-clients-api/ui/presenters',
    'clients-api/abilities/modifier-un-client-api/ui/presenters',
    'employeuse/abilities/consulter-historique-employeuses/ui/slots',
    'employeuse/abilities/lister-employeuses/ui/components',
    'equipe/abilities/supprimer-un-ancien-membre/ui/slots',
    'equipe/ui/components',
    'equipe/ui/presenters',
    'legal/abilities/consulter-les-statistiques-publiques/implementations/prisma',
    'legal/abilities/consulter-les-statistiques-publiques/ui/labels',
    'lieux-activite/abilities/lister-les-lieux-du-mediateur/ui/presenters',
    'lieux-activite/abilities/lister-tous-les-lieux/ui/components',
    'lieux-activite/abilities/modifier-la-fiche-du-lieu/ui/components',
    'lieux-activite/abilities/modifier-la-fiche-du-lieu/ui/pages',
    'lieux-activite/abilities/retirer-un-mediateur-du-lieu/ui/slots',
    'mediateurs/abilities/consulter-le-contrat/ui/presenters',
    'mon-reseau/abilities/consulter-un-acteur/ui/components',
    'mon-reseau/abilities/consulter-un-acteur/ui/presenters',
    'rdvsp/abilities/administrer-comptes-rdv/ui/pages',
    'rdvsp/abilities/consulter-rdvs-accueil/ui/presenters',
    'rdvsp/ui/components',
    'statistiques/ui/presenters',
    'utilisateurs/abilities/anonymiser-les-comptes-inactifs/implementations/email',
    'utilisateurs/abilities/consulter-un-utilisateur/ui/pages',
    'utilisateurs/abilities/fusionner-des-comptes/ui/components',
    'utilisateurs/abilities/lister-les-utilisateurs/ui/columns',
  ],
  'libraries/departement': [
    'activites/abilities/exporter-les-accompagnements-par-departement/domain',
    'activites/abilities/exporter-les-accompagnements-par-departement/implementations/csv',
    'activites/abilities/exporter-les-accompagnements-par-departement/implementations/prisma',
    'activites/abilities/rechercher-les-lieux-des-statistiques/domain',
    'activites/abilities/rechercher-les-lieux-des-statistiques/implementations/prisma',
    'activites/abilities/rechercher-les-lieux-des-statistiques/ui/presenters',
    'authentification/domain',
    'equipe/abilities/lister-les-membres/implementations/prisma',
    'lieux-activite/abilities/lister-les-mediateurs-du-lieu/implementations/prisma',
    'lieux-activite/abilities/lister-les-options-de-lieux/implementations/prisma',
    'lieux-activite/abilities/mesurer-la-visibilite-sur-la-cartographie/domain',
    'lieux-activite/abilities/mesurer-la-visibilite-sur-la-cartographie/ui/presenters',
    'lieux-activite/ui/presenters',
    'mon-reseau/abilities/consulter-le-reseau-du-departement/domain',
    'mon-reseau/abilities/consulter-le-reseau-du-departement/implementations/prisma',
    'mon-reseau/abilities/consulter-le-reseau-du-departement/ui/forms',
    'mon-reseau/abilities/consulter-les-lieux-du-departement/domain',
    'mon-reseau/abilities/consulter-les-lieux-du-departement/ui/pages',
    'mon-reseau/abilities/consulter-un-acteur/ui/pages',
    'mon-reseau/abilities/lister-les-acteurs-du-departement/implementations/prisma',
    'mon-reseau/abilities/lister-les-acteurs-du-departement/ui/pages',
    'mon-reseau/implementations/prisma',
    'statistiques/abilities/consulter-mes-statistiques/ui/pages',
    'utilisateurs/abilities/lister-les-utilisateurs/ui/presenters',
    'utilisateurs/abilities/lister-les-utilisateurs/ui/slots',
  ],
  'libraries/etat-d-url': [
    'activites/abilities/lister-les-activites-de-coordination/ui/presenters',
    'activites/abilities/lister-les-activites-de-coordination/ui/slots',
    'activites/abilities/lister-mes-activites/ui/components',
    'activites/abilities/lister-mes-activites/ui/presenters',
    'activites/abilities/lister-mes-activites/ui/slots',
    'activites/ui/components',
    'activites/ui/presenters',
    'activites/ui/slots',
    'beneficiaire/abilities/lister-beneficiaires/ui/components',
    'employeuse/abilities/lister-employeuses/ui/components',
    'employeuse/abilities/lister-employeuses/ui/presenters',
    'equipe/abilities/exporter-les-membres/ui/slots',
    'equipe/abilities/lister-les-membres/ui/components',
    'equipe/abilities/lister-les-membres/ui/slots',
    'lieux-activite/abilities/lister-les-lieux-du-mediateur/ui/components',
    'lieux-activite/abilities/lister-tous-les-lieux/ui/components',
    'lieux-activite/abilities/lister-tous-les-lieux/ui/pages',
    'mon-reseau/abilities/consulter-les-lieux-du-departement/ui/components',
    'mon-reseau/abilities/consulter-les-lieux-du-departement/ui/pages',
    'mon-reseau/abilities/lister-les-acteurs-du-departement/ui/components',
    'mon-reseau/abilities/lister-les-acteurs-du-departement/ui/pages',
    'mon-reseau/ui/components',
    'mon-reseau/ui/presenters',
    'statistiques/ui/presenters',
    'statistiques/ui/slots',
    'tags/abilities/lister-les-tags/ui/components',
    'tags/abilities/lister-les-tags/ui/pages',
    'utilisateurs/abilities/lister-les-utilisateurs/ui/components',
    'utilisateurs/abilities/lister-les-utilisateurs/ui/pages',
    'utilisateurs/abilities/lister-les-utilisateurs/ui/presenters',
    'utilisateurs/abilities/lister-les-utilisateurs/ui/slots',
    'utilisateurs/ui/presenters',
  ],
  'libraries/etat-encode': [
    'activites/abilities/enregistrer-un-accompagnement-individuel/ui/presenters',
    'activites/abilities/enregistrer-un-atelier-collectif/ui/presenters',
    'activites/abilities/enregistrer-une-activite-de-coordination/ui/presenters',
    'activites/ui/components',
    'activites/ui/presenters',
    'beneficiaire/abilities/creer-beneficiaire/ui/pages',
    'beneficiaire/ui/forms',
    'clients-api/abilities/lire-les-activites/implementations/api-v1',
    'equipe/implementations/email',
    'rdvsp/implementations/oauth',
  ],
  'libraries/formulaire': [
    'activites/abilities/enregistrer-un-accompagnement-individuel/ui/pages',
    'activites/abilities/enregistrer-un-accompagnement-individuel/ui/presenters',
    'activites/abilities/enregistrer-un-atelier-collectif/ui/pages',
    'activites/abilities/enregistrer-un-atelier-collectif/ui/presenters',
    'activites/abilities/enregistrer-une-activite-de-coordination/ui/pages',
    'activites/abilities/enregistrer-une-activite-de-coordination/ui/presenters',
    'activites/ui/components',
    'activites/ui/presenters',
    'employeuse/abilities/rattacher-a-une-employeuse/ui/slots',
    'equipe/abilities/ajouter-un-membre/ui/components',
    'equipe/abilities/inviter-des-membres/ui/components',
    'inscription/abilities/ajouter-structure-employeuse-en-lieu/ui/pages',
    'inscription/abilities/choisir-profil/ui/pages',
    'lieux-activite/abilities/ajouter-des-lieux-activite/ui/components',
    'lieux-activite/abilities/ajouter-des-lieux-activite/ui/pages',
    'lieux-activite/abilities/fusionner-des-lieux/ui/components',
    'lieux-activite/abilities/lister-tous-les-lieux/ui/components',
    'lieux-activite/abilities/modifier-la-fiche-du-lieu/ui/components',
    'tags/abilities/creer-un-tag/ui/slots',
    'tags/abilities/fusionner-un-tag/ui/slots',
    'tags/abilities/modifier-un-tag/ui/slots',
    'utilisateurs/abilities/fusionner-des-comptes/ui/components',
    'utilisateurs/abilities/lister-les-utilisateurs/ui/components',
  ],
  'libraries/insee': [
    'activites/abilities/exporter-les-accompagnements-par-departement/domain',
    'activites/abilities/exporter-les-accompagnements-par-departement/implementations/csv',
    'activites/abilities/exporter-les-accompagnements-par-departement/implementations/prisma',
    'activites/abilities/exporter-mes-accompagnements/domain',
    'activites/abilities/exporter-mes-accompagnements/implementations/prisma',
    'activites/abilities/exporter-mes-accompagnements/ui/presenters',
    'activites/abilities/rechercher-les-lieux-des-statistiques/domain',
    'activites/domain',
    'activites/implementations/prisma',
    'activites/ui/filtres',
    'employeuse/abilities/rattacher-a-une-employeuse/domain',
    'employeuse/abilities/rattacher-a-une-employeuse/implementations/prisma',
    'employeuse/domain',
    'employeuse/implementations/prisma',
    'equipe/abilities/exporter-les-membres/ui/presenters',
    'equipe/abilities/lister-les-membres/domain',
    'equipe/abilities/lister-les-membres/implementations/prisma',
    'equipe/abilities/lister-les-membres/ui/presenters',
    'equipe/domain',
    'equipe/implementations/prisma',
    'lieux-activite/abilities/lister-les-mediateurs-du-lieu/domain',
    'lieux-activite/abilities/lister-les-mediateurs-du-lieu/implementations/prisma',
    'lieux-activite/abilities/mesurer-la-visibilite-sur-la-cartographie/domain',
    'lieux-activite/abilities/mesurer-la-visibilite-sur-la-cartographie/implementations/prisma',
    'lieux-activite/abilities/mesurer-la-visibilite-sur-la-cartographie/ui/presenters',
    'lieux-activite/abilities/modifier-la-fiche-du-lieu/ui/presenters',
    'lieux-activite/implementations/prisma',
    'lieux-activite/ui/presenters',
    'mon-reseau/abilities/consulter-le-reseau-du-departement/domain',
    'mon-reseau/abilities/consulter-les-lieux-du-departement/domain',
    'mon-reseau/abilities/consulter-un-acteur/domain',
    'mon-reseau/abilities/consulter-un-acteur/ui/presenters',
    'mon-reseau/abilities/lister-les-acteurs-du-departement/domain',
    'mon-reseau/abilities/lister-les-acteurs-du-departement/ui/presenters',
    'mon-reseau/domain',
    'mon-reseau/implementations/prisma',
    'mon-reseau/ui/filtres',
    'mon-reseau/ui/presenters',
    'statistiques/abilities/exposer-les-statistiques/implementations/api',
    'tags/abilities/creer-un-tag/ui/presenters',
    'tags/domain',
    'tags/implementations/prisma',
    'utilisateurs/abilities/consulter-un-utilisateur/domain',
    'utilisateurs/abilities/consulter-un-utilisateur/implementations/prisma',
    'utilisateurs/domain',
    'utilisateurs/implementations/prisma',
    'utilisateurs/ui/filtres',
  ],
  'libraries/liens-d-evitement': [
    'activites/abilities/lister-mes-activites/ui/components',
  ],
  'libraries/model': [
    'activites/implementations/prisma',
    'activites/ui/labels',
    'outils/abilities/lister-mes-outils/ui/presenters',
  ],
  'libraries/navigateur': [
    'activites/abilities/enregistrer-un-accompagnement-individuel/ui/forms',
    'activites/abilities/enregistrer-un-atelier-collectif/ui/forms',
    'activites/abilities/enregistrer-une-activite-de-coordination/ui/forms',
    'activites/abilities/exporter-les-activites-de-coordination/ui/slots',
    'activites/abilities/exporter-mes-accompagnements/ui/components',
    'beneficiaire/abilities/importer-beneficiaires/ui/forms',
    'beneficiaire/abilities/lister-beneficiaires/ui/components',
    'statistiques/ui/components',
    'utilisateurs/abilities/exporter-les-utilisateurs/ui/slots',
  ],
  'libraries/nextjs': [
    'beneficiaire/abilities/lister-beneficiaires/ui/pages',
    'inscription/abilities/ajouter-structure-employeuse-en-lieu/ui/pages',
    'inscription/abilities/choisir-profil/ui/pages',
    'lieux-activite/abilities/ajouter-des-lieux-activite/ui/pages',
    'lieux-activite/abilities/creer-lieu-activite/ui/pages',
    'statistiques/abilities/consulter-mes-statistiques/ui/pages',
  ],
  'libraries/nom-affiche': [
    'activites/abilities/exporter-mes-accompagnements/implementations/prisma',
    'activites/abilities/lister-mes-activites/ui/presenters',
    'activites/domain',
    'activites/implementations/prisma',
    'equipe/domain',
    'lieux-activite/abilities/lister-les-mediateurs-du-lieu/domain',
    'lieux-activite/abilities/lister-les-mediateurs-du-lieu/implementations/prisma',
    'lieux-activite/abilities/modifier-la-fiche-du-lieu/domain',
    'lieux-activite/abilities/modifier-la-fiche-du-lieu/implementations/prisma',
    'lieux-activite/abilities/modifier-la-fiche-du-lieu/ui/presenters',
    'lieux-activite/domain',
    'lieux-activite/implementations/prisma',
    'lieux-activite/ui/presenters',
    'mon-reseau/abilities/consulter-un-acteur/domain',
    'mon-reseau/abilities/consulter-un-acteur/implementations/prisma',
    'mon-reseau/abilities/consulter-un-acteur/ui/presenters',
    'mon-reseau/abilities/lister-les-acteurs-du-departement/ui/presenters',
    'mon-reseau/domain',
    'mon-reseau/implementations/prisma',
    'mon-reseau/ui/presenters',
    'navigation/ui/components',
    'utilisateurs/domain',
  ],
  'libraries/nombre': [
    'activites/abilities/compter-les-accompagnements/ui/components',
    'activites/abilities/enregistrer-un-atelier-collectif/ui/forms',
    'activites/abilities/exporter-les-activites-de-coordination/ui/slots',
    'activites/abilities/exporter-mes-accompagnements/ui/components',
    'activites/abilities/lister-mes-activites/ui/presenters',
    'activites/abilities/repartir-les-accompagnements/ui/components',
    'activites/abilities/repartir-les-accompagnements/ui/slots',
    'activites/ui/components',
    'beneficiaire/abilities/detecter-doublons/ui/components',
    'beneficiaire/abilities/detecter-doublons/ui/pages',
    'beneficiaire/abilities/lister-beneficiaires/ui/presenters',
    'employeuse/abilities/lister-employeuses/ui/components',
    'legal/abilities/consulter-les-statistiques-publiques/ui/components',
    'lieux-activite/abilities/lister-tous-les-lieux/ui/components',
    'mon-reseau/abilities/consulter-le-reseau-du-departement/ui/components',
    'rdvsp/abilities/administrer-comptes-rdv/ui/pages',
    'rdvsp/abilities/consulter-rdvs-accueil/ui/slots',
    'statistiques/implementations/excel',
    'statistiques/ui/components',
    'statistiques/ui/presenters',
    'tags/abilities/mesurer-l-usage-des-tags/ui/pages',
    'tags/ui/components',
    'tags/ui/presenters',
    'utilisateurs/abilities/consulter-un-utilisateur/ui/pages',
    'utilisateurs/abilities/lister-les-utilisateurs/ui/columns',
  ],
  'libraries/pictograms': [
    'activites/abilities/lister-les-activites-de-coordination/ui/components',
    'activites/abilities/lister-mes-activites/ui/components',
    'activites/ui/components',
    'navigation/ui/components',
    'outils/abilities/lister-mes-outils/ui/components',
    'outils/abilities/lister-mes-outils/ui/pages',
    'outils/abilities/lister-mes-outils/ui/presenters',
    'rdvsp/abilities/afficher-rdvs-dans-activites/ui/slots',
    'rdvsp/abilities/connecter-compte-rdv/ui/pages',
    'rdvsp/abilities/consulter-rdvs-accueil/ui/components',
    'rdvsp/ui/slots',
    'vitrine/ui/components',
  ],
  'libraries/pluriel': [
    'activites/abilities/compter-les-accompagnements/ui/components',
    'activites/abilities/compter-les-accompagnements/ui/slots',
    'activites/abilities/enregistrer-un-atelier-collectif/ui/forms',
    'activites/abilities/exporter-mes-accompagnements/ui/components',
    'activites/abilities/lister-les-activites-de-coordination/ui/presenters',
    'activites/abilities/lister-mes-activites/ui/presenters',
    'activites/abilities/repartir-les-accompagnements/ui/components',
    'activites/abilities/repartir-les-accompagnements/ui/slots',
    'activites/ui/presenters',
    'beneficiaire/abilities/detecter-doublons/ui/components',
    'beneficiaire/abilities/detecter-doublons/ui/pages',
    'beneficiaire/abilities/importer-beneficiaires/ui/components',
    'beneficiaire/abilities/lister-beneficiaires/ui/components',
    'employeuse/abilities/lister-employeuses/ui/pages',
    'equipe/abilities/inviter-des-membres/ui/presenters',
    'equipe/abilities/lister-les-membres/ui/slots',
    'inscription/abilities/valider/ui/pages',
    'lieux-activite/abilities/fusionner-des-lieux/ui/components',
    'lieux-activite/abilities/lister-les-lieux-du-mediateur/ui/pages',
    'lieux-activite/abilities/lister-les-mediateurs-du-lieu/ui/presenters',
    'lieux-activite/abilities/lister-tous-les-lieux/ui/pages',
    'lieux-activite/abilities/mesurer-la-visibilite-sur-la-cartographie/ui/presenters',
    'lieux-activite/abilities/modifier-la-fiche-du-lieu/ui/components',
    'lieux-activite/abilities/modifier-la-fiche-du-lieu/ui/presenters',
    'lieux-activite/ui/presenters',
    'mon-reseau/abilities/consulter-les-lieux-du-departement/ui/presenters',
    'mon-reseau/abilities/lister-les-acteurs-du-departement/ui/presenters',
    'mon-reseau/ui/presenters',
    'rdvsp/abilities/administrer-comptes-rdv/ui/pages',
    'rdvsp/abilities/consulter-rdvs-accueil/ui/components',
    'rdvsp/abilities/consulter-rdvs-accueil/ui/presenters',
    'tags/abilities/fusionner-un-tag/ui/slots',
    'utilisateurs/abilities/lister-les-utilisateurs/ui/pages',
  ],
  'libraries/proportions': [
    'activites/abilities/compter-les-accompagnements-par-commune/ui/components',
    'activites/abilities/compter-les-accompagnements-par-commune/ui/presenters',
    'activites/abilities/compter-les-accompagnements-par-lieu/ui/components',
    'activites/abilities/compter-les-accompagnements-par-lieu/ui/presenters',
    'activites/abilities/compter-les-accompagnements-par-lieu/ui/slots',
    'activites/abilities/compter-les-accompagnements-par-periode/ui/components',
    'activites/abilities/compter-les-accompagnements-par-periode/ui/presenters',
    'activites/abilities/compter-les-accompagnements-par-periode/ui/slots',
    'activites/abilities/compter-les-accompagnements/ui/presenters',
    'activites/abilities/compter-les-personnes-accompagnees-par-commune/ui/components',
    'activites/abilities/compter-les-personnes-accompagnees-par-commune/ui/presenters',
    'activites/abilities/compter-les-personnes-accompagnees-par-commune/ui/slots',
    'activites/abilities/decrire-les-personnes-accompagnees/ui/components',
    'activites/abilities/decrire-les-personnes-accompagnees/ui/slots',
    'activites/abilities/repartir-les-accompagnements-par-tag/ui/components',
    'activites/abilities/repartir-les-accompagnements-par-tag/ui/presenters',
    'activites/abilities/repartir-les-accompagnements/ui/components',
    'activites/abilities/repartir-les-accompagnements/ui/slots',
    'activites/ui/presenters',
    'legal/abilities/consulter-les-statistiques-publiques/implementations/prisma',
    'statistiques/implementations/excel',
  ],
  'libraries/result': [
    'inscription/abilities/renseigner-lieux-activite/action',
    'lieux-activite/abilities/ajouter-des-lieux-activite/action',
    'lieux-activite/abilities/ajouter-des-lieux-activite/ui/forms',
    'rdvsp/abilities/consulter-rdvs-accueil/ui/slots',
  ],
  'libraries/tableur': [
    'statistiques/ui/presenters',
    'utilisateurs/ui/presenters',
  ],
  'libraries/telephone': [
    'authentification/implementations/next-auth',
    'authentification/implementations/prisma',
    'authentification/implementations/proconnect',
    'beneficiaire/abilities/consulter-beneficiaire/ui/components',
    'beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/prisma',
    'beneficiaire/abilities/detecter-doublons/domain',
    'beneficiaire/abilities/detecter-doublons/implementations/prisma',
    'beneficiaire/abilities/detecter-doublons/ui/components',
    'beneficiaire/abilities/exporter-beneficiaires/domain',
    'beneficiaire/abilities/exporter-beneficiaires/implementations/excel',
    'beneficiaire/abilities/importer-beneficiaires/action',
    'beneficiaire/abilities/lister-beneficiaires/domain',
    'beneficiaire/abilities/lister-beneficiaires/implementations/prisma',
    'beneficiaire/abilities/modifier-beneficiaire/ui/presenters',
    'beneficiaire/action',
    'beneficiaire/domain',
    'beneficiaire/implementations/prisma',
    'beneficiaire/ui/forms',
    'employeuse/ui/presenters',
    'equipe/abilities/consulter-une-invitation/ui/pages',
    'equipe/abilities/exporter-les-membres/implementations/excel',
    'equipe/abilities/exporter-les-membres/ui/presenters',
    'equipe/abilities/lister-les-membres/ui/pages',
    'equipe/domain',
    'equipe/implementations/prisma',
    'lieux-activite/abilities/modifier-la-fiche-du-lieu/ui/components',
    'lieux-activite/abilities/modifier-la-fiche-du-lieu/ui/presenters',
    'utilisateurs/abilities/consulter-un-utilisateur/domain',
    'utilisateurs/abilities/consulter-un-utilisateur/implementations/prisma',
    'utilisateurs/abilities/consulter-un-utilisateur/ui/presenters',
    'utilisateurs/domain',
    'utilisateurs/implementations/brevo',
    'utilisateurs/implementations/prisma',
    'utilisateurs/ui/presenters',
  ],
  'libraries/texte': [
    'activites/abilities/exporter-les-activites-de-coordination/ui/presenters',
    'activites/abilities/exporter-mes-accompagnements/ui/presenters',
    'activites/abilities/rechercher-les-lieux-des-statistiques/implementations/prisma',
    'beneficiaire/abilities/exporter-beneficiaires/implementations/excel',
    'employeuse/abilities/lister-employeuses/ui/presenters',
    'employeuse/ui/presenters',
    'equipe/abilities/lister-les-membres-a-filtrer/domain',
    'lieux-activite/abilities/fusionner-des-lieux/implementations/prisma',
    'lieux-activite/abilities/fusionner-des-lieux/ui/components',
    'lieux-activite/abilities/fusionner-des-lieux/ui/pages',
    'lieux-activite/abilities/fusionner-des-lieux/ui/presenters',
    'lieux-activite/abilities/lister-tous-les-lieux/implementations/prisma',
    'lieux-activite/abilities/modifier-la-fiche-du-lieu/ui/components',
    'lieux-activite/abilities/rechercher-des-lieux-a-ajouter/implementations/entrepot',
    'lieux-activite/abilities/rechercher-des-lieux-a-ajouter/implementations/prisma',
    'lieux-activite/abilities/rechercher-un-lieu-activite/implementations/prisma',
    'tags/abilities/lire-les-tags-visibles/domain',
  ],
  'libraries/texte-riche': [
    'activites/domain',
    'beneficiaire/abilities/consulter-beneficiaire/ui/components',
    'beneficiaire/domain',
    'lieux-activite/abilities/modifier-la-fiche-du-lieu/ui/presenters',
    'lieux-activite/domain',
  ],
  'libraries/ui': [
    'activites/abilities/enregistrer-une-activite-de-coordination/ui/presenters',
    'activites/abilities/exporter-mes-accompagnements/ui/presenters',
    'activites/abilities/lister-les-activites-de-coordination/ui/presenters',
    'activites/abilities/lister-mes-activites/ui/presenters',
    'activites/abilities/rechercher-les-employeuses-des-activites/ui/presenters',
    'activites/abilities/rechercher-les-lieux-des-statistiques/ui/presenters',
    'activites/ui/presenters',
    'beneficiaire/abilities/rechercher-beneficiaires/ui/presenters',
    'employeuse/abilities/rechercher-employeuse/ui/presenters',
    'equipe/abilities/lister-les-membres-a-filtrer/ui/presenters',
    'lieux-activite/abilities/modifier-la-fiche-du-lieu/ui/hooks',
    'mon-reseau/ui/presenters',
    'utilisateurs/abilities/lister-les-utilisateurs/ui/presenters',
    'utilisateurs/ui/presenters',
  ],
  'lodash-es': [
    'beneficiaire/abilities/importer-beneficiaires/implementations/fichier',
  ],
  'next-auth': [
    'authentification/abilities/se-connecter/ui/components',
    'authentification/abilities/se-connecter/ui/forms',
    'authentification/implementations/email',
    'authentification/implementations/prisma',
    'utilisateurs/abilities/consulter-mon-profil/ui/components',
    'utilisateurs/abilities/supprimer-compte/ui/slots',
  ],
  'node:crypto': [
    'mediateurs/abilities/regler-le-partage-statistiques/implementations/prisma',
  ],
  'node:fs': [
    'beneficiaire/abilities/importer-beneficiaires/implementations/excel',
  ],
  'node:path': [
    'beneficiaire/abilities/importer-beneficiaires/implementations/excel',
  ],
  'node:stream': [
    'beneficiaire/abilities/importer-beneficiaires/implementations/excel',
  ],
  nodemailer: ['authentification/implementations/email'],
  'p-throttle': ['utilisateurs/implementations/brevo'],
  'radix-ui': ['navigation/ui/components'],
  react: [
    'authentification/middlewares',
    'outils/abilities/consulter-un-outil/ui/presenters',
  ],
  'react-dom': [
    'equipe/abilities/lister-les-membres/ui/components',
    'equipe/abilities/retirer-un-membre/ui/slots',
    'equipe/abilities/supprimer-un-ancien-membre/ui/slots',
    'equipe/ui/components',
    'mon-reseau/abilities/consulter-un-acteur/ui/components',
  ],
  'react-hook-form': [
    'authentification/abilities/se-connecter/ui/forms',
    'beneficiaire/ui/forms',
  ],
  recharts: [
    'activites/abilities/compter-les-accompagnements-par-periode/ui/components',
    'activites/ui/components',
    'legal/abilities/consulter-les-statistiques-publiques/ui/components',
  ],
  'server-only': ['authentification/middlewares'],
  'usehooks-ts': [
    'beneficiaire/abilities/lister-beneficiaires/ui/components',
    'navigation/ui/components',
  ],
  uuid: [
    'activites/abilities/enregistrer-une-activite-de-coordination/implementations/prisma',
    'activites/implementations/prisma',
    'authentification/implementations/prisma',
    'beneficiaire/abilities/creer-beneficiaire/implementations/prisma',
    'beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/prisma',
    'beneficiaire/abilities/importer-beneficiaires/implementations/prisma',
    'inscription/abilities/choisir-profil/implementations/prisma',
    'lieux-activite/abilities/ajouter-des-lieux-activite/implementations/prisma',
    'lieux-activite/abilities/creer-lieu-activite/implementations/prisma',
  ],
  zod: [
    'activites/abilities/enregistrer-un-accompagnement-individuel/ui/presenters',
    'activites/abilities/enregistrer-un-atelier-collectif/ui/presenters',
    'activites/abilities/enregistrer-une-activite-de-coordination/ui/presenters',
    'activites/implementations/prisma',
    'activites/ui/components',
    'activites/ui/filtres',
    'lieux-activite/abilities/ajouter-des-lieux-activite/implementations/entrepot',
    'lieux-activite/abilities/ajouter-des-lieux-activite/ui/pages',
    'lieux-activite/abilities/modifier-la-fiche-du-lieu/ui/components',
    'rdvsp/implementations/webhook',
    'tags/abilities/creer-un-tag/ui/slots',
    'tags/abilities/modifier-un-tag/ui/slots',
    'utilisateurs/implementations/prisma',
  ],
}

const cible = (nom) =>
  nom.startsWith('features/')
    ? `^src/${nom.replaceAll('.', '[.]')}$`
    : nom.startsWith('libraries/') || nom.startsWith('configuration/')
      ? `^src/${nom}/`
      : nom.startsWith('node:')
        ? `^(?:node:)?${nom.slice(5)}$`
        : `node_modules/${nom}/`

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

const IMPORTS_ADMIS_DES_LIBRARIES = {
  '@arckit/resultset': ['etat-d-url'],
  '@arckit/telemetry': ['nextjs'],
  '@codegouvfr/react-dsfr': [
    'etat-d-url',
    'formulaire',
    'liens-d-evitement',
    'proportions',
    'ui',
  ],
  '@date-fns/tz': ['date'],
  '@faire/mjml-react': ['emails'],
  '@gouvfr-anct/lieux-de-mediation-numerique': ['telephone'],
  '@hookform/resolvers': ['ui'],
  '@tanstack/react-form': ['etat-d-url', 'formulaire'],
  '@tiptap/react': ['ui'],
  '@tiptap/starter-kit': ['ui'],
  '@zumer/snapdom': ['ui'],
  'change-case': ['collections'],
  classnames: ['data-table', 'etat-d-url', 'formulaire', 'proportions', 'ui'],
  'date-fns': ['date', 'ui'],
  downshift: ['ui'],
  exceljs: ['tableur'],
  'framer-motion': ['proportions'],
  'html-minifier-terser': ['emails'],
  'html-to-text': ['texte'],
  'libphonenumber-js': ['telephone'],
  'libraries/adresse': ['ban'],
  'libraries/chemins': ['emails'],
  'libraries/collections': ['tableur', 'ui'],
  'libraries/date': ['ui'],
  'libraries/etat-encode': ['json-api'],
  'libraries/formulaire': ['ban', 'etat-d-url'],
  'libraries/insee': ['departement'],
  'libraries/model': [
    'code-postal',
    'departement',
    'insee',
    'nom-affiche',
    'telephone',
  ],
  'libraries/navigateur': ['ui'],
  'libraries/nextjs': ['etat-d-url'],
  'libraries/nombre': ['proportions'],
  'libraries/pictograms': ['formulaire'],
  'libraries/result': ['departement'],
  'libraries/texte': ['etat-d-url', 'recherche-entreprises'],
  'libraries/ui': ['ban', 'etat-d-url', 'formulaire'],
  'lodash-es': ['formulaire', 'json-api'],
  mjml: ['emails'],
  next: [
    'chemin-interne',
    'etat-d-url',
    'formulaire',
    'json-api',
    'nextjs',
    'ui',
  ],
  'node:e2e/support/monter-avec-l-url.tsx': ['etat-d-url'],
  'node:fs': ['chemins', 'emails'],
  'node:path': ['chemins', 'emails'],
  'node:url': ['chemins'],
  nuqs: ['etat-d-url'],
  'p-retry': ['recherche-entreprises'],
  pako: ['etat-encode'],
  piqure: ['nextjs'],
  'radix-ui': ['ui'],
  react: [
    'data-table',
    'emails',
    'etat-d-url',
    'formulaire',
    'liens-d-evitement',
    'nextjs',
    'pictograms',
    'proportions',
    'ui',
  ],
  'react-calendar': ['ui'],
  'react-day-picker': ['ui'],
  'react-dom': ['liens-d-evitement', 'ui'],
  'react-hook-form': ['adresse', 'ui'],
  'react-hot-toast': ['ui'],
  'sanitize-html': ['texte-riche'],
  slugify: ['texte'],
  superjson: ['etat-encode'],
  tsafe: ['ui'],
  zod: [
    'adresse',
    'code-postal',
    'departement',
    'etat-d-url',
    'insee',
    'json-api',
    'model',
    'nextjs',
    'nom-affiche',
    'telephone',
    'ui',
  ],
  zustand: ['ui'],
}

const IMPORTS_ADMIS_DE_LA_CONFIGURATION = {
  '@arckit/telemetry': ['telemetry'],
  '@codegouvfr/react-dsfr': ['dsfr'],
  '@prisma/adapter-pg': ['prisma'],
  '@sentry/nextjs': ['telemetry'],
  '@sentry/node': ['telemetry'],
  'configuration/environnement': [
    'brevo',
    'prisma',
    'projet',
    'recherche-entreprises',
    'smtp',
    'telemetry',
  ],
  'configuration/projet': ['brevo', 'recherche-entreprises', 'telemetry'],
  'configuration/telemetry': ['ban', 'nextjs', 'prisma'],
  'libraries/ban': ['ban'],
  'libraries/chemin-interne': ['projet'],
  'libraries/navigateur': ['projet'],
  'libraries/nextjs': ['nextjs', 'telemetry'],
  'libraries/recherche-entreprises': ['recherche-entreprises'],
  next: ['dsfr', 'projet', 'telemetry'],
  nodemailer: ['smtp'],
  'postgres-array': ['prisma'],
  react: ['telemetry'],
  zod: ['environnement'],
}

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

const IMPORTS_ADMIS_DES_JOBS = {
  'configuration/brevo': [
    'remove-orphan-brevo-contacts',
    'synchroniser-les-roles-brevo',
  ],
  'libraries/chronometre': ['job-executors.ts'],
  'libraries/emails': ['verifier-le-bundle.ts'],
  uuid: ['job-executors.ts'],
}

const IMPORTS_ADMIS_DU_CLI = {
  '@octokit/core': ['github'],
  '@octokit/plugin-rest-endpoint-methods': ['github'],
  axios: [
    'commands',
    'get-avec-nouvelles-tentatives.spec.ts',
    'get-avec-nouvelles-tentatives.ts',
    'secrets',
  ],
  'configuration/environnement': ['commands', 'fixtures', 'github', 'secrets'],
  'configuration/prisma': ['commands', 'fixtures'],
  'configuration/projet': ['commands', 'github'],
  'libraries/chemins': ['commands', 'dot-env-file.ts'],
  'libraries/fixtures': ['fixtures'],
  nanoid: ['secrets'],
  'node:child_process': ['commands'],
  'node:crypto': ['branch-namespace.ts'],
  'node:fs': ['commands'],
  'node:fs/promises': ['commands', 'dot-env-file.ts'],
  'node:path': ['commands', 'dot-env-file.ts'],
  'node:util': ['commands'],
  'p-retry': ['get-avec-nouvelles-tentatives.ts', 'secrets'],
}

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
  ],
  options: {
    doNotFollow: { path: ['node_modules'] },
    exclude: { path: '^src/generated/' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      mainFields: ['module', 'main', 'types', 'typings'],
    },
  },
}
