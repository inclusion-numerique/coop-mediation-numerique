import { CodeDepartement } from '@app/web/libraries/departement'
import { prismaClient } from '@app/web/prismaClient'
import { After, setDefaultTimeout } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import type { ColonnesDePortee } from './db/tag.transfer'
import {
  type Acteur,
  CoordinateurId,
  MediateurId,
  NomDuCoordinateur,
} from './domain'

setDefaultTimeout(60_000)

type TagSeme = {
  readonly userId: string
  readonly mediateurId: string
  readonly tagId: string
}

const semes = {
  userIds: new Set<string>(),
  mediateurIds: new Set<string>(),
  coordinateurIds: new Set<string>(),
  tagIds: new Set<string>(),
  activiteIds: new Set<string>(),
  activiteCoordinationIds: new Set<string>(),
}

const semerUnUtilisateur = async (): Promise<string> => {
  const userId = v4()
  await prismaClient.user.create({
    data: { id: userId, email: `tags-${userId}@example.com` },
  })
  semes.userIds.add(userId)

  return userId
}

export const semerUnMediateur = async (): Promise<{
  readonly userId: string
  readonly mediateurId: string
}> => {
  const userId = await semerUnUtilisateur()
  const { id } = await prismaClient.mediateur.create({
    data: { userId },
    select: { id: true },
  })
  semes.mediateurIds.add(id)

  return { userId, mediateurId: id }
}

export const semerUnCoordinateur = async (): Promise<{
  readonly userId: string
  readonly coordinateurId: string
}> => {
  const userId = await semerUnUtilisateur()
  const { id } = await prismaClient.coordinateur.create({
    data: { userId },
    select: { id: true },
  })
  semes.coordinateurIds.add(id)

  return { userId, coordinateurId: id }
}

export const coordonner = async ({
  coordinateurId,
  mediateurId,
}: {
  readonly coordinateurId: string
  readonly mediateurId: string
}): Promise<void> => {
  await prismaClient.mediateurCoordonne.create({
    data: { coordinateurId, mediateurId },
  })
}

const SANS_PORTEE: ColonnesDePortee = {
  mediateurId: null,
  coordinateurId: null,
  departement: null,
  equipe: null,
}

export const semerUnTag = async ({
  nom = `Tag ${v4().slice(0, 8)}`,
  ...portee
}: Partial<ColonnesDePortee> & { readonly nom?: string }): Promise<string> => {
  const { id } = await prismaClient.tag.create({
    data: { ...SANS_PORTEE, ...portee, nom },
    select: { id: true },
  })
  semes.tagIds.add(id)

  return id
}

export const semerUneActiviteTaguee = async ({
  mediateurId,
  tagIds,
  accompagnements = 0,
}: {
  readonly mediateurId: string
  readonly tagIds: readonly string[]
  readonly accompagnements?: number
}): Promise<string> => {
  const { id } = await prismaClient.activite.create({
    data: {
      mediateurId,
      type: 'Individuel',
      typeLieu: 'Autre',
      date: new Date('2026-06-01'),
      duree: 60,
      accompagnementsCount: accompagnements,
      tags: { create: tagIds.map((tagId) => ({ tagId })) },
    },
    select: { id: true },
  })
  semes.activiteIds.add(id)

  return id
}

export const semerUneActiviteDeCoordinationTaguee = async ({
  coordinateurId,
  tagIds,
}: {
  readonly coordinateurId: string
  readonly tagIds: readonly string[]
}): Promise<string> => {
  const { id } = await prismaClient.activiteCoordination.create({
    data: {
      coordinateurId,
      type: 'Animation',
      date: new Date('2026-06-01'),
      tags: { create: tagIds.map((tagId) => ({ tagId })) },
    },
    select: { id: true },
  })
  semes.activiteCoordinationIds.add(id)

  return id
}

export const semerUnTagUtiliseDansUneActivite = async (): Promise<TagSeme> => {
  const { userId, mediateurId } = await semerUnMediateur()
  const tagId = await semerUnTag({ mediateurId })
  await semerUneActiviteTaguee({ mediateurId, tagIds: [tagId] })

  return { userId, mediateurId, tagId }
}

