import { prismaClient } from '@app/web/prismaClient'

/**
 * Identifiant d'agent réservé aux tests. Les identifiants RDV Service Public sont
 * attribués par eux : on en choisit un hors de leur plage plausible pour qu'aucune
 * base restaurée ne puisse le porter.
 */
export const E2E_RDV_AGENT_ID = 990_001

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
