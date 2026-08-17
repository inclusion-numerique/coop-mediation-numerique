export const METTRE_A_JOUR_STATUT_RDV_ERRORS = {
  RdvNonAutorise: 'Ce rendez-vous n’est pas rattaché à votre compte',
  RdvIntrouvable: 'Rendez-vous introuvable',
  CompteNonLie: 'Aucun compte RDV Service Public lié',
  JetonRevoque:
    'Votre connexion à RDV Service Public a expiré, reconnectez votre compte',
  ApiIndisponible: 'RDV Service Public n’a pas pu être contacté',
  ReponseInattendue: 'RDV Service Public a renvoyé une réponse inattendue',
} as const

export type MettreAJourStatutRdvErrorKey =
  (typeof METTRE_A_JOUR_STATUT_RDV_ERRORS)[keyof typeof METTRE_A_JOUR_STATUT_RDV_ERRORS]
