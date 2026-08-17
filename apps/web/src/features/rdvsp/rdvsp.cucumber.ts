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

const organisationsSuivies = new Set<number>()
const rdvsSuivis = new Set<number>()
const utilisateursSuivis = new Set<string>()

/**
 * Compte RDV appartenant à un autre médiateur. `rdv_accounts.user_id` étant
 * unique, un second compte suppose un second utilisateur : c'est précisément la
 * situation que les scénarios d'autorisation doivent reproduire.
 */
export const seedCompteRdvAutreMediateur = async ({
  id,
}: {
  id: number
}): Promise<number> => {
  const utilisateur = await prismaClient.user.create({
    data: { email: `autre-mediateur-${id}@rdvsp.test`, isFixture: true },
    select: { id: true },
  })
  utilisateursSuivis.add(utilisateur.id)

  await prismaClient.rdvAccount.create({
    data: { id, userId: utilisateur.id, accessToken: 'jeton-acces' },
  })
  suivreCompteRdv(id)

  return id
}

/**
 * Crée un rendez-vous de test et son organisation. Les valeurs non signifiantes
 * pour le scénario sont fixées ici une fois : ce que le scénario décrit ne doit
 * porter que ce qui compte pour lui.
 */
export const seedRdv = async ({
  id,
  rdvAccountId,
  organisationId = id,
  status = 'unknown',
  craDeclined = false,
}: {
  id: number
  rdvAccountId: number
  organisationId?: number
  status?: 'unknown' | 'seen' | 'excused' | 'revoked' | 'noshow'
  craDeclined?: boolean
}): Promise<number> => {
  await prismaClient.rdvOrganisation.upsert({
    where: { id: organisationId },
    create: { id: organisationId, name: `Organisation ${organisationId}` },
    update: {},
  })
  organisationsSuivies.add(organisationId)

  await prismaClient.rdv.create({
    data: {
      id,
      uuid: `00000000-0000-4000-8000-${String(id).padStart(12, '0')}`,
      rdvAccountId,
      organisationId,
      address: '12 rue de la Paix, 75002 Paris',
      startsAt: new Date('2026-08-16T09:00:00.000Z'),
      endsAt: new Date('2026-08-16T10:00:00.000Z'),
      durationInMin: 60,
      status,
      craDeclined,
      collectif: false,
      usersCount: 0,
      urlForAgents: `https://rdv.anct.gouv.fr/admin/rdvs/${id}`,
      rawData: {},
    },
  })
  rdvsSuivis.add(id)

  return id
}

export const rdvEnBase = async (rdvId: number) =>
  await prismaClient.rdv.findUnique({
    where: { id: rdvId },
    select: { id: true, status: true, craDeclined: true, rdvAccountId: true },
  })

BeforeAll({ timeout: 120_000 }, async () => {
  await seedStructures(prismaClient)
  await resetFixtureUser(mediateurAvecActivite, false)
})

Before(async () => {
  comptesSuivis.clear()
  organisationsSuivies.clear()
  rdvsSuivis.clear()
  utilisateursSuivis.clear()
  // Les scénarios écrivent tous sur le même utilisateur de fixture : on repart
  // d'un utilisateur sans compte RDV, sinon la recherche « par agent ou par
  // utilisateur » retrouverait le compte d'un scénario précédent.
  await prismaClient.rdvAccount.deleteMany({
    where: { userId: testUtilisateurId },
  })
})

// Les rendez-vous référencent le compte et l'organisation : ils partent d'abord,
// sans quoi les suppressions suivantes butent sur les clés étrangères.
After(async () => {
  await prismaClient.rdv.deleteMany({ where: { id: { in: [...rdvsSuivis] } } })
  await prismaClient.rdvAccount.deleteMany({
    where: {
      OR: [{ id: { in: [...comptesSuivis] } }, { userId: testUtilisateurId }],
    },
  })
  await prismaClient.rdvOrganisation.deleteMany({
    where: { id: { in: [...organisationsSuivies] } },
  })
  await prismaClient.user.deleteMany({
    where: { id: { in: [...utilisateursSuivis] } },
  })
})
