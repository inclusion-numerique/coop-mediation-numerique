export const CREER_ACTIVITE_DEPUIS_RDV_ERRORS = {
  RdvNonAutorise: 'Ce rendez-vous n’est pas rattaché à votre compte',
  RdvIntrouvable: 'Rendez-vous introuvable',
  CompteNonLie: 'Aucun compte RDV Service Public lié',
  JetonRevoque:
    'Votre connexion à RDV Service Public a expiré, reconnectez votre compte',
  AccesRefuse:
    'RDV Service Public refuse à votre compte l’accès à cette organisation',
  AgentSupprime: 'Votre compte agent n’existe plus sur RDV Service Public',
  ApiIndisponible: 'RDV Service Public n’a pas pu être contacté',
  ReponseInattendue: 'RDV Service Public a renvoyé une réponse inattendue',
} as const
