import { initialiserInscription } from '@app/web/features/inscription/abilities/initialiser-inscription/domain'
import type {
  InscriptionStep,
  UserId,
} from '@app/web/features/inscription/domain'
import { appliquerDispositif } from './prisma/appliquer-dispositif'
import { importerStructureDepuisSiret } from './prisma/importer-structure-depuis-siret'
import { lireEtatPourEtapeSuivante } from './prisma/lire-etat-pour-etape-suivante'

/** Initialise l'inscription avec les ports infra réels. */
export const initialiserInscriptionAvecInfra = (input: {
  readonly userId: UserId
}): Promise<{ readonly nextStep: InscriptionStep | null }> =>
  initialiserInscription(input, {
    appliquerDispositif,
    importerStructureDepuisSiret,
    lireEtatPourEtapeSuivante,
  })
