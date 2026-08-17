export const PRENDRE_RENDEZ_VOUS_ERRORS = {
  BeneficiaireIntrouvable: 'Bénéficiaire introuvable',
  CompteNonLie: 'Aucun compte RDV Service Public lié',
  JetonRevoque:
    'Votre connexion à RDV Service Public a expiré, reconnectez votre compte',
  ApiIndisponible: 'RDV Service Public n’a pas pu être contacté',
  ReponseInattendue: 'RDV Service Public a renvoyé une réponse inattendue',
  RdvIntrouvable: 'Rendez-vous introuvable',
} as const

export type PrendreRendezVousErrorKey =
  (typeof PRENDRE_RENDEZ_VOUS_ERRORS)[keyof typeof PRENDRE_RENDEZ_VOUS_ERRORS]