export const tagEnBase = (tagId: string) =>
  prismaClient.tag.findUnique({ where: { id: tagId } })

export const tagsDeLActivite = async (
  activiteId: string,
): Promise<readonly string[]> =>
  (
    await prismaClient.activitesTags.findMany({
      where: { activiteId },
      select: { tagId: true },
    })
  ).map(({ tagId }) => tagId)

export const tagsDeLActiviteDeCoordination = async (
  activiteCoordinationId: string,
): Promise<readonly string[]> =>
  (
    await prismaClient.activitesCoordinationTags.findMany({
      where: { activiteCoordinationId },
      select: { tagId: true },
    })
  ).map(({ tagId }) => tagId)

export const retenirLeTag = (tagId: string): void => {
  semes.tagIds.add(tagId)
}

const vider = <T>(ensemble: Set<T>): T[] => {
  const valeurs = [...ensemble]
  ensemble.clear()
  return valeurs
}

After(async () => {
  const userIds = vider(semes.userIds)
  const mediateurIds = vider(semes.mediateurIds)
  const coordinateurIds = vider(semes.coordinateurIds)
  const tagIds = vider(semes.tagIds)
  const activiteIds = vider(semes.activiteIds)
  const activiteCoordinationIds = vider(semes.activiteCoordinationIds)

  if (userIds.length === 0 && tagIds.length === 0) return

  const tagsConcernes = {
    OR: [
      { id: { in: tagIds } },
      { mediateurId: { in: mediateurIds } },
      { coordinateurId: { in: coordinateurIds } },
    ],
  }

  await prismaClient.activitesTags.deleteMany({
    where: {
      OR: [{ activiteId: { in: activiteIds } }, { tag: tagsConcernes }],
    },
  })
  await prismaClient.activitesCoordinationTags.deleteMany({
    where: {
      OR: [
        { activiteCoordinationId: { in: activiteCoordinationIds } },
        { tag: tagsConcernes },
      ],
    },
  })
  await prismaClient.activite.deleteMany({
    where: { mediateurId: { in: mediateurIds } },
  })
  await prismaClient.activiteCoordination.deleteMany({
    where: { coordinateurId: { in: coordinateurIds } },
  })
  await prismaClient.tag.deleteMany({ where: tagsConcernes })
  await prismaClient.mediateurCoordonne.deleteMany({
    where: {
      OR: [
        { mediateurId: { in: mediateurIds } },
        { coordinateurId: { in: coordinateurIds } },
      ],
    },
  })
  await prismaClient.coordinateur.deleteMany({
    where: { id: { in: coordinateurIds } },
  })
  await prismaClient.mediateur.deleteMany({
    where: { id: { in: mediateurIds } },
  })
  await prismaClient.user.deleteMany({ where: { id: { in: userIds } } })
})

export const acteurMediateur = ({
  mediateurId,
  equipes = [],
  departement = null,
}: {
  readonly mediateurId: string
  readonly equipes?: readonly string[]
  readonly departement?: string | null
}): Acteur => ({
  mediateurId: MediateurId(mediateurId),
  coordinateurId: null,
  equipes: equipes.map((coordinateurId) => ({
    coordinateurId: CoordinateurId(coordinateurId),
    coordonneePar: NomDuCoordinateur('Coordinateur'),
  })),
  departement: departement === null ? null : CodeDepartement(departement),
})

export const acteurCoordinateur = ({
  coordinateurId,
  departement = null,
}: {
  readonly coordinateurId: string
  readonly departement?: string | null
}): Acteur => ({
  mediateurId: null,
  coordinateurId: CoordinateurId(coordinateurId),
  equipes: [
    {
      coordinateurId: CoordinateurId(coordinateurId),
      coordonneePar: NomDuCoordinateur('Coordinateur'),
    },
  ],
  departement: departement === null ? null : CodeDepartement(departement),
})
