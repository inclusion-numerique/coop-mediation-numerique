import {
  type GarantirLeRoleCoordinateur,
  initialiserInscription,
  type RattacherDepuisSiret,
} from '@/features/inscription/abilities/initialiser-inscription/domain'
import type {
  EtapeDInscription,
  UtilisateurId,
} from '@/features/inscription/domain'
import type { SynchroniserLaPersonne } from '@/features/inscription/implementations/prisma/synchroniser-la-personne.mutation'
import { dispositifDepuisMain } from './dispositif-depuis-main.query'
import { enregistrerLeProfil } from './enregistrer-le-profil.mutation'
import { lireEtatPourEtapeSuivante } from './etat-pour-etape-suivante.query'
import { garantirLeMediateur } from './garantir-le-mediateur.mutation'
import { importerStructureDepuisSiret } from './importer-structure-depuis-siret.query'

/** Initialise l'inscription avec les ports infra réels. */
export const initialiserInscriptionAvecInfra = (
  input: { readonly userId: UtilisateurId },
  {
    rattacherDepuisSiret,
    garantirLeRoleCoordinateur,
    synchroniserLaPersonne,
  }: {
    readonly rattacherDepuisSiret: RattacherDepuisSiret
    readonly garantirLeRoleCoordinateur: GarantirLeRoleCoordinateur
    readonly synchroniserLaPersonne: SynchroniserLaPersonne
  },
): Promise<{ readonly nextStep: EtapeDInscription }> =>
  initialiserInscription(input, {
    lireLeDispositif: dispositifDepuisMain,
    enregistrerLeProfil,
    garantirLeRoleCoordinateur,
    garantirLeMediateur: garantirLeMediateur(synchroniserLaPersonne),
    importerStructureDepuisSiret:
      importerStructureDepuisSiret(rattacherDepuisSiret),
    lireEtatPourEtapeSuivante,
  })
