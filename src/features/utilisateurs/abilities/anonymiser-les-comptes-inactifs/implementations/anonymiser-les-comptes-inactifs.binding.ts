import { anonymiserLesComptesInactifs } from '../domain/anonymiser-les-comptes-inactifs'
import type { AnonymiserLesComptesInactifsPorts } from '../domain/ports'
import { avertirDeLaSuppression } from './email/avertir-de-la-suppression.mutation'
import { lireLesComptesAExaminer } from './prisma/comptes-a-examiner.query'
import { noterLAvertissement } from './prisma/noter-l-avertissement.mutation'

export const anonymiserLesComptesInactifsAvec = (
  supprimerLeCompte: AnonymiserLesComptesInactifsPorts['supprimerLeCompte'],
) =>
  anonymiserLesComptesInactifs({
    avertirDeLaSuppression,
    supprimerLeCompte,
    lireLesComptesAExaminer,
    noterLAvertissement,
  })
