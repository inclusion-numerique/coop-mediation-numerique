export const typologiesStructure = {
  ACIPHC: 'SIAE — Atelier chantier d’insertion premières heures en chantier',
  ASSO: 'Associations',
  CC: 'Communautés de Commune',
  CCAS: 'Centres communaux d’action sociale (CCAS)',
  CD: 'Conseils Départementaux (CD)',
  CIAS: 'Centres intercommunaux d’action sociale (CIAS)',
  EPCI: 'Intercommunalité (EPCI)',
  ESS: 'Entreprise de l’Économie Sociale et Solidaire',
} as const

export type TypologieStructure = keyof typeof typologiesStructure

export const typologieStructureLibelle = (
  typologie: TypologieStructure,
): string => typologiesStructure[typologie]
