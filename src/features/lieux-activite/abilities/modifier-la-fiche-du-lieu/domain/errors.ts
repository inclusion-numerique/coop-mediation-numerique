import type { FicheIntrouvable } from '../../../domain/errors'
import type { LieuId } from '../../../domain/identifiants/lieu-id'

export type PublicationSansService = {
  readonly _tag: 'PublicationSansService'
  readonly id: LieuId
}

export const PublicationSansService = (id: LieuId): PublicationSansService => ({
  _tag: 'PublicationSansService',
  id,
})

export type PublicationSansAdresse = {
  readonly _tag: 'PublicationSansAdresse'
  readonly id: LieuId
}

export const PublicationSansAdresse = (id: LieuId): PublicationSansAdresse => ({
  _tag: 'PublicationSansAdresse',
  id,
})

export type EchecDeModifierLaFicheDuLieu =
  | FicheIntrouvable
  | PublicationSansService
  | PublicationSansAdresse
