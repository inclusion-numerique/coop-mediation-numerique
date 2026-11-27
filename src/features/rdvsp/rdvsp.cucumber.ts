import { After, Before, BeforeAll, setDefaultTimeout } from '@cucumber/cucumber'
import { prismaClient } from '@/configuration/prisma'
import type { Prisma } from '@/generated/prisma/client'
import { UtilisateurCoopId } from './domain/identifiants/utilisateur-coop-id'
import { EmailExterne } from './domain/identite'

setDefaultTimeout(60_000)

export const testUtilisateurId = UtilisateurCoopId(
  'e10e5c5f-4713-4a14-bba8-3b6051b3b4a2',
)
export const testMediateurId = 'dac49361-bef9-4f9b-a774-387e2e4bf664'

const semerLeMediateurDeTest = async (
  utilisateurId: string,
  mediateurId: string,
  courriel: string,
) => {
  await prismaClient.user.upsert({
    where: { id: utilisateurId },
    create: { id: utilisateurId, email: courriel, isFixture: true },
    update: {},
  })
  await prismaClient.mediateur.upsert({
    where: { id: mediateurId },
    create: { id: mediateurId, userId: utilisateurId },
    update: {},
  })
}

export const ID_TEST = {
  compte: 9_900_000,
  rdv: 9_910_000,
  organisation: 9_920_000,
  usager: 9_930_000,
  participation: 9_940_000,
} as const

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

export const seedRdv = async ({
  id,
  rdvAccountId,
  organisationId = id,
  motifId = null,
  status = 'unknown',
  compteRenduRegle = false,
  debut = new Date('2026-08-16T09:00:00.000Z'),
  dureeEnMinutes = 60,
}: {
  id: number
  rdvAccountId: number
  organisationId?: number
  motifId?: number | null
  status?: 'unknown' | 'seen' | 'excused' | 'revoked' | 'noshow'
  compteRenduRegle?: boolean
  debut?: Date
  dureeEnMinutes?: number
}): Promise<number> => {
  await seedOrganisation({ id: organisationId })

  await prismaClient.rdv.create({
    data: {
      id,
      uuid: `00000000-0000-4000-8000-${String(id).padStart(12, '0')}`,
      rdvAccountId,
      organisationId,
      motifId,
      address: '12 rue de la Paix, 75002 Paris',
      startsAt: debut,
      endsAt: new Date(debut.getTime() + dureeEnMinutes * 60_000),
      durationInMin: dureeEnMinutes,
      status,
      compteRenduRegle,
      collectif: false,
      usersCount: 0,
      urlForAgents: `https://rdv.anct.gouv.fr/admin/rdvs/${id}`,
      rawData: {},
    },
  })
  rdvsSuivis.add(id)

  return id
}

const beneficiairesSuivis = new Set<string>()
const usagersSuivis = new Set<number>()

export const suivreUsagerRdv = (usagerId: number): void => {
  usagersSuivis.add(usagerId)
}

export const seedBeneficiaire = async ({
  mediateurId = testMediateurId,
  ...data
}: Partial<Prisma.BeneficiaireUncheckedCreateInput> & {
  mediateurId?: string
} = {}): Promise<string> => {
  const beneficiaire = await prismaClient.beneficiaire.create({
    data: { anonyme: false, ...data, mediateurId },
    select: { id: true },
  })
  beneficiairesSuivis.add(beneficiaire.id)

  return beneficiaire.id
}

const mediateursSuivis = new Set<string>()

export const seedAutreMediateur = async (): Promise<string> => {
  const utilisateur = await prismaClient.user.create({
    data: {
      email: `autre-mediateur-${mediateursSuivis.size}-${Date.now()}@rdvsp.test`,
      isFixture: true,
    },
    select: { id: true },
  })
  utilisateursSuivis.add(utilisateur.id)

  const mediateur = await prismaClient.mediateur.create({
    data: { userId: utilisateur.id },
    select: { id: true },
  })
  mediateursSuivis.add(mediateur.id)

  return mediateur.id
}

export const seedUsagerRdv = async (id: number): Promise<number> => {
  await prismaClient.rdvUser.upsert({
    where: { id },
    create: {
      id,
      firstName: 'Usager',
      lastName: 'RDV',
      notifyByEmail: false,
      notifyBySms: false,
    },
    update: {},
  })
  usagersSuivis.add(id)

  return id
}

export const supprimerCompteRdvDuMediateur = async (): Promise<void> => {
  await prismaClient.rdvAccount.deleteMany({
    where: { userId: testUtilisateurId },
  })
}

export const beneficiaireEnBase = async (id: string) =>
  await prismaClient.beneficiaire.findUnique({
    where: { id },
    select: { id: true, rdvUserId: true, prenom: true, nom: true },
  })

