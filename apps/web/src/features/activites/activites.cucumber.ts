import { prismaClient } from '@app/web/prismaClient'
import { After, setDefaultTimeout } from '@cucumber/cucumber'
import { v4 } from 'uuid'

setDefaultTimeout(60_000)

/**
 * Support Cucumber de la feature activités.
 *
 * L'effacement des notes porte sur tous les comptes rendus d'une personne : il
 * lui faut un compte jetable, isolé des scénarios qui partagent les fixtures.
 */
type ComptesRendusSemes = {
  readonly userId: string
  readonly mediateurId: string
  readonly coordinateurId: string
}

let comptesRendus: ComptesRendusSemes | undefined

export const comptesRendusSemes = (): ComptesRendusSemes => {
  if (!comptesRendus) throw new Error('Aucun compte rendu semé')
  return comptesRendus
}

export const semerComptesRendus = async (): Promise<ComptesRendusSemes> => {
  const userId = v4()

  await prismaClient.user.create({
    data: { id: userId, email: `notes-${userId}@example.com` },
  })

  const mediateur = await prismaClient.mediateur.create({
    data: { userId },
    select: { id: true },
  })
  const coordinateur = await prismaClient.coordinateur.create({
    data: { userId },
    select: { id: true },
  })

  await prismaClient.activite.createMany({
    data: [1, 2].map((rang) => ({
      mediateurId: mediateur.id,
      type: 'Individuel' as const,
      typeLieu: 'Autre' as const,
      date: new Date(`2026-06-0${rang}`),
      duree: 60,
      accompagnementsCount: 0,
      notes: `Compte rendu ${rang} avec des éléments personnels`,
    })),
  })

  await prismaClient.activiteCoordination.create({
    data: {
      coordinateurId: coordinateur.id,
      type: 'Animation',
      date: new Date('2026-06-03'),
      notes: 'Note de coordination avec des éléments personnels',
    },
  })

  comptesRendus = {
    userId,
    mediateurId: mediateur.id,
    coordinateurId: coordinateur.id,
  }

  return comptesRendus
}

After(async () => {
  const semé = comptesRendus
  comptesRendus = undefined
  if (!semé) return

  await prismaClient.activite.deleteMany({
    where: { mediateurId: semé.mediateurId },
  })
  await prismaClient.activiteCoordination.deleteMany({
    where: { coordinateurId: semé.coordinateurId },
  })
  await prismaClient.coordinateur.deleteMany({
    where: { id: semé.coordinateurId },
  })
  await prismaClient.mediateur.deleteMany({ where: { id: semé.mediateurId } })
  await prismaClient.user.deleteMany({ where: { id: semé.userId } })
})
