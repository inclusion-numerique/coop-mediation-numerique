import type {
  DataspaceApiError,
  DataspaceConseillerNumeriqueCoordonne,
  DataspaceConseillerNumeriqueIds,
  DataspaceContact,
  DataspaceContrat,
  DataspaceLieuActivite,
  DataspaceMediateur,
  DataspaceMediateurAdresse,
  DataspaceStructureEmployeuse,
} from './dataspaceApiClient'

/**
 * Mock data for Dataspace API responses
 * Used in e2e and unit tests to simulate various scenarios
 */

// Base address mock
export const mockDataspaceAdresse: DataspaceMediateurAdresse = {
  nom_voie: 'Rue de la République',
  code_insee: '69123',
  repetition: null,
  code_postal: '69002',
  nom_commune: 'Lyon',
  numero_voie: 21,
}

export const mockDataspaceAdresseWithRepetition: DataspaceMediateurAdresse = {
  nom_voie: 'Avenue des Champs-Élysées',
  code_insee: '75108',
  repetition: 'bis',
  code_postal: '75008',
  nom_commune: 'Paris',
  numero_voie: 45,
}

// Contact mocks
export const mockDataspaceContact: DataspaceContact = {
  nom: 'Dupont',
  prenom: 'Jean',
  courriels: {
    mail_gestionnaire: 'jean.dupont.gestionnaire@example.fr',
    mail_pro: 'jean.dupont@example.fr',
  },
  telephone: '0612345678',
}

export const mockDataspaceContactMinimal: DataspaceContact = {
  nom: 'Martin',
  prenom: 'Marie',
  courriels: {
    mail_pro: 'marie.martin@example.fr',
  },
}

// Contract mocks
export const mockDataspaceContratCDD: DataspaceContrat = {
  type: 'CDD',
  date_fin: '2025-12-31',
  date_debut: '2024-01-01',
  date_rupture: null,
}

export const mockDataspaceContratCDI: DataspaceContrat = {
  type: 'CDI',
  date_fin: '2099-12-31',
  date_debut: '2023-06-01',
  date_rupture: null,
}

export const mockDataspaceContratTermine: DataspaceContrat = {
  type: 'CDD',
  date_fin: '2024-06-30',
  date_debut: '2023-01-01',
  date_rupture: '2024-03-15',
}

// Structure employeuse mocks
export const mockDataspaceStructureEmployeuse: DataspaceStructureEmployeuse = {
  nom: 'Centre Social de Lyon',
  siret: '12345678901234',
  contact: mockDataspaceContact,
  adresse: mockDataspaceAdresse,
  contrats: [mockDataspaceContratCDI],
}

export const mockDataspaceStructureEmployeuseWithMultipleContrats: DataspaceStructureEmployeuse =
  {
    nom: 'Mairie de Paris',
    siret: '98765432109876',
    contact: mockDataspaceContactMinimal,
    adresse: mockDataspaceAdresseWithRepetition,
    contrats: [mockDataspaceContratCDD, mockDataspaceContratTermine],
  }

export const mockDataspaceStructureEmployeuseWithoutContact: DataspaceStructureEmployeuse =
  {
    nom: 'Association Inclusion Numérique',
    siret: '11122233344455',
    contact: null,
    adresse: mockDataspaceAdresse,
    contrats: [mockDataspaceContratCDD],
  }

// Lieu activite mocks
export const mockDataspaceLieuActivite: DataspaceLieuActivite = {
  nom: 'Médiathèque Municipale',
  siret: '55566677788899',
  adresse: mockDataspaceAdresse,
  contact: mockDataspaceContact,
}

export const mockDataspaceLieuActiviteWithoutContact: DataspaceLieuActivite = {
  nom: 'Espace Public Numérique',
  siret: '99988877766655',
  adresse: mockDataspaceAdresseWithRepetition,
  contact: null,
}

