import type { EchecDeConnecterCompteRdv } from '../domain/errors'

export type MotifEchecConnexion = {
  readonly error: string
  readonly error_description: string
}

export const CONNECTER_COMPTE_RDV_ERRORS: Record<
  EchecDeConnecterCompteRdv['_tag'],
  MotifEchecConnexion
> = {
  CodeAutorisationRefuse: {
    error: 'invalid_oauth_code',
    error_description: 'Le code d’autorisation est invalide ou a expiré',
  },
  EmailAgentDifferent: {
    error: 'account_does_not_match_email',
    error_description:
      'Le compte RDV Service Public ne correspond pas à l’adresse email du compte de La coop',
  },
  JetonRevoque: {
    error: 'invalid_oauth_account',
    error_description:
      'Impossible de récupérer l’identifiant de l’utilisateur RDV Service Public',
  },
  CompteNonLie: {
    error: 'invalid_oauth_account',
    error_description:
      'Impossible de récupérer l’identifiant de l’utilisateur RDV Service Public',
  },
  AccesRefuse: {
    error: 'invalid_oauth_account',
    error_description: 'RDV Service Public refuse l’accès à ce compte',
  },
  AgentSupprime: {
    error: 'invalid_oauth_account',
    error_description: 'Ce compte agent n’existe plus sur RDV Service Public',
  },
  ApiIndisponible: {
    error: 'api_error',
    error_description: 'RDV Service Public n’a pas pu être contacté',
  },
  ReponseInattendue: {
    error: 'api_error',
    error_description: 'RDV Service Public a renvoyé une réponse inattendue',
  },
  RdvIntrouvable: {
    error: 'api_error',
    error_description: 'RDV Service Public a renvoyé une réponse inattendue',
  },
} as const

export const CODE_AUTORISATION_MANQUANT: MotifEchecConnexion = {
  error: 'invalid_oauth_code',
  error_description: 'Le code d’autorisation est manquant',
}
