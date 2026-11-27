import type { UtilisateurId } from '@/features/utilisateurs/domain'

type ALeRoleCoordinateur = (utilisateurId: UtilisateurId) => Promise<boolean>

type CoordonneDansLeDispositif = (
  utilisateurId: UtilisateurId,
) => Promise<boolean>

type CreerLeRoleCoordinateur = (utilisateurId: UtilisateurId) => Promise<void>

export type GarantirLeRoleCoordinateurDuDispositifPorts = {
  readonly aLeRoleCoordinateur: ALeRoleCoordinateur
  readonly coordonneDansLeDispositif: CoordonneDansLeDispositif
  readonly creerLeRoleCoordinateur: CreerLeRoleCoordinateur
}
