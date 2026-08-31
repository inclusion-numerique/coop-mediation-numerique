import { prismaClient } from '@app/web/prismaClient'
import { After, setDefaultTimeout } from '@cucumber/cucumber'
import { v4 } from 'uuid'

setDefaultTimeout(60_000)

/**
 * Support Cucumber de la feature équipe.
 *
 * Les scénarios éprouvent l'essaimage des tags, qui traverse coordinateurs,
 * médiateurs et comptes rendus : chacun sème son propre petit réseau et le
 * retire derrière lui, plutôt que de s'appuyer sur les fixtures partagées.
 */
type EquipeSemee = {
  readonly userIds: readonly string[]
  readonly mediateurIds: readonly string[]
  readonly coordinateurId: string | null
  readonly tagId: string
}

let equipe: EquipeSemee | undefined

export const equipeSemee = (): EquipeSemee => {
  if (!equipe) throw new Error('Aucune équipe semée')
  return equipe
}

const semerMediateur = async (): Promise<{
  userId: string
  mediateurId: string
}> => {
  const userId = v4()
  await prismaClient.user.create({
    data: { id: userId, email: `equipe-${userId}@example.com` },
  })
  const mediateur = await prismaClient.mediateur.create({
    data: { userId },
    select: { id: true },
  })

  return { userId, mediateurId: mediateur.id }
}

const semerComptteRenduTague = async (
  mediateurId: string,
  tagId: string,
): Promise<void> => {
  const activite = await prismaClient.activite.create({
    data: {
      mediateurId,
      type: 'Individuel',
      typeLieu: 'Autre',
      date: new Date('2026-06-01'),
      duree: 60,
      accompagnementsCount: 0,
    },
    select: { id: true },
  })

  await prismaClient.activitesTags.create({
    data: { activiteId: activite.id, tagId },
  })
}

/** Un coordinateur dont le tag est utilisé par `nombreUtilisateurs` médiateurs. */
export const semerTagDeCoordinateur = async ({
  nombreUtilisateurs,
}: {
  nombreUtilisateurs: number
}): Promise<EquipeSemee> => {
  const porteur = await semerMediateur()
  const coordinateur = await prismaClient.coordinateur.create({
    data: { userId: porteur.userId },
    select: { id: true },
  })

  const tag = await prismaClient.tag.create({
    data: {
      nom: `Tag partagé ${porteur.userId.slice(0, 8)}`,
      coordinateurId: coordinateur.id,
    },
    select: { id: true },
  })

  const utilisateurs = await Promise.all(
    Array.from({ length: nombreUtilisateurs }, () => semerMediateur()),
  )

  await utilisateurs.reduce<Promise<void>>(async (precedent, utilisateur) => {
    await precedent
    await semerComptteRenduTague(utilisateur.mediateurId, tag.id)
  }, Promise.resolve())

  equipe = {
    userIds: [porteur.userId, ...utilisateurs.map(({ userId }) => userId)],
    mediateurIds: [
      porteur.mediateurId,
      ...utilisateurs.map(({ mediateurId }) => mediateurId),
    ],
    coordinateurId: coordinateur.id,
    tagId: tag.id,
  }

  return equipe
}

/** Un médiateur avec un tag, coordonné ou non. */
export const semerTagDeMediateur = async ({
  avecCoordinateur,
}: {
  avecCoordinateur: boolean
}): Promise<EquipeSemee> => {
  const porteur = await semerMediateur()

  const coordinateur = avecCoordinateur
    ? await (async () => {
        const autre = await semerMediateur()
        const cree = await prismaClient.coordinateur.create({
          data: { userId: autre.userId },
          select: { id: true },
        })
        await prismaClient.mediateurCoordonne.create({
          data: { mediateurId: porteur.mediateurId, coordinateurId: cree.id },
        })
        await prismaClient.invitationEquipe.create({
          data: {
            email: `invite-${autre.userId}@example.com`,
            coordinateurId: cree.id,
            mediateurId: porteur.mediateurId,
          },
        })
        return {
          id: cree.id,
          userId: autre.userId,
          mediateurId: autre.mediateurId,
        }
      })()
    : null

  const tag = await prismaClient.tag.create({
    data: {
      nom: `Tag propre ${porteur.userId.slice(0, 8)}`,
      mediateurId: porteur.mediateurId,
    },
    select: { id: true },
  })

  equipe = {
    userIds: [porteur.userId, ...(coordinateur ? [coordinateur.userId] : [])],
    mediateurIds: [
      porteur.mediateurId,
      ...(coordinateur ? [coordinateur.mediateurId] : []),
    ],
    coordinateurId: coordinateur?.id ?? null,
    tagId: tag.id,
  }

  return equipe
}

After(async () => {
  const semée = equipe
  equipe = undefined
  if (!semée) return

  const mediateurIds = [...semée.mediateurIds]

  await prismaClient.activitesTags.deleteMany({
    where: { activite: { mediateurId: { in: mediateurIds } } },
  })
  await prismaClient.activite.deleteMany({
    where: { mediateurId: { in: mediateurIds } },
  })
  await prismaClient.invitationEquipe.deleteMany({
    where: { mediateurId: { in: mediateurIds } },
  })
  await prismaClient.mediateurCoordonne.deleteMany({
    where: { mediateurId: { in: mediateurIds } },
  })
  await prismaClient.tag.deleteMany({
    where: {
      OR: [
        { mediateurId: { in: mediateurIds } },
        ...(semée.coordinateurId
          ? [{ coordinateurId: semée.coordinateurId }]
          : []),
      ],
    },
  })
  if (semée.coordinateurId)
    await prismaClient.coordinateur.deleteMany({
      where: { id: semée.coordinateurId },
    })
  await prismaClient.mediateur.deleteMany({
    where: { id: { in: mediateurIds } },
  })
  await prismaClient.user.deleteMany({
    where: { id: { in: [...semée.userIds] } },
  })
})
