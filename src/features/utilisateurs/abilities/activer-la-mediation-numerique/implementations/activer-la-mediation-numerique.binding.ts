import type { SynchroniserLaPersonne } from '@/features/utilisateurs/implementations/prisma/registre-des-personnes.mutation'
import { activerLaMediationNumerique } from '../domain/activer-la-mediation-numerique'
import { inscrireALaListeDeDiffusion } from './brevo/inscrire-a-la-liste-de-diffusion.mutation'
import { activer, compteQuiActive } from './prisma/activer.mutation'

export const activerLaMediationNumeriqueAvec = (
  synchroniserLaPersonne: SynchroniserLaPersonne,
) =>
  activerLaMediationNumerique({
    lireLeCompteQuiActive: compteQuiActive,
    activer: activer(synchroniserLaPersonne),
    inscrireALaListeDeDiffusion,
  })
