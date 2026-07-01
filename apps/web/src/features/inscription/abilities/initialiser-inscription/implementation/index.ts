import { initialiserInscription } from '@app/web/features/inscription/abilities/initialiser-inscription/domain'
import type {
  Email,
  InscriptionStep,
  UserId,
} from '@app/web/features/inscription/domain'
import { importerStructureDepuisSiret } from './prisma/importer-structure-depuis-siret'
import { lireEtatPourEtapeSuivante } from './prisma/lire-etat-pour-etape-suivante'
import { synchroniserDepuisDataspace } from './prisma/synchroniser-depuis-dataspace'

/** Initialise l'inscription avec les ports infra réels. */
export const initialiserInscriptionAvecInfra = (input: {
  readonly userId: UserId
  readonly email: Email
}): Promise<{ readonly nextStep: InscriptionStep | null }> =>
  initialiserInscription(input, {
    synchroniserDepuisDataspace,
    importerStructureDepuisSiret,
    lireEtatPourEtapeSuivante,
  })
