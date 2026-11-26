import type { ErreurRdvApi } from '../../../domain/errors'
import type { EmailExterne } from '../../../domain/identite'

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

export type CodeAutorisationRefuse = {
  readonly _tag: 'CodeAutorisationRefuse'
  readonly detail: string
}

export const CodeAutorisationRefuse = (
  detail: string,
): CodeAutorisationRefuse => ({ _tag: 'CodeAutorisationRefuse', detail })

export type EchecDeConnecterCompteRdv =
  | CodeAutorisationRefuse
  | EmailAgentDifferent
  | ErreurRdvApi
