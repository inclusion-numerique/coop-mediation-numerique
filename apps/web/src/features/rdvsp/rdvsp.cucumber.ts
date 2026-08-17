import { resetFixtureUser } from '@app/fixtures/resetFixtureUser'
import { seedStructures } from '@app/fixtures/structures'
import {
  mediateurAvecActivite,
  mediateurAvecActiviteUserId,
} from '@app/fixtures/users/mediateurAvecActivite'
import { prismaClient } from '@app/web/prismaClient'
import { After, Before, BeforeAll, setDefaultTimeout } from '@cucumber/cucumber'
import type { Prisma } from '@prisma/client'
import { EmailExterne } from './domain/identite'
import { UtilisateurCoopId } from './domain/utilisateur-coop-id'

setDefaultTimeout(60_000)

/**
 * Support Cucumber partagé pour la feature RDV Service Public.
 * Les hooks de cycle de vie vivent ici une seule fois ; les fichiers .steps.ts
 * ne définissent que Given/When/Then et s'appuient sur ces helpers.
 */
export const testUtilisateurId = UtilisateurCoopId(mediateurAvecActiviteUserId)

const comptesSuivis = new Set<number>()

export const suivreCompteRdv = (agentId: number): void => {
  comptesSuivis.add(agentId)
}

export const emailUtilisateurDeTest = async (): Promise<EmailExterne> =>
  EmailExterne(
    (
      await prismaClient.user.findUniqueOrThrow({
        where: { id: testUtilisateurId },
        select: { email: true },
      })
    ).email,
  )

/** Crée un compte RDV de test, suivi pour nettoyage. */
export const seedCompteRdv = async (
  data: Partial<Prisma.RdvAccountUncheckedCreateInput> & { id: number },
): Promise<number> => {
  await prismaClient.rdvAccount.create({
    data: { userId: testUtilisateurId, ...data },
  })
  suivreCompteRdv(data.id)
  return data.id
}

export const compteRdvEnBase = async (agentId: number) =>
  await prismaClient.rdvAccount.findUnique({
    where: { id: agentId },
    include: { organisations: { select: { organisationId: true } } },
  })

BeforeAll({ timeout: 120_000 }, async () => {
  await seedStructures(prismaClient)
  await resetFixtureUser(mediateurAvecActivite, false)
})

Before(async () => {
  comptesSuivis.clear()
  // Les scénarios écrivent tous sur le même utilisateur de fixture : on repart
  // d'un utilisateur sans compte RDV, sinon la recherche « par agent ou par
  // utilisateur » retrouverait le compte d'un scénario précédent.
  await prismaClient.rdvAccount.deleteMany({
    where: { userId: testUtilisateurId },
  })
})

After(async () => {
  await prismaClient.rdvAccount.deleteMany({
    where: {
      OR: [{ id: { in: [...comptesSuivis] } }, { userId: testUtilisateurId }],
    },
  })
})
