export type ALeRoleCoordinateur = (utilisateurId: string) => Promise<boolean>

export type CoordonneDansLeDispositif = (
  utilisateurId: string,
) => Promise<boolean>

export type CreerLeRoleCoordinateur = (utilisateurId: string) => Promise<void>

export type GarantirLeRoleCoordinateurDuDispositifPorts = {
  readonly aLeRoleCoordinateur: ALeRoleCoordinateur
  readonly coordonneDansLeDispositif: CoordonneDansLeDispositif
  readonly creerLeRoleCoordinateur: CreerLeRoleCoordinateur
}
