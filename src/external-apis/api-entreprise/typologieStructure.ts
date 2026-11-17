/**
 * Les seules typologies que l'API Recherche d'entreprises permet de déduire —
 * d'une nature juridique ou d'un complément (association, ESS, SIAE). Les
 * libellés reprennent mot pour mot ceux du formulaire de lieu : c'est la même
 * nomenclature, vue par une source qui n'en connaît qu'une poignée.
 */
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
