import type { SynchroniserLaPersonne } from '@/features/utilisateurs/implementations/prisma/registre-des-personnes.mutation'
import { fusionnerDesComptes } from '../domain/fusionner-des-comptes'
import { retirerLaSourceDesListes } from './brevo/retirer-la-source-des-listes.mutation'
import { comptesAFusionner } from './prisma/comptes-a-fusionner.query'
import { fusionner } from './prisma/fusionner.mutation'

export const fusionnerDesComptesAvec = (
  synchroniserLaPersonne: SynchroniserLaPersonne,
) =>
  fusionnerDesComptes({
    lireLesComptesAFusionner: comptesAFusionner,
    fusionner: fusionner(synchroniserLaPersonne),
    retirerLaSourceDesListes,
  })
