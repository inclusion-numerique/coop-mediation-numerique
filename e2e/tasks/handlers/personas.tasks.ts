import { prismaClient } from '@/configuration/prisma'
import { semerLesCrasDeDemonstration } from '@/features/activites/fixtures/semer-les-cras-de-demonstration'
import { referencesDesBeneficiaires } from '@/features/beneficiaire/fixtures/beneficiaires-de-demonstration'
import { semerLesBeneficiairesDeDemonstration } from '@/features/beneficiaire/fixtures/semer-les-beneficiaires-de-demonstration'
import { semerLesEmployeusesDeDemonstration } from '@/features/employeuse/fixtures/employeuses-de-demonstration'
import { semerLesCoordinationsDeDemonstration } from '@/features/equipe/fixtures/semer-les-coordinations-de-demonstration'
import { semerLesActivitesDuPersonaDansLesLieux } from '@/features/lieux-activite/fixtures/activites-dans-les-lieux-de-demonstration'
import {
  mediateque,
  semerLesLieuxDeDemonstration,
  structureEmployeuse,
} from '@/features/lieux-activite/fixtures/lieux-de-demonstration'
import {
  mediateursDesPersonas,
  personas,
} from '@/features/utilisateurs/fixtures/personas'
import { seedPersonnesMain } from '@/features/utilisateurs/fixtures/personnes-main-conseiller-numerique'
import { reinitialiserUnUtilisateur } from '@/features/utilisateurs/fixtures/reinitialiser-un-utilisateur'
import { enSerie } from '@/libraries/fixtures'

const demonstration = {
  employeuse: { structureCoopId: structureEmployeuse.id },
  semerLesActivitesDansLesLieux: semerLesActivitesDuPersonaDansLesLieux(
    mediateursDesPersonas,
  ),
  semerLesBeneficiaires: semerLesBeneficiairesDeDemonstration(
    mediateursDesPersonas,
  ),
  semerLesCras: semerLesCrasDeDemonstration({
    mediateurs: mediateursDesPersonas,
    beneficiaires: referencesDesBeneficiaires,
    lieux: { mediateque },
  }),
  semerLesCoordinations: semerLesCoordinationsDeDemonstration,
}

export const preparerLesPersonas = async ({
  ids,
}: {
  ids: readonly string[]
}) => {
  await semerLesLieuxDeDemonstration(prismaClient)
  await semerLesEmployeusesDeDemonstration(prismaClient, {
    structureEmployeuse,
    mediateque,
  })
  await enSerie(ids, (id) =>
    reinitialiserUnUtilisateur({ id }, demonstration, false),
  )
  await seedPersonnesMain(
    prismaClient,
    demonstration.employeuse,
    personas.filter(({ id }) => ids.includes(id)),
  )

  return { done: true }
}
