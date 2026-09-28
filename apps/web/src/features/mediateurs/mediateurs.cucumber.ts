import { prismaClient } from '@app/web/prismaClient'
import { After, setDefaultTimeout } from '@cucumber/cucumber'
import { v4 } from 'uuid'

setDefaultTimeout(60_000)

type PartagesSemes = {
  readonly userId: string
  readonly mediateurId: string
  readonly coordinateurId: string
}

let partages: PartagesSemes | undefined

export const partagesSemes = (): PartagesSemes => {
  if (!partages) throw new Error('Aucun partage semé')
  return partages
}

export const semerPartagesStatistiques = async (): Promise<PartagesSemes> => {
  const userId = v4()

  await prismaClient.user.create({
    data: { id: userId, email: `partage-${userId}@example.com` },
  })

  const mediateur = await prismaClient.mediateur.create({
    data: { userId },
    select: { id: true },
  })
  const coordinateur = await prismaClient.coordinateur.create({
    data: { userId },
    select: { id: true },
  })

  await prismaClient.partageStatistiques.create({
    data: { mediateurId: mediateur.id },
  })
  await prismaClient.partageStatistiques.create({
    data: { coordinateurId: coordinateur.id },
  })

  partages = {
    userId,
    mediateurId: mediateur.id,
    coordinateurId: coordinateur.id,
  }

  return partages
}

After(async () => {
  const semé = partages
  partages = undefined
  if (!semé) return

  await prismaClient.partageStatistiques.deleteMany({
    where: {
      OR: [
        { mediateurId: semé.mediateurId },
        { coordinateurId: semé.coordinateurId },
      ],
    },
  })
  await prismaClient.coordinateur.deleteMany({
    where: { id: semé.coordinateurId },
  })
  await prismaClient.mediateur.deleteMany({ where: { id: semé.mediateurId } })
  await prismaClient.user.deleteMany({ where: { id: semé.userId } })
})

type VisibiliteSemee = {
  readonly mediateurUserId: string
  readonly mediateurId: string
  readonly administrateurUserId: string
  readonly semeLe: Date
}

const visibilite: { semee?: VisibiliteSemee } = {}

export const visibiliteSemee = (): VisibiliteSemee => {
  if (!visibilite.semee) throw new Error('Aucun médiateur semé')
  return visibilite.semee
}

export const semerUnMediateurVisible = async (): Promise<VisibiliteSemee> => {
  const mediateurUserId = v4()
  const administrateurUserId = v4()
  const semeLe = new Date('2026-01-01T00:00:00.000Z')

  await prismaClient.user.create({
    data: {
      id: mediateurUserId,
      email: `visibilite-${mediateurUserId}@example.com`,
      updated: semeLe,
    },
  })
  await prismaClient.user.create({
    data: {
      id: administrateurUserId,
      email: `visibilite-admin-${administrateurUserId}@example.com`,
      role: 'Admin',
    },
  })

  const mediateur = await prismaClient.mediateur.create({
    data: {
      userId: mediateurUserId,
      isVisible: true,
      modification: semeLe,
    },
    select: { id: true },
  })

  visibilite.semee = {
    mediateurUserId,
    mediateurId: mediateur.id,
    administrateurUserId,
    semeLe,
  }

  return visibilite.semee
}

After(async () => {
  const semee = visibilite.semee
  visibilite.semee = undefined
  if (!semee) return

  const userIds = [semee.mediateurUserId, semee.administrateurUserId]

  await prismaClient.mutation.deleteMany({ where: { userId: { in: userIds } } })
  await prismaClient.mediateur.deleteMany({ where: { id: semee.mediateurId } })
  await prismaClient.user.deleteMany({ where: { id: { in: userIds } } })
})
