import type {
  InscriptionDejaValidee,
  InscriptionIntrouvable,
  ProfilNonChoisi,
  UtilisateurId,
} from '@/features/inscription/domain'

export type EmployeuseIndisponible = {
  readonly _tag: 'EmployeuseIndisponible'
  readonly userId: UtilisateurId
}

export const EmployeuseIndisponible = (
  userId: UtilisateurId,
): EmployeuseIndisponible => ({
  _tag: 'EmployeuseIndisponible',
  userId,
})

export type EchecDeRenseignerStructureEmployeuse =
  | InscriptionIntrouvable
  | ProfilNonChoisi
  | InscriptionDejaValidee
  | EmployeuseIndisponible
