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

module.exports = {
  forbidden: [...GLOBAL, ...APP, ...FEATURES],
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
