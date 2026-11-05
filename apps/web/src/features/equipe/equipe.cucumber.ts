import { prismaClient } from '@app/web/prismaClient'
import { After, setDefaultTimeout } from '@cucumber/cucumber'
import { v4 } from 'uuid'

setDefaultTimeout(60_000)

type EquipeSemee = {
  readonly userIds: readonly string[]
  readonly mediateurIds: readonly string[]
  readonly coordinateurId: string
}

const equipeCourante: { semee: EquipeSemee | null } = { semee: null }

export const equipeSemee = (): EquipeSemee => {
  if (equipeCourante.semee === null) throw new Error('Aucune équipe semée')
  return equipeCourante.semee
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

export const semerUnMediateurCoordonne = async (): Promise<EquipeSemee> => {
  const porteur = await semerMediateur()
  const autre = await semerMediateur()
  const coordinateur = await prismaClient.coordinateur.create({
    data: { userId: autre.userId },
    select: { id: true },
  })
  await prismaClient.mediateurCoordonne.create({
    data: {
      mediateurId: porteur.mediateurId,
      coordinateurId: coordinateur.id,
    },
  })
  await prismaClient.invitationEquipe.create({
    data: {
      email: `invite-${autre.userId}@example.com`,
      coordinateurId: coordinateur.id,
      mediateurId: porteur.mediateurId,
    },
  })

  equipeCourante.semee = {
    userIds: [porteur.userId, autre.userId],
    mediateurIds: [porteur.mediateurId, autre.mediateurId],
    coordinateurId: coordinateur.id,
  }

  return equipeCourante.semee
}

After(async () => {
  const semee = equipeCourante.semee
  equipeCourante.semee = null
  if (semee === null) return

  const mediateurIds = [...semee.mediateurIds]

  await prismaClient.invitationEquipe.deleteMany({
    where: { mediateurId: { in: mediateurIds } },
  })
  await prismaClient.mediateurCoordonne.deleteMany({
    where: { mediateurId: { in: mediateurIds } },
  })
  await prismaClient.coordinateur.deleteMany({
    where: { id: semee.coordinateurId },
  })
  await prismaClient.mediateur.deleteMany({
    where: { id: { in: mediateurIds } },
  })
  await prismaClient.user.deleteMany({
    where: { id: { in: [...semee.userIds] } },
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
