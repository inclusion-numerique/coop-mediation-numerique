import type {
  LieuIntrouvable,
  UtilisateurId,
} from '@/features/inscription/domain'
import type { EmployeuseId } from './employeuse-id'

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
  readonly employeuseId: EmployeuseId
}

export const AdresseNonReconnue = (
  employeuseId: EmployeuseId,
): AdresseNonReconnue => ({
  _tag: 'AdresseNonReconnue',
  employeuseId,
})

export type ServiceAdresseIndisponible = {
  readonly _tag: 'ServiceAdresseIndisponible'
  readonly employeuseId: EmployeuseId
}

export const ServiceAdresseIndisponible = (
  employeuseId: EmployeuseId,
): ServiceAdresseIndisponible => ({
  _tag: 'ServiceAdresseIndisponible',
  employeuseId,
})

export type EmployeuseSansDenomination = {
  readonly _tag: 'EmployeuseSansDenomination'
  readonly employeuseId: EmployeuseId
}

export const EmployeuseSansDenomination = (
  employeuseId: EmployeuseId,
): EmployeuseSansDenomination => ({
  _tag: 'EmployeuseSansDenomination',
  employeuseId,
})

export type EchecDAjouterStructureEmployeuseEnLieu =
  | EmployeuseIntrouvable
  | EmployeuseSansDenomination
  | AdresseNonReconnue
  | ServiceAdresseIndisponible
  | LieuIntrouvable
