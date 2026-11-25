import { compterLesInscrits } from '@/features/utilisateurs/implementations/prisma/compter-les-inscrits.query'
import { noterLaRelance } from '@/features/utilisateurs/implementations/prisma/noter-la-relance.mutation'
import type { RelancerLesInscritsInactifsPorts } from '../domain'
import { relancerLesInscritsInactifs } from '../domain/relancer-les-inscrits-inactifs'
import { relancesParCourriel } from './email/relances-par-courriel.adapter'
import { inscritsSansProduction } from './prisma/inscrits-sans-production.query'

export const lancerLesRelancesDesInscrits = async (
  maintenant: Date,
  supprimerLeCompte: RelancerLesInscritsInactifsPorts['supprimerLeCompte'],
) =>
  relancerLesInscritsInactifs({
    maintenant,
    ports: {
      ...relancesParCourriel(await compterLesInscrits()),
      lireLesComptesARelancer: inscritsSansProduction,
      noterLaRelance: noterLaRelance('Nouveau'),
      supprimerLeCompte,
    },
  })
