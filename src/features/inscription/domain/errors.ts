import type { UtilisateurId } from './utilisateur-id'

export type InscriptionIntrouvable = {
  readonly _tag: 'InscriptionIntrouvable'
  readonly userId: UtilisateurId
}

export const InscriptionIntrouvable = (
  userId: UtilisateurId,
): InscriptionIntrouvable => ({
  _tag: 'InscriptionIntrouvable',
  userId,
})

export type InscriptionDejaValidee = {
  readonly _tag: 'InscriptionDejaValidee'
  readonly userId: UtilisateurId
}

export const InscriptionDejaValidee = (
  userId: UtilisateurId,
): InscriptionDejaValidee => ({
  _tag: 'InscriptionDejaValidee',
  userId,
})

export type ProfilNonChoisi = {
  readonly _tag: 'ProfilNonChoisi'
  readonly userId: UtilisateurId
}

export const ProfilNonChoisi = (userId: UtilisateurId): ProfilNonChoisi => ({
  _tag: 'ProfilNonChoisi',
  userId,
})

export type LieuIntrouvable = {
  readonly _tag: 'LieuIntrouvable'
  readonly lieuId: string
}

export const LieuIntrouvable = (lieuId: string): LieuIntrouvable => ({
  _tag: 'LieuIntrouvable',
  lieuId,
})
