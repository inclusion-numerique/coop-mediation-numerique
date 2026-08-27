import type { InscriptionStep } from './inscription-step'
import type { UserId } from './user-id'

export type InscriptionForbidden = {
  readonly _tag: 'InscriptionForbidden'
  readonly targetUserId: UserId
  readonly granteeId: UserId
}

export const InscriptionForbidden = (
  targetUserId: UserId,
  granteeId: UserId,
): InscriptionForbidden => ({
  _tag: 'InscriptionForbidden',
  targetUserId,
  granteeId,
})

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

export type EtapeNonAtteinte = {
  readonly _tag: 'EtapeNonAtteinte'
  readonly etapeRequise: InscriptionStep
  readonly etapeCourante: InscriptionStep
}

export const EtapeNonAtteinte = (
  etapeRequise: InscriptionStep,
  etapeCourante: InscriptionStep,
): EtapeNonAtteinte => ({
  _tag: 'EtapeNonAtteinte',
  etapeRequise,
  etapeCourante,
})
