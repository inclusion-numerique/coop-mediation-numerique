import type {
  ProfilInscription,
  UtilisateurId,
} from '@/features/inscription/domain'
import type { DispositifInscription } from './dispositif-inscription'

/**
 * Lit le dispositif dans `main` et applique ce qui en découle — profil
 * d'inscription, rôle coordinateur, création du médiateur — puis rend la vue
 * domaine. L'utilisateur inconnu du dispositif rend `connue: false` plutôt que
 * `null` : l'absence est un cas nominal du parcours, pas un défaut de réponse.
 */
export type AppliquerDispositif = (input: {
  readonly userId: UtilisateurId
}) => Promise<DispositifInscription>

/** Crée la structure employeuse depuis le SIRET de l'utilisateur si applicable. */
export type ImporterStructureDepuisSiret = (
  userId: UtilisateurId,
) => Promise<void>

export type RattacherDepuisSiret = (input: {
  readonly userId: UtilisateurId
  readonly siret: string
}) => Promise<unknown>

export type GarantirLeRoleCoordinateur = (
  userId: UtilisateurId,
) => Promise<unknown>

/** État de l'utilisateur nécessaire pour déterminer l'étape suivante. */
export type LireEtatPourEtapeSuivante = (userId: UtilisateurId) => Promise<{
  readonly profil: ProfilInscription | null
  readonly hasLieuxActivite: boolean
}>

export type InitialiserInscriptionPorts = {
  readonly appliquerDispositif: AppliquerDispositif
  readonly importerStructureDepuisSiret: ImporterStructureDepuisSiret
  readonly lireEtatPourEtapeSuivante: LireEtatPourEtapeSuivante
}
