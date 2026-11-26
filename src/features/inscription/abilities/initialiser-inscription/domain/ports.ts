import type {
  DispositifPersonne,
  ProfilInscription,
  UtilisateurId,
} from '@/features/inscription/domain'

export type LireLeDispositif = (
  userId: UtilisateurId,
) => Promise<DispositifPersonne>

export type EnregistrerLeProfil = (input: {
  readonly userId: UtilisateurId
  readonly profil: ProfilInscription
}) => Promise<void>

export type GarantirLeRoleCoordinateur = (
  userId: UtilisateurId,
) => Promise<unknown>

export type GarantirLeMediateur = (userId: UtilisateurId) => Promise<void>

export type LireLeSiretARattacher = (userId: UtilisateurId) => Promise<{
  readonly siret: string | null
  readonly aUneEmployeuse: boolean
}>

export type RattacherDepuisSiret = (input: {
  readonly userId: UtilisateurId
  readonly siret: string
}) => Promise<unknown>

export type LireEtatPourEtapeSuivante = (userId: UtilisateurId) => Promise<{
  readonly profil: ProfilInscription | null
  readonly hasLieuxActivite: boolean
}>

export type InitialiserInscriptionPorts = {
  readonly lireLeDispositif: LireLeDispositif
  readonly enregistrerLeProfil: EnregistrerLeProfil
  readonly garantirLeRoleCoordinateur: GarantirLeRoleCoordinateur
  readonly garantirLeMediateur: GarantirLeMediateur
  readonly lireLeSiretARattacher: LireLeSiretARattacher
  readonly rattacherDepuisSiret: RattacherDepuisSiret
  readonly lireEtatPourEtapeSuivante: LireEtatPourEtapeSuivante
}
