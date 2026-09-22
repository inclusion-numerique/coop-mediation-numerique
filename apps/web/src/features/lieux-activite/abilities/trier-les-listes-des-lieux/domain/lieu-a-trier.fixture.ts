import type { LieuATrier } from './lieu-a-trier'

export const lieuATrier = (champs: Partial<LieuATrier> = {}): LieuATrier => ({
  id: 'e4b5f0d4-5a1f-4a5a-9a4e-2e1c9f0b1d2c',
  nom: 'Espace numérique de Reims',
  commune: 'Reims',
  codePostal: '51100',
  publie: true,
  typologies: ['TIERS_LIEUX'],
  services: ['Aide aux démarches administratives'],
  modalitesAcces: [],
  modalitesAccompagnement: [],
  publicsSpecifiquementAdresses: [],
  priseEnChargeSpecifique: [],
  fraisACharge: [],
  itinerance: [],
  dispositifProgrammesNationaux: [],
  formationsLabels: [],
  autresFormationsLabels: [],
  ...champs,
})
