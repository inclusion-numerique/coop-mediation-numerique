import type {
  Email,
  ProfilInscription,
  UserId,
} from '@app/web/features/inscription/domain'
import type { DataspaceInscription } from './dataspace-inscription'

/**
 * Récupère et applique les effets Dataspace (profil, synchro structures,
 * import unique des lieux), et rend la vue domaine ; `null` si l'utilisateur
 * n'est pas connu du Dataspace (ou erreur API, traitée comme absence).
 */
export type SynchroniserDepuisDataspace = (input: {
  readonly userId: UserId
  readonly email: Email
}) => Promise<DataspaceInscription | null>

/** Crée la structure employeuse depuis le SIRET de l'utilisateur si applicable. */
export type ImporterStructureDepuisSiret = (userId: UserId) => Promise<void>

/** État de l'utilisateur nécessaire pour déterminer l'étape suivante. */
export type LireEtatPourEtapeSuivante = (userId: UserId) => Promise<{
  readonly profil: ProfilInscription | null
  readonly hasLieuxActivite: boolean
}>

export type InitialiserInscriptionPorts = {
  readonly synchroniserDepuisDataspace: SynchroniserDepuisDataspace
  readonly importerStructureDepuisSiret: ImporterStructureDepuisSiret
  readonly lireEtatPourEtapeSuivante: LireEtatPourEtapeSuivante
}
