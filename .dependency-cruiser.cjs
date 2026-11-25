const FICHIER_DE_TEST =
  '[.](?:spec|integration|stories|cy|steps|cucumber|test)[.]tsx?$|/fixtures/'

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

module.exports = {
  forbidden: [...GLOBAL],
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
