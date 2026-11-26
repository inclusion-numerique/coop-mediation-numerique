import type { UtilisateurId } from '@/features/utilisateurs/domain'

export type ALeRoleCoordinateur = (
  utilisateurId: UtilisateurId,
) => Promise<boolean>

export type CoordonneDansLeDispositif = (
  utilisateurId: UtilisateurId,
) => Promise<boolean>

export type CreerLeRoleCoordinateur = (
  utilisateurId: UtilisateurId,
) => Promise<void>

export type GarantirLeRoleCoordinateurDuDispositifPorts = {
  readonly aLeRoleCoordinateur: ALeRoleCoordinateur
  readonly coordonneDansLeDispositif: CoordonneDansLeDispositif
  readonly creerLeRoleCoordinateur: CreerLeRoleCoordinateur
}
