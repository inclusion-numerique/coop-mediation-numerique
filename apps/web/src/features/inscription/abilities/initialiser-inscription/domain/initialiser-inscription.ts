import type {
  InscriptionStep,
  UserId,
} from '@app/web/features/inscription/domain'
import { etapeApresInitialisation } from './etape-apres-initialisation'
import type { InitialiserInscriptionPorts } from './ports'

export type InitialiserInscription = (
  input: { readonly userId: UserId },
  ports: InitialiserInscriptionPorts,
) => Promise<{ readonly nextStep: InscriptionStep | null }>

/**
 * Orchestration pure de l'initialisation : applique ce que dit le dispositif,
 * tente l'import structure via SIRET, relit l'état, puis dérive l'étape
 * suivante. Les effets sont injectés (ports), la décision reste testable.
 *
 * L'utilisateur suffit désormais à identifier la personne : le dispositif se lit
 * dans `main` par `coop_id`, là où l'API Dataspace se cherchait par courriel.
 */
export const initialiserInscription: InitialiserInscription = async (
  { userId },
  {
    appliquerDispositif,
    importerStructureDepuisSiret,
    lireEtatPourEtapeSuivante,
  },
) => {
  const dispositif = await appliquerDispositif({ userId })
  await importerStructureDepuisSiret(userId)
  const etat = await lireEtatPourEtapeSuivante(userId)

  return {
    nextStep: etapeApresInitialisation({
      connuDuDispositif: dispositif.connue,
      profil: etat.profil,
      hasLieuxActivite: etat.hasLieuxActivite,
      isConseillerNumerique: dispositif.estConseillerNumerique,
    }),
  }
}
