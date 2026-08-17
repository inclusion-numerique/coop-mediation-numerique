export const DECONNECTER_COMPTE_RDV_ERRORS = {
  CompteRdvIntrouvable: 'Aucun compte RDV Service Public à déconnecter',
} as const

export type DeconnecterCompteRdvErrorKey =
  (typeof DECONNECTER_COMPTE_RDV_ERRORS)[keyof typeof DECONNECTER_COMPTE_RDV_ERRORS]
