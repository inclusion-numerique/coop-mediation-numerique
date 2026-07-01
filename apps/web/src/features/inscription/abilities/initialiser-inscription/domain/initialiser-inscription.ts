import type {
  Email,
  InscriptionStep,
  UserId,
} from '@app/web/features/inscription/domain'
import { etapeApresInitialisation } from './etape-apres-initialisation'
import type { InitialiserInscriptionPorts } from './ports'

export type InitialiserInscription = (
  input: { readonly userId: UserId; readonly email: Email },
  ports: InitialiserInscriptionPorts,
) => Promise<{ readonly nextStep: InscriptionStep | null }>

/**
 * Orchestration pure de l'initialisation : applique les effets Dataspace, tente
 * l'import structure via SIRET, relit l'état, puis dérive l'étape suivante. Les
 * effets sont injectés (ports), la décision reste testable.
 */
export const initialiserInscription: InitialiserInscription = async (
  { userId, email },
  {
    synchroniserDepuisDataspace,
    importerStructureDepuisSiret,
    lireEtatPourEtapeSuivante,
  },
) => {
  const dataspace = await synchroniserDepuisDataspace({ userId, email })
  await importerStructureDepuisSiret(userId)
  const etat = await lireEtatPourEtapeSuivante(userId)

  return {
    nextStep: etapeApresInitialisation({
      hasDataspaceData: dataspace !== null,
      profil: etat.profil,
      hasLieuxActivite: etat.hasLieuxActivite,
      isConseillerNumerique: dataspace?.isConseillerNumerique ?? false,
    }),
  }
}
