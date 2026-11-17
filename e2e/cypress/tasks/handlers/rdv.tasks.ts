import { prismaClient } from '@app/web/prismaClient'

/**
 * Identifiant d'agent réservé aux tests, dans la même plage que les scénarios
 * Cucumber (`ID_TEST` dans `features/rdvsp/rdvsp.cucumber.ts`). Les identifiants
 * RDV Service Public sont attribués par eux, et une base restaurée en porte de
 * bien réels : on se place au-delà de tout ce qu'ils ont émis à ce jour, sans
 * quoi un test écraserait une vraie ligne.
 */
export const E2E_RDV_AGENT_ID = 9_900_101

/**
 * Lie un compte RDV Service Public à un utilisateur, sans passer par le parcours
 * OAuth : la liaison elle-même dépend d'un service tiers, alors que tout ce que
 * ces scénarios exercent — la gestion du compte une fois lié — n'en dépend pas.
 */
export const connectRdvAccountFor = async ({ email }: { email: string }) => {
  const user = await prismaClient.user.findUniqueOrThrow({
    where: { email },
    select: { id: true },
  })

  // Les rendez-vous référencent le compte : les laisser ferait échouer la
  // suppression en clé étrangère dès qu'un scénario précédent en a semé.
  await prismaClient.rdv.deleteMany({
    where: { rdvAccount: { userId: user.id } },
  })
  await prismaClient.rdvAccount.deleteMany({ where: { userId: user.id } })

  return prismaClient.rdvAccount.create({
    data: {
      id: E2E_RDV_AGENT_ID,
      userId: user.id,
      accessToken: 'e2e-jeton-acces',
      refreshToken: 'e2e-jeton-rafraichissement',
      expiresAt: new Date(Date.now() + 3_600_000),
      scope: 'write',
      syncFrom: new Date(),
    },
    select: { id: true },
  })
}

export const getRdvAccountFor = async ({ email }: { email: string }) => {
  const user = await prismaClient.user.findUniqueOrThrow({
    where: { email },
    select: { id: true },
  })

  return prismaClient.rdvAccount.findUnique({
    where: { userId: user.id },
    select: {
      id: true,
      deleted: true,
      accessToken: true,
      refreshToken: true,
      expiresAt: true,
      scope: true,
      error: true,
      syncFrom: true,
    },
  })
}

export const E2E_RDV_ORGANISATION_ID = 9_900_102

/** Statuts que RDV Service Public attribue à un rendez-vous. */
export type StatutRdvE2e = 'unknown' | 'seen' | 'excused' | 'revoked' | 'noshow'

/**
 * Sème des rendez-vous sur le compte lié, tels que la synchronisation les aurait
 * écrits.
 *
 * Les scénarios qui les consomment — compteurs de l'accueil, liste d'activités,
 * invitation à rédiger un compte rendu — lisent la base de La Coop, jamais
 * l'API : rien ne justifie de dépendre du tiers pour les éprouver. Les décalages
 * sont exprimés en jours relatifs pour qu'un scénario ne se périme pas.
 */
export const seedRdvsFor = async ({
  email,
  rdvs,
  voirRdvs = false,
}: {
  email: string
  /** Réglage d'affichage des rendez-vous dans la liste d'activités. */
  voirRdvs?: boolean
  rdvs: {
    id: number
    statut: StatutRdvE2e
    dansDesJours: number
    collectif?: boolean
    compteRenduRegle?: boolean
  }[]
}) => {
  const user = await prismaClient.user.findUniqueOrThrow({
    where: { email },
    select: { id: true },
  })
  const compte = await prismaClient.rdvAccount.findUniqueOrThrow({
    where: { userId: user.id },
    select: { id: true },
  })

  await prismaClient.rdvOrganisation.upsert({
    where: { id: E2E_RDV_ORGANISATION_ID },
    create: { id: E2E_RDV_ORGANISATION_ID, name: 'Organisation de test' },
    update: {},
  })

  await prismaClient.rdv.deleteMany({ where: { rdvAccountId: compte.id } })

  await prismaClient.rdvAccount.update({
    where: { id: compte.id },
    data: { includeRdvsInActivitesList: voirRdvs },
  })

  const maintenant = Date.now()

  await prismaClient.rdv.createMany({
    data: rdvs.map(
      ({
        id,
        statut,
        dansDesJours,
        collectif = false,
        compteRenduRegle = false,
      }) => {
        const debut = new Date(maintenant + dansDesJours * 24 * 60 * 60_000)

        return {
          id,
          uuid: `00000000-0000-4000-8000-${String(id).padStart(12, '0')}`,
          rdvAccountId: compte.id,
          organisationId: E2E_RDV_ORGANISATION_ID,
          address: '12 rue de la Paix, 75002 Paris',
          startsAt: debut,
          endsAt: new Date(debut.getTime() + 30 * 60_000),
          durationInMin: 30,
          status: statut,
          compteRenduRegle,
          collectif,
          usersCount: 0,
          urlForAgents: `https://demo.rdv.anct.gouv.fr/agents/rdvs/${id}`,
          rawData: {},
        }
      },
    ),
  })

  return { rdvAccountId: compte.id, semes: rdvs.length }
}

/** Réglage d'affichage des rendez-vous dans la liste d'activités, tel qu'il est persisté. */
export const reglageRdvsDansActivitesFor = async ({
  email,
}: {
  email: string
}) => {
  const user = await prismaClient.user.findUniqueOrThrow({
    where: { email },
    select: { id: true },
  })

  return prismaClient.rdvAccount.findUniqueOrThrow({
    where: { userId: user.id },
    select: { includeRdvsInActivitesList: true },
  })
}
