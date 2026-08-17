export const AFFICHER_RDVS_DANS_ACTIVITES_ERRORS = {
  CompteRdvIntrouvable: 'Compte RDV Service Public introuvable',
} as const

export type AfficherRdvsDansActivitesErrorKey =
  (typeof AFFICHER_RDVS_DANS_ACTIVITES_ERRORS)[keyof typeof AFFICHER_RDVS_DANS_ACTIVITES_ERRORS]