export const seedOrganisation = async ({
  id,
  nom = `Organisation ${id}`,
}: {
  id: number
  nom?: string
}): Promise<number> => {
  await prismaClient.rdvOrganisation.upsert({
    where: { id },
    create: { id, name: nom },
    update: { name: nom },
  })
  organisationsSuivies.add(id)

  return id
}

export const seedMotif = async ({
  id,
  organisationId,
  nom = `Motif ${id}`,
}: {
  id: number
  organisationId: number
  nom?: string
}): Promise<number> => {
  await seedOrganisation({ id: organisationId })
  await prismaClient.rdvMotif.upsert({
    where: { id },
    create: {
      id,
      name: nom,
      organisationId,
      collectif: false,
      followUp: false,
    },
    update: { name: nom },
  })

  return id
}

export const seedRattachement = async ({
  agentId,
  organisationId,
}: {
  agentId: number
  organisationId: number
}): Promise<void> => {
  await prismaClient.rdvAccountOrganisation.create({
    data: { accountId: agentId, organisationId },
  })
}

export const organisationEnBase = async (id: number) =>
  await prismaClient.rdvOrganisation.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, phoneNumber: true },
  })

export const rattachementsDuCompte = async (
  agentId: number,
): Promise<number[]> =>
  (
    await prismaClient.rdvAccountOrganisation.findMany({
      where: { accountId: agentId },
      select: { organisationId: true },
    })
  ).map(({ organisationId }) => organisationId)

export const seedParticipation = async ({
  id,
  rdvId,
  usagerId,
  status = 'seen',
}: {
  id: number
  rdvId: number
  usagerId: number
  status?: 'unknown' | 'seen' | 'excused' | 'revoked' | 'noshow'
}): Promise<number> => {
  await seedUsagerRdv(usagerId)

  await prismaClient.rdvParticipation.create({
    data: {
      id,
      rdvId,
      userId: usagerId,
      status,
      sendReminderNotification: false,
      sendLifecycleNotifications: false,
    },
  })

  return id
}

export const rdvEnBase = async (rdvId: number) =>
  await prismaClient.rdv.findUnique({
    where: { id: rdvId },
    select: {
      id: true,
      status: true,
      compteRenduRegle: true,
      rdvAccountId: true,
    },
  })

BeforeAll({ timeout: 120_000 }, async () => {
  await semerLeMediateurDeTest(
    testUtilisateurId,
    testMediateurId,
    'rdvsp-cucumber@test.local',
  )
})

Before(async () => {
  comptesSuivis.clear()
  organisationsSuivies.clear()
  rdvsSuivis.clear()
  utilisateursSuivis.clear()
  beneficiairesSuivis.clear()
  usagersSuivis.clear()
  mediateursSuivis.clear()
  await prismaClient.rdvAccount.deleteMany({
    where: { userId: testUtilisateurId },
  })
})

After(async () => {
  await prismaClient.beneficiaire.deleteMany({
    where: {
      OR: [
        { id: { in: [...beneficiairesSuivis] } },
        { rdvUserId: { in: [...usagersSuivis] } },
      ],
    },
  })
  await prismaClient.rdv.deleteMany({
    where: {
      OR: [
        { id: { in: [...rdvsSuivis] } },
        { rdvAccountId: { in: [...comptesSuivis] } },
      ],
    },
  })
  await prismaClient.rdvUser.deleteMany({
    where: { id: { in: [...usagersSuivis] } },
  })
  await prismaClient.rdvAccountOrganisation.deleteMany({
    where: {
      OR: [
        { accountId: { in: [...comptesSuivis] } },
        { organisationId: { in: [...organisationsSuivies] } },
      ],
    },
  })
  await prismaClient.rdvSyncLog.deleteMany({
    where: { rdvAccountId: { in: [...comptesSuivis] } },
  })
  await prismaClient.rdvAccount.deleteMany({
    where: {
      OR: [{ id: { in: [...comptesSuivis] } }, { userId: testUtilisateurId }],
    },
  })
  await prismaClient.rdvMotif.deleteMany({
    where: { organisationId: { in: [...organisationsSuivies] } },
  })
  await prismaClient.rdvLieu.deleteMany({
    where: { organisationId: { in: [...organisationsSuivies] } },
  })
  await prismaClient.rdvOrganisation.deleteMany({
    where: { id: { in: [...organisationsSuivies] } },
  })
  await prismaClient.mediateur.deleteMany({
    where: { id: { in: [...mediateursSuivis] } },
  })
  await prismaClient.user.deleteMany({
    where: { id: { in: [...utilisateursSuivis] } },
  })
})

export const seedParticipationRdv = async ({
  id,
  rdvId,
  usagerId,
}: {
  id: number
  rdvId: number
  usagerId: number
}): Promise<number> => {
  await prismaClient.rdvParticipation.create({
    data: {
      id,
      rdvId,
      userId: usagerId,
      sendLifecycleNotifications: false,
      sendReminderNotification: false,
      status: 'unknown',
    },
  })

  return id
}
