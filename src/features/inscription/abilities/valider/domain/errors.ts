import type {
  InscriptionDejaValidee,
  ProfilNonChoisi,
  UtilisateurId,
} from '@/features/inscription/domain'

export type CompteDeRoleIntrouvable = {
  readonly _tag: 'CompteDeRoleIntrouvable'
  readonly userId: UtilisateurId
}

export const CompteDeRoleIntrouvable = (
  userId: UtilisateurId,
): CompteDeRoleIntrouvable => ({
  _tag: 'CompteDeRoleIntrouvable',
  userId,
})

export type EchecDeValider =
  | ProfilNonChoisi
  | InscriptionDejaValidee
  | CompteDeRoleIntrouvable