// Conseiller numerique IDs mocks
export const mockDataspaceConseillerNumeriqueIds: DataspaceConseillerNumeriqueIds =
  {
    coop: '58ef4a83-b8b2-4253-958a-4e3348c9b6dc', // random uuid
    cn_pg: 'cn-pg-456',
    dataspace: 789,
    aidant_connect: 'aidant-id-abc',
    conseiller_numerique: '6217b9ff9ee981b6489c10fc',
  }

export const mockDataspaceConseillerNumeriqueIdsPartial: DataspaceConseillerNumeriqueIds =
  {
    coop: null,
    cn_pg: 'cn-pg-789',
    dataspace: null,
    aidant_connect: null,
    conseiller_numerique: '6217b9ff9ee981b6489c10fd',
  }

// Conseiller numerique coordonne mocks
export const mockDataspaceConseillerNumeriqueCoordonne: DataspaceConseillerNumeriqueCoordonne =
  {
    ids: mockDataspaceConseillerNumeriqueIds,
    nom: 'Bernard',
    prenom: 'Sophie',
    contact: {
      courriels: {
        mail_pro: 'sophie.bernard@conseiller-numerique.fr',
      },
      telephone: '0687654321',
    },
  }

export const mockDataspaceConseillerNumeriqueCoordonneMinimal: DataspaceConseillerNumeriqueCoordonne =
  {
    ids: mockDataspaceConseillerNumeriqueIdsPartial,
    nom: 'Petit',
    prenom: 'Paul',
    contact: {
      courriels: {
        mail_pro: 'paul.petit@conseiller-numerique.fr',
      },
    },
  }

// Complete Mediateur mocks

/**
 * Mock for a typical conseiller numerique mediateur
 */
export const mockDataspaceMediateurConseillerNumerique: DataspaceMediateur = {
  id: 12345,
  is_coordinateur: false,
  is_conseiller_numerique: true,
  structures_employeuses: [mockDataspaceStructureEmployeuse],
  lieux_activite: [
    mockDataspaceLieuActivite,
    mockDataspaceLieuActiviteWithoutContact,
  ],
  conseillers_numeriques_coordonnes: [],
}

/**
 * Mock for a coordinateur with conseillers coordonnés
 */
export const mockDataspaceCoordinateurWithTeam: DataspaceMediateur = {
  id: 67890,
  is_coordinateur: true,
  is_conseiller_numerique: true,
  structures_employeuses: [
    mockDataspaceStructureEmployeuse,
    mockDataspaceStructureEmployeuseWithMultipleContrats,
  ],
  lieux_activite: [mockDataspaceLieuActivite],
  conseillers_numeriques_coordonnes: [
    mockDataspaceConseillerNumeriqueCoordonne,
    mockDataspaceConseillerNumeriqueCoordonneMinimal,
  ],
}

/**
 * Mock for a mediateur (not conseiller numerique)
 */
export const mockDataspaceMediateurNonConseillerNumerique: DataspaceMediateur =
  {
    id: 11111,
    is_coordinateur: false,
    is_conseiller_numerique: false,
    structures_employeuses: [mockDataspaceStructureEmployeuseWithoutContact],
    lieux_activite: [mockDataspaceLieuActiviteWithoutContact],
    conseillers_numeriques_coordonnes: [],
  }

/**
 * Mock for a minimal mediateur with no structures or lieux
 */
export const mockDataspaceMediateurMinimal: DataspaceMediateur = {
  id: 99999,
  is_coordinateur: false,
  is_conseiller_numerique: false,
  structures_employeuses: [],
  lieux_activite: [],
  conseillers_numeriques_coordonnes: [],
}

/**
 * Mock for a coordinateur hors dispositif (not conseiller numerique but coordinateur)
 */
export const mockDataspaceCoordinateurHorsDispositif: DataspaceMediateur = {
  id: 55555,
  is_coordinateur: true,
  is_conseiller_numerique: false,
  structures_employeuses: [mockDataspaceStructureEmployeuse],
  lieux_activite: [mockDataspaceLieuActivite],
  conseillers_numeriques_coordonnes: [
    mockDataspaceConseillerNumeriqueCoordonne,
  ],
}

