import { resetFixtureUser } from '@app/fixtures/resetFixtureUser'
import { seedStructures } from '@app/fixtures/structures'
import {
  mediateurAvecActivite,
  mediateurAvecActiviteMediateurId,
} from '@app/fixtures/users/mediateurAvecActivite'
import { MediateurId } from '@app/web/features/beneficiaire/domain/mediateur-id'
import { prismaClient } from '@app/web/prismaClient'
import { After, Before, BeforeAll, setDefaultTimeout } from '@cucumber/cucumber'
import type { Prisma } from '@prisma/client'
import { v4 } from 'uuid'

setDefaultTimeout(60_000)

/**
 * Support Cucumber partagé pour la feature bénéficiaire.
 * Les hooks de cycle de vie vivent ici une seule fois ; les fichiers .steps.ts
 * ne définissent que Given/When/Then et s'appuient sur ces helpers, ce qui évite
 * les interférences entre hooks de plusieurs fichiers.
 */
export const testMediateurId = MediateurId(mediateurAvecActiviteMediateurId)

const trackedBeneficiaireIds = new Set<string>()

export const trackBeneficiaire = (id: string): void => {
  trackedBeneficiaireIds.add(id)
}

export const mediateurBeneficiairesCount = async (): Promise<number> =>
  (
    await prismaClient.mediateur.findUniqueOrThrow({
      where: { id: testMediateurId },
      select: { beneficiairesCount: true },
    })
  ).beneficiairesCount

let beneficiairesCountBefore = 0

export const beneficiairesCountAtScenarioStart = (): number =>
  beneficiairesCountBefore

/** Crée un bénéficiaire de test (suivi pour nettoyage) et incrémente le compteur. */
export const seedBeneficiaire = async (
  data: Partial<Prisma.BeneficiaireUncheckedCreateInput> = {},
): Promise<string> => {
  const id = data.id ?? v4()
  await prismaClient.$transaction([
    prismaClient.beneficiaire.create({
      data: { anonyme: false, ...data, id, mediateurId: testMediateurId },
    }),
    prismaClient.mediateur.update({
      where: { id: testMediateurId },
      data: { beneficiairesCount: { increment: 1 } },
    }),
  ])
  trackBeneficiaire(id)
  return id
}

BeforeAll({ timeout: 120_000 }, async () => {
  await seedStructures(prismaClient)
  await resetFixtureUser(mediateurAvecActivite, false)
})

Before(async () => {
  trackedBeneficiaireIds.clear()
  beneficiairesCountBefore = await mediateurBeneficiairesCount()
})

After(async () => {
  if (trackedBeneficiaireIds.size > 0) {
    await prismaClient.beneficiaire.deleteMany({
      where: { id: { in: [...trackedBeneficiaireIds] } },
    })
  }
  await prismaClient.mediateur.update({
    where: { id: testMediateurId },
    data: { beneficiairesCount: beneficiairesCountBefore },
  })
})
