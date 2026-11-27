import type {
  DispositifPersonne,
  ProfilInscription,
  UtilisateurId,
} from '@/features/inscription/domain'
import type { Siret } from '@/libraries/insee'
import type { Result } from '@/libraries/result'

export type LireLeDispositif = (
  userId: UtilisateurId,
) => Promise<DispositifPersonne>

export type EnregistrerLeProfil = (input: {
  readonly userId: UtilisateurId
  readonly profil: ProfilInscription
}) => Promise<void>

export type GarantieDuRoleCoordinateur =
  | { readonly _tag: 'DejaCoordinateur' }
  | { readonly _tag: 'HorsDuDispositif' }
  | { readonly _tag: 'RoleCree' }

type GarantirLeRoleCoordinateur = (entree: {
  readonly utilisateurId: UtilisateurId
}) => Promise<Result<GarantieDuRoleCoordinateur, never>>

export type GarantirLeMediateur = (userId: UtilisateurId) => Promise<void>

export type LireLeSiretARattacher = (userId: UtilisateurId) => Promise<{
  readonly siret: Siret | null
  readonly aUneEmployeuse: boolean
}>

export type RattacherDepuisSiret<Rattachement, Echec> = (input: {
  readonly userId: UtilisateurId
  readonly siret: Siret
}) => Promise<Result<Rattachement, Echec>>

export type LireEtatPourEtapeSuivante = (userId: UtilisateurId) => Promise<{
  readonly profil: ProfilInscription | null
  readonly hasLieuxActivite: boolean
}>

export type InitialiserInscriptionPorts<Rattachement, Echec> = {
  readonly lireLeDispositif: LireLeDispositif
  readonly enregistrerLeProfil: EnregistrerLeProfil
  readonly garantirLeRoleCoordinateur: GarantirLeRoleCoordinateur
  readonly garantirLeMediateur: GarantirLeMediateur
  readonly lireLeSiretARattacher: LireLeSiretARattacher
  readonly rattacherDepuisSiret: RattacherDepuisSiret<Rattachement, Echec>
  readonly lireEtatPourEtapeSuivante: LireEtatPourEtapeSuivante
}
