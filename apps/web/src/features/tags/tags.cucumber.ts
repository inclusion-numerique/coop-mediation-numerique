import { prismaClient } from '@app/web/prismaClient'
import { After, setDefaultTimeout } from '@cucumber/cucumber'
import { v4 } from 'uuid'

setDefaultTimeout(60_000)

type TagSeme = {
  readonly userId: string
  readonly mediateurId: string
  readonly tagId: string
}

const tagsSemes = new Set<TagSeme>()

export const semerUnTagUtiliseDansUneActivite = async (): Promise<TagSeme> => {
  const userId = v4()

  await prismaClient.user.create({
    data: { id: userId, email: `tags-${userId}@example.com` },
  })
  const mediateur = await prismaClient.mediateur.create({
    data: { userId },
    select: { id: true },
  })
  const tag = await prismaClient.tag.create({
    data: { nom: `Tag ${userId}`, mediateurId: mediateur.id },
    select: { id: true },
  })
  await prismaClient.activite.create({
    data: {
      mediateurId: mediateur.id,
      type: 'Individuel',
      typeLieu: 'Autre',
      date: new Date('2026-06-01'),
      duree: 60,
      accompagnementsCount: 0,
      tags: { create: { tagId: tag.id } },
    },
  })

  const seme = { userId, mediateurId: mediateur.id, tagId: tag.id }
  tagsSemes.add(seme)

  return seme
}

After(async () => {
  const semes = [...tagsSemes]
  tagsSemes.clear()
  if (semes.length === 0) return

  const tagIds = semes.map(({ tagId }) => tagId)
  const mediateurIds = semes.map(({ mediateurId }) => mediateurId)

  await prismaClient.activitesTags.deleteMany({
    where: { tagId: { in: tagIds } },
  })
  await prismaClient.activite.deleteMany({
    where: { mediateurId: { in: mediateurIds } },
  })
  await prismaClient.tag.deleteMany({ where: { id: { in: tagIds } } })
  await prismaClient.mediateur.deleteMany({
    where: { id: { in: mediateurIds } },
  })
  await prismaClient.user.deleteMany({
    where: { id: { in: semes.map(({ userId }) => userId) } },
  })
})
