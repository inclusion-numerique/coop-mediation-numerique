import {
  type GarantirLeRoleCoordinateur,
  initialiserInscription,
  type RattacherDepuisSiret,
} from '@/features/inscription/abilities/initialiser-inscription/domain'
import type { InscriptionStep, UserId } from '@/features/inscription/domain'
import type { SynchroniserLaPersonne } from '@/features/inscription/implementations/prisma/synchroniser-la-personne'
import { appliquerDispositif } from './prisma/appliquer-dispositif'
import { importerStructureDepuisSiret } from './prisma/importer-structure-depuis-siret'
import { lireEtatPourEtapeSuivante } from './prisma/lire-etat-pour-etape-suivante'

/** Initialise l'inscription avec les ports infra réels. */
export const initialiserInscriptionAvecInfra = (
  input: { readonly userId: UserId },
  {
    rattacherDepuisSiret,
    garantirLeRoleCoordinateur,
    synchroniserLaPersonne,
  }: {
    readonly rattacherDepuisSiret: RattacherDepuisSiret
    readonly garantirLeRoleCoordinateur: GarantirLeRoleCoordinateur
    readonly synchroniserLaPersonne: SynchroniserLaPersonne
  },
): Promise<{ readonly nextStep: InscriptionStep | null }> =>
  initialiserInscription(input, {
    appliquerDispositif: appliquerDispositif(
      garantirLeRoleCoordinateur,
      synchroniserLaPersonne,
    ),
    importerStructureDepuisSiret:
      importerStructureDepuisSiret(rattacherDepuisSiret),
    lireEtatPourEtapeSuivante,
  })
