import type { UserId } from './utilisateur-id'

export type InscriptionIntrouvable = {
  readonly _tag: 'InscriptionIntrouvable'
  readonly userId: UserId
}

export const InscriptionIntrouvable = (
  userId: UserId,
): InscriptionIntrouvable => ({
  _tag: 'InscriptionIntrouvable',
  userId,
})

export type InscriptionDejaValidee = {
  readonly _tag: 'InscriptionDejaValidee'
  readonly userId: UserId
}

export const InscriptionDejaValidee = (
  userId: UserId,
): InscriptionDejaValidee => ({
  _tag: 'InscriptionDejaValidee',
  userId,
})

export type ProfilNonChoisi = {
  readonly _tag: 'ProfilNonChoisi'
  readonly userId: UserId
}

export const ProfilNonChoisi = (userId: UserId): ProfilNonChoisi => ({
  _tag: 'ProfilNonChoisi',
  userId,
})
