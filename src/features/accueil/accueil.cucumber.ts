import { After } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'

const utilisateursSemes = new Set<string>()

export type VisiteurASemer = {
  readonly prenom: string
  readonly nom: string
  readonly mediateur: boolean
  readonly coordinateur: boolean
  readonly presentationVue: boolean
}

export const semerUnVisiteur = async ({
  prenom,
  nom,
  mediateur,
  coordinateur,
  presentationVue,
}: VisiteurASemer): Promise<{
  readonly id: string
  readonly email: string
}> => {
  const id = v4()
  const email = `accueil-${id}@example.org`
  await prismaClient.user.create({
    data: {
      id,
      email,
      firstName: prenom,
      name: nom,
      hasSeenOnboarding: presentationVue
        ? new Date('2026-10-01T10:00:00Z')
        : null,
      ...(mediateur ? { mediateur: { create: {} } } : {}),
      ...(coordinateur ? { coordinateur: { create: {} } } : {}),
    },
  })
  utilisateursSemes.add(id)

  return { id, email }
}

After(async () => {
  const userIds = [...utilisateursSemes]
  utilisateursSemes.clear()
  if (userIds.length === 0) return

  await prismaClient.coordinateur.deleteMany({
    where: { userId: { in: userIds } },
  })
  await prismaClient.mediateur.deleteMany({
    where: { userId: { in: userIds } },
  })
  await prismaClient.user.deleteMany({ where: { id: { in: userIds } } })
})
