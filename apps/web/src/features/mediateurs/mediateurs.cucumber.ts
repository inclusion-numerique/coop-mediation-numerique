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
