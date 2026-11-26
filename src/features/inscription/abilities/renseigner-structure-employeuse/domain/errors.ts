import type {
  InscriptionDejaValidee,
  InscriptionIntrouvable,
  ProfilNonChoisi,
  UtilisateurId,
} from '@/features/inscription/domain'

export type EmployeuseNonRattachee = {
  readonly _tag: 'EmployeuseNonRattachee'
  readonly userId: UtilisateurId
}

export const EmployeuseNonRattachee = (
  userId: UtilisateurId,
): EmployeuseNonRattachee => ({
  _tag: 'EmployeuseNonRattachee',
  userId,
})

export type EchecDeRenseignerStructureEmployeuse =
  | InscriptionIntrouvable
  | ProfilNonChoisi
  | InscriptionDejaValidee
  | EmployeuseNonRattachee
