import type { UtilisateurId } from '@/features/inscription/domain'

export type EmployeuseIntrouvable = {
  readonly _tag: 'EmployeuseIntrouvable'
  readonly userId: UtilisateurId
}

export const EmployeuseIntrouvable = (
  userId: UtilisateurId,
): EmployeuseIntrouvable => ({
  _tag: 'EmployeuseIntrouvable',
  userId,
})

export type AdresseNonReconnue = {
  readonly _tag: 'AdresseNonReconnue'
  readonly employeuseId: number
}

export const AdresseNonReconnue = (
  employeuseId: number,
): AdresseNonReconnue => ({
  _tag: 'AdresseNonReconnue',
  employeuseId,
})

export type ServiceAdresseIndisponible = {
  readonly _tag: 'ServiceAdresseIndisponible'
  readonly employeuseId: number
}

export const ServiceAdresseIndisponible = (
  employeuseId: number,
): ServiceAdresseIndisponible => ({
  _tag: 'ServiceAdresseIndisponible',
  employeuseId,
})

export type EchecDAjouterStructureEmployeuseEnLieu =
  | EmployeuseIntrouvable
  | AdresseNonReconnue
  | ServiceAdresseIndisponible
