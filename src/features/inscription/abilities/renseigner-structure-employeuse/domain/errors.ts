import type {
  InscriptionDejaValidee,
  InscriptionIntrouvable,
  ProfilNonChoisi,
  UtilisateurId,
} from '@/features/inscription/domain'

export type EmployeuseNonRattachee<Cause> = {
  readonly _tag: 'EmployeuseNonRattachee'
  readonly userId: UtilisateurId
  readonly cause: Cause
}

export const EmployeuseNonRattachee = <Cause>(
  userId: UtilisateurId,
  cause: Cause,
): EmployeuseNonRattachee<Cause> => ({
  _tag: 'EmployeuseNonRattachee',
  userId,
  cause,
})

export type EchecDeRenseignerStructureEmployeuse<Cause> =
  | InscriptionIntrouvable
  | ProfilNonChoisi
  | InscriptionDejaValidee
  | EmployeuseNonRattachee<Cause>
