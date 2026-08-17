import type { ErreurConnexionCompte } from '../domain/connecter-compte-rdv'

export type MotifEchecConnexion = {
  readonly error: string
  readonly error_description: string
}

/**
 * Ce que le parcours OAuth rapporte à l'écran de retour, sous la forme qu'il
 * attend : un code et une phrase, passés en paramètres d'URL.
 *
 * Chaque échec porte son propre code. Tout finissait auparavant en
 * `server_error` dès qu'une exception traversait le `try` de la route, sans que
 * l'utilisateur sache s'il devait recommencer, changer de compte ou attendre.
 */
export const CONNECTER_COMPTE_RDV_ERRORS: Record<
  ErreurConnexionCompte['_tag'],
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

/** Le code d'autorisation n'est jamais arrivé : RDV SP n'a pas été appelé. */
export const CODE_AUTORISATION_MANQUANT: MotifEchecConnexion = {
  error: 'invalid_oauth_code',
  error_description: 'Le code d’autorisation est manquant',
}
