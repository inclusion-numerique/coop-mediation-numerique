import { prismaClient } from '@app/web/prismaClient'
import { After, setDefaultTimeout } from '@cucumber/cucumber'
import { v4 } from 'uuid'

setDefaultTimeout(60_000)

type LieuxSemes = {
  readonly userId: string
  readonly mediateurId: string
  readonly lieuIds: readonly string[]
}

let lieux: LieuxSemes | undefined

export const lieuxSemes = (): LieuxSemes => {
  if (!lieux) throw new Error('Aucun lieu semé')
  return lieux
}

export const semerLieuxDActivite = async (): Promise<LieuxSemes> => {
  const userId = v4()

  await prismaClient.user.create({
    data: { id: userId, email: `lieux-${userId}@example.com` },
  })

  const mediateur = await prismaClient.mediateur.create({
    data: { userId },
    select: { id: true },
  })

  const crees = await Promise.all(
    [1, 2].map((rang) =>
      prismaClient.lieuInclusion.create({
        data: {
          nom: `Espace numérique ${rang}`,
          adresse: `${rang} rue de la Paix`,
          commune: 'Reims',
          codePostal: '51100',
        },
        select: { id: true },
      }),
    ),
  )

  await prismaClient.mediateurEnActivite.createMany({
    data: crees.map(({ id }) => ({
      mediateurId: mediateur.id,
      structureId: id,
      debut: new Date('2026-01-01'),
    })),
  })

  lieux = {
    userId,
    mediateurId: mediateur.id,
    lieuIds: crees.map(({ id }) => id),
  }

  return lieux
}

After(async () => {
  const semé = lieux
  lieux = undefined
  if (!semé) return

  await prismaClient.mediateurEnActivite.deleteMany({
    where: { mediateurId: semé.mediateurId },
  })
  await prismaClient.lieuInclusion.deleteMany({
    where: { id: { in: [...semé.lieuIds] } },
  })
  await prismaClient.mediateur.deleteMany({ where: { id: semé.mediateurId } })
  await prismaClient.user.deleteMany({ where: { id: semé.userId } })
})
