import type { EmailExterne } from '../../../domain/identite'

/**
 * L'agent identifié ne porte pas l'adresse du compte La Coop.
 *
 * C'est la garde qui rend l'écart d'e-mail invisible depuis La Coop : aucune
 * liaison ne survit à une divergence, donc 100 % de nos comptes liés ont des
 * adresses identiques des deux côtés. Les écarts que cherche RDV Service Public
 * se trouvent chez les médiateurs dont la liaison a justement échoué ici.
 */
export type EmailAgentDifferent = {
  readonly _tag: 'EmailAgentDifferent'
  readonly emailCoop: EmailExterne
  readonly emailAgent: EmailExterne
}

export const EmailAgentDifferent = (
  emailCoop: EmailExterne,
  emailAgent: EmailExterne,
): EmailAgentDifferent => ({
  _tag: 'EmailAgentDifferent',
  emailCoop,
  emailAgent,
})

/** RDV Service Public a refusé le code : expiré, déjà consommé ou falsifié. */
export type CodeAutorisationRefuse = {
  readonly _tag: 'CodeAutorisationRefuse'
  readonly detail: string
}

export const CodeAutorisationRefuse = (
  detail: string,
): CodeAutorisationRefuse => ({ _tag: 'CodeAutorisationRefuse', detail })
