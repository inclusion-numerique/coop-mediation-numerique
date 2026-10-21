import { prismaClient } from '@app/web/prismaClient'
import { After, setDefaultTimeout } from '@cucumber/cucumber'
import { v4 } from 'uuid'

setDefaultTimeout(60_000)

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

type Personne = {
  readonly userId: string
  readonly email: string
}

export type CoordinateurSeme = Personne & { readonly coordinateurId: string }

export type MediateurSeme = Personne & { readonly mediateurId: string }

type Semis = {
  readonly userIds: readonly string[]
  readonly coordinateurIds: readonly string[]
  readonly mediateurIds: readonly string[]
}

const semisVide: Semis = { userIds: [], coordinateurIds: [], mediateurIds: [] }

const semis: { courant: Semis } = { courant: semisVide }

const retenir = (ajout: Partial<Semis>): void => {
  semis.courant = {
    userIds: [...semis.courant.userIds, ...(ajout.userIds ?? [])],
    coordinateurIds: [
      ...semis.courant.coordinateurIds,
      ...(ajout.coordinateurIds ?? []),
    ],
    mediateurIds: [
      ...semis.courant.mediateurIds,
      ...(ajout.mediateurIds ?? []),
    ],
  }
}

const semerUnePersonne = async ({
  email,
  inscriptionValidee,
  profilSupprime = false,
}: {
  email?: string
  inscriptionValidee: boolean
  profilSupprime?: boolean
}): Promise<Personne> => {
  const userId = v4()
  const adresse = email ?? `equipe-${userId}@example.com`
  await prismaClient.user.create({
    data: {
      id: userId,
      email: adresse,
      firstName: 'Prénom',
      lastName: userId.slice(0, 8),
      name: `Prénom ${userId.slice(0, 8)}`,
      inscriptionValidee: inscriptionValidee ? new Date() : null,
      deleted: profilSupprime ? new Date() : null,
    },
  })
  retenir({ userIds: [userId] })
  return { userId, email: adresse }
}

export const semerUnCoordinateur = async (): Promise<CoordinateurSeme> => {
  const personne = await semerUnePersonne({ inscriptionValidee: true })
  const coordinateur = await prismaClient.coordinateur.create({
    data: { userId: personne.userId },
    select: { id: true },
  })
  retenir({ coordinateurIds: [coordinateur.id] })
  return { ...personne, coordinateurId: coordinateur.id }
}

export const semerUnMediateurDEquipe = async ({
  email,
  inscriptionValidee = true,
  derniereActivite,
  profilSupprime,
}: {
  email?: string
  inscriptionValidee?: boolean
  derniereActivite?: Date
  profilSupprime?: boolean
} = {}): Promise<MediateurSeme> => {
  const personne = await semerUnePersonne({
    email,
    inscriptionValidee,
    profilSupprime,
  })
  const mediateur = await prismaClient.mediateur.create({
    data: {
      userId: personne.userId,
      derniereCreationActivite: derniereActivite ?? null,
    },
    select: { id: true },
  })
  retenir({ mediateurIds: [mediateur.id] })
  return { ...personne, mediateurId: mediateur.id }
}

export const semerUneInvitation = async ({
  coordinateurId,
  email,
  mediateurId,
  statut = 'EnAttente',
}: {
  coordinateurId: string
  email: string
  mediateurId?: string
  statut?: 'EnAttente' | 'Acceptee' | 'Refusee'
}): Promise<void> => {
  await prismaClient.invitationEquipe.create({
    data: {
      email,
      coordinateurId,
      mediateurId: mediateurId ?? null,
      acceptee: statut === 'Acceptee' ? new Date() : null,
      refusee: statut === 'Refusee' ? new Date() : null,
    },
  })
}

export const semerUneAdhesion = async ({
  coordinateurId,
  mediateurId,
  archivee = false,
}: {
  coordinateurId: string
  mediateurId: string
  archivee?: boolean
}): Promise<void> => {
  await prismaClient.mediateurCoordonne.create({
    data: {
      coordinateurId,
      mediateurId,
      suppression: archivee ? new Date('2026-01-01') : null,
    },
  })
}

export const adhesionsDe = ({
  coordinateurId,
  mediateurId,
}: {
  coordinateurId: string
  mediateurId: string
}) =>
  prismaClient.mediateurCoordonne.findMany({
    where: { coordinateurId, mediateurId },
    select: { suppression: true },
  })

export const invitationDe = ({
  coordinateurId,
  email,
}: {
  coordinateurId: string
  email: string
}) =>
  prismaClient.invitationEquipe.findUnique({
    where: { email_coordinateurId: { email, coordinateurId } },
    select: {
      mediateurId: true,
      acceptee: true,
      refusee: true,
      renvoyee: true,
      creation: true,
    },
  })

After(async () => {
  const semes = semis.courant
  semis.courant = semisVide
  if (semes.userIds.length === 0) return

  const coordinateurIds = [...semes.coordinateurIds]
  const mediateurIds = [...semes.mediateurIds]

  await prismaClient.invitationEquipe.deleteMany({
    where: {
      OR: [
        { coordinateurId: { in: coordinateurIds } },
        { mediateurId: { in: mediateurIds } },
      ],
    },
  })
  await prismaClient.mediateurCoordonne.deleteMany({
    where: {
      OR: [
        { coordinateurId: { in: coordinateurIds } },
        { mediateurId: { in: mediateurIds } },
      ],
    },
  })
  await prismaClient.coordinateur.deleteMany({
    where: { id: { in: coordinateurIds } },
  })
  await prismaClient.mediateur.deleteMany({
    where: { id: { in: mediateurIds } },
  })
  await prismaClient.user.deleteMany({
    where: { id: { in: [...semes.userIds] } },
  })
})