// Inscription test mocks

/**
 * Mock for conseiller inscription test user
 */
export const mockDataspaceConseillerNumeriqueInscription: DataspaceMediateur = {
  id: 10001,
  is_coordinateur: false,
  is_conseiller_numerique: true,
  structures_employeuses: [mockDataspaceStructureEmployeuse],
  lieux_activite: [
    mockDataspaceLieuActivite,
    mockDataspaceLieuActiviteWithoutContact,
  ],
  conseillers_numeriques_coordonnes: [],
}

/**
 * Mock for coordinateur inscription test user
 */
export const mockDataspaceCoordinateurConumInscription: DataspaceMediateur = {
  id: 10002,
  is_coordinateur: true,
  is_conseiller_numerique: true,
  structures_employeuses: [mockDataspaceStructureEmployeuse],
  lieux_activite: [mockDataspaceLieuActivite],
  conseillers_numeriques_coordonnes: [
    mockDataspaceConseillerNumeriqueCoordonne,
  ],
}

/**
 * Mock for coordinateur inscription avec tout test user
 */
export const mockDataspaceCoordinateurConumInscriptionAvecTout: DataspaceMediateur =
  {
    id: 10003,
    is_coordinateur: true,
    is_conseiller_numerique: true,
    structures_employeuses: [
      mockDataspaceStructureEmployeuse,
      mockDataspaceStructureEmployeuseWithMultipleContrats,
    ],
    lieux_activite: [
      mockDataspaceLieuActivite,
      mockDataspaceLieuActiviteWithoutContact,
    ],
    conseillers_numeriques_coordonnes: [
      mockDataspaceConseillerNumeriqueCoordonne,
      mockDataspaceConseillerNumeriqueCoordonneMinimal,
    ],
  }

/**
 * Mock for coordinateur hors dispositif inscription test user
 */
export const mockDataspaceCoordinateurHorsDispositifInscription: DataspaceMediateur =
  {
    id: 10004,
    is_coordinateur: true,
    is_conseiller_numerique: false,
    structures_employeuses: [mockDataspaceStructureEmployeuse],
    lieux_activite: [mockDataspaceLieuActivite],
    conseillers_numeriques_coordonnes: [],
  }

/**
 * Mock for mediateur inscription test user
 */
export const mockDataspaceMediateurInscription = null

/**
 * Mock for conseiller sans lieu inscription test user
 */
export const mockDataspaceConseillerSansLieuInscription: DataspaceMediateur = {
  id: 10006,
  is_coordinateur: false,
  is_conseiller_numerique: true,
  structures_employeuses: [mockDataspaceStructureEmployeuse],
  lieux_activite: [],
  conseillers_numeriques_coordonnes: [],
}

// API Error mocks

/**
 * Mock for a 404 Not Found error
 */
export const mockDataspaceApiError404: DataspaceApiError = {
  error: {
    statusCode: 404,
    message: 'Mediateur not found',
  },
}

/**
 * Mock for a 401 Unauthorized error
 */
export const mockDataspaceApiError401: DataspaceApiError = {
  error: {
    statusCode: 401,
    message: 'Unauthorized - Invalid API key',
  },
}

/**
 * Mock for a 500 Internal Server Error
 */
export const mockDataspaceApiError500: DataspaceApiError = {
  error: {
    statusCode: 500,
    message: 'Internal server error',
  },
}

/**
 * Mock for a 400 Bad Request error
 */
export const mockDataspaceApiError400: DataspaceApiError = {
  error: {
    statusCode: 400,
    message: 'Bad request - Invalid email format',
  },
}

/**
 * Mock for API key not configured error
 */
export const mockDataspaceApiErrorNoApiKey: DataspaceApiError = {
  error: {
    statusCode: 500,
    message: 'Data Space API key is not configured',
  },
}
