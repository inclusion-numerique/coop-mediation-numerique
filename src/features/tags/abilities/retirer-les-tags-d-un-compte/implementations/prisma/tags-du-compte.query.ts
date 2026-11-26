import { prismaClient } from '@/configuration/prisma'
import { CodeDepartement } from '@/libraries/insee'
import {
  type CoordinateurId,
  DescriptionDuTag,
  MediateurId,
  NomDuTag,
  TagId,
} from '../../../../domain'
import type {
  LireLesTagsDetenus,
  LireLesTagsDuCompte,
  TagDuCoordinateur,
} from '../../domain/ports'

const tagsDuMediateur = async (
  mediateurId: MediateurId | null,
): Promise<readonly TagId[]> =>
  mediateurId === null
    ? []
    : (
        await prismaClient.tag.findMany({
          where: { mediateurId, suppression: null },
          select: { id: true },
        })
      ).map(({ id }) => TagId(id))

const tagsDuCoordinateur = async (
  coordinateurId: CoordinateurId | null,
): Promise<readonly TagDuCoordinateur[]> =>
  coordinateurId === null
    ? []
    : (
        await prismaClient.tag.findMany({
          where: { coordinateurId, suppression: null },
          select: {
            id: true,
            nom: true,
            description: true,
            departement: true,
            activites: {
              select: { activite: { select: { mediateurId: true } } },
            },
          },
        })
      ).map((tag) => ({
        id: TagId(tag.id),
        nom: NomDuTag(tag.nom),
        description: DescriptionDuTag.safe(tag.description ?? ''),
        departement:
          tag.departement === null ? null : CodeDepartement(tag.departement),
        utilisateurs: tag.activites.map(({ activite }) =>
          MediateurId(activite.mediateurId),
        ),
      }))

export const lireLesTagsDuCompte: LireLesTagsDuCompte = async ({
  mediateurId,
  coordinateurId,
}) => {
  const [duMediateur, duCoordinateur] = await Promise.all([
    tagsDuMediateur(mediateurId),
    tagsDuCoordinateur(coordinateurId),
  ])

  return { duMediateur, duCoordinateur }
}

export const lireLesTagsDetenus: LireLesTagsDetenus = async (mediateurIds) => {
  const tags = await prismaClient.tag.findMany({
    where: { mediateurId: { in: [...mediateurIds] }, suppression: null },
    select: { id: true, nom: true, mediateurId: true },
  })

  return mediateurIds.map((mediateurId) => ({
    mediateurId,
    tags: tags
      .filter((tag) => tag.mediateurId === mediateurId)
      .map(({ id, nom }) => ({ id: TagId(id), nom: NomDuTag(nom) })),
  }))
}
