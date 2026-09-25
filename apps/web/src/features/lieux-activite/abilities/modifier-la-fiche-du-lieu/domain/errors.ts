import type { LieuId } from '../../../domain/lieu-id'

export type FicheIntrouvable = {
  readonly _tag: 'FicheIntrouvable'
  readonly id: LieuId
}

export const FicheIntrouvable = (id: LieuId): FicheIntrouvable => ({
  _tag: 'FicheIntrouvable',
  id,
})

/**
 * La publication demande au moins un service — que la section éditée soit la
 * visibilité, ou celle des services dont on retirerait le dernier.
 */
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

export type EchecDeModification =
  | FicheIntrouvable
  | PublicationSansService
  | PublicationSansAdresse
