import type { SynchroniserLaPersonne } from '@/features/utilisateurs/implementations/prisma/registre-des-personnes.mutation'
import { createStopwatch } from '@/libraries/chronometre/stopwatch'
import { activerLaMediationNumerique } from '../domain/activer-la-mediation-numerique'
import { inscrireALaListeDeDiffusion } from './brevo/inscrire-a-la-liste-de-diffusion.mutation'
import { activer, compteQuiActive } from './prisma/activer.mutation'

export const activerLaMediationNumeriqueAvec =
  (synchroniserLaPersonne: SynchroniserLaPersonne) =>
  (utilisateurId: string) => {
    const chronometre = createStopwatch()

    return activerLaMediationNumerique({
      lireLeCompteQuiActive: compteQuiActive,
      activer: (activation) =>
        activer(synchroniserLaPersonne)({
          ...activation,
          duree: () => chronometre.stop().duration,
        }),
      inscrireALaListeDeDiffusion,
    })(utilisateurId)
  }
