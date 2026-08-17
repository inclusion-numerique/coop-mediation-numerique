import { resetFixtureUser } from '@app/fixtures/resetFixtureUser'
import { seedStructures } from '@app/fixtures/structures'
import {
  mediateurAvecActivite,
  mediateurAvecActiviteMediateurId,
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
export const testMediateurId = mediateurAvecActiviteMediateurId

/**
 * Plage réservée aux identifiants de test.
 *
 * Tous les identifiants de cette feature viennent de RDV Service Public, et la
 * base locale porte une copie de la production : un identifiant choisi au hasard
 * peut désigner une vraie ligne. Les créations lèveraient une erreur, mais les
 * upserts — organisations, usagers — écraseraient silencieusement la donnée. On
 * se place donc au-delà de tout ce que RDV Service Public a attribué à ce jour
 * (le maximum observé est de l'ordre du million).
 */
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
  debut = new Date('2026-08-16T09:00:00.000Z'),
  dureeEnMinutes = 60,
}: {
  id: number
  rdvAccountId: number
  organisationId?: number
  status?: 'unknown' | 'seen' | 'excused' | 'revoked' | 'noshow'
  craDeclined?: boolean
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
      address: '12 rue de la Paix, 75002 Paris',
      startsAt: debut,
      endsAt: new Date(debut.getTime() + dureeEnMinutes * 60_000),
      durationInMin: dureeEnMinutes,
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

const beneficiairesSuivis = new Set<string>()
const usagersSuivis = new Set<number>()

export const suivreUsagerRdv = (usagerId: number): void => {
  usagersSuivis.add(usagerId)
}

/**
 * Bénéficiaire de test rattaché au médiateur de fixture, ou à un autre lorsque
 * le scénario éprouve la propriété.
 */
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

/**
 * Médiateur distinct de celui de fixture, pour les scénarios de propriété.
 * `beneficiaires.mediateur_id` étant une clé étrangère, il faut un vrai
 * médiateur, donc un vrai utilisateur.
 */
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

/** Usager RDV Service Public préexistant, rattaché ensuite à un bénéficiaire. */
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

/**
 * Participation d'un usager à un rendez-vous. Pas de suivi propre : la relation
 * est en `onDelete: Cascade`, la suppression du rendez-vous l'emporte.
 */
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

export const beneficiairesDuMediateurAvecUsagers = async () =>
  await prismaClient.beneficiaire.findMany({
    where: {
      mediateurId: testMediateurId,
      rdvUserId: { in: [...usagersSuivis] },
    },
    select: { id: true, rdvUserId: true, prenom: true, nom: true },
  })

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
  beneficiairesSuivis.clear()
  usagersSuivis.clear()
  mediateursSuivis.clear()
  // Les scénarios écrivent tous sur le même utilisateur de fixture : on repart
  // d'un utilisateur sans compte RDV, sinon la recherche « par agent ou par
  // utilisateur » retrouverait le compte d'un scénario précédent.
  await prismaClient.rdvAccount.deleteMany({
    where: { userId: testUtilisateurId },
  })
})

// L'ordre suit les clés étrangères : bénéficiaires avant usagers, rendez-vous
// avant comptes et organisations, comptes avant utilisateurs.
After(async () => {
  // Les bénéficiaires créés par la fusion depuis un usager RDV ne passent pas par
  // `seedBeneficiaire` : on les retrouve par l'usager auquel ils sont rattachés.
  await prismaClient.beneficiaire.deleteMany({
    where: {
      OR: [
        { id: { in: [...beneficiairesSuivis] } },
        { rdvUserId: { in: [...usagersSuivis] } },
      ],
    },
  })
  // Les rendez-vous d'abord : leurs participations référencent les usagers et
  // disparaissent en cascade avec eux. L'inverse viole la clé étrangère et laisse
  // des résidus qui bloquent le `resetFixtureUser` de la session suivante.
  // Le nettoyage vise aussi tout rendez-vous rattaché à un compte de test, et pas
  // seulement ceux passés par `seedRdv` : la synchronisation en crée elle-même, et
  // ceux-là n'ont jamais été déclarés ici.
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
  // Les rattachements référencent le compte et l'organisation : ils partent avant
  // les deux.
  await prismaClient.rdvAccountOrganisation.deleteMany({
    where: {
      OR: [
        { accountId: { in: [...comptesSuivis] } },
        { organisationId: { in: [...organisationsSuivies] } },
      ],
    },
  })
  await prismaClient.rdvAccount.deleteMany({
    where: {
      OR: [{ id: { in: [...comptesSuivis] } }, { userId: testUtilisateurId }],
    },
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
