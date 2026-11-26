import { v4 } from 'uuid'
import { addMutationLog, prismaClient } from '@/configuration/prisma'
import { Prisma } from '@/generated/prisma/client'
import {
  type ActiviteDeCoordination,
  ActiviteDeCoordinationId,
  type UtilisateurId,
} from '../../../../domain'
import { activiteDeCoordinationVersLaBase } from '../../../../implementations/prisma/activite-de-coordination.transfer'
import type { EcrireLActiviteDeCoordination } from '../../domain'

export const nouvelIdentifiantDeCoordination = (): ActiviteDeCoordinationId =>
  ActiviteDeCoordinationId(v4())

const colonnesDe = (activite: ActiviteDeCoordination) => {
  const { tags, ...colonnes } = activiteDeCoordinationVersLaBase(activite)
  return {
    tags,
    colonnes: {
      ...colonnes,
      structuresPartenaires: colonnes.structuresPartenaires ?? Prisma.DbNull,
    },
  }
}

const creer = (activite: ActiviteDeCoordination) => {
  const { tags, colonnes } = colonnesDe(activite)
  return prismaClient.$transaction([
    prismaClient.activiteCoordination.create({ data: colonnes }),
    prismaClient.activitesCoordinationTags.createMany({
      data: tags.map(({ tag }) => ({
        activiteCoordinationId: activite.id,
        tagId: tag.id,
      })),
    }),
    prismaClient.coordinateur.update({
      where: { id: activite.coordinateurId },
      data: { derniereCreationActivite: activite.modification },
    }),
  ])
}

const modifier = (activite: ActiviteDeCoordination) => {
  const { tags, colonnes } = colonnesDe(activite)
  return prismaClient.$transaction([
    prismaClient.activitesCoordinationTags.deleteMany({
      where: { activiteCoordinationId: activite.id },
    }),
    prismaClient.activiteCoordination.update({
      where: { id: activite.id },
      data: colonnes,
    }),
    prismaClient.activitesCoordinationTags.createMany({
      data: tags.map(({ tag }) => ({
        activiteCoordinationId: activite.id,
        tagId: tag.id,
      })),
    }),
  ])
}

const journaliser = (
  auteurId: UtilisateurId,
  nom: 'CreerActiviteCoordination' | 'ModifierActiviteCoordination',
  activite: ActiviteDeCoordination,
) =>
  addMutationLog({
    userId: auteurId,
    nom,
    data: { type: activite._tag, id: activite.id },
  })

export const creerLActiviteDeCoordination =
  (auteurId: UtilisateurId): EcrireLActiviteDeCoordination =>
  async (activite) => {
    await creer(activite)
    journaliser(auteurId, 'CreerActiviteCoordination', activite)
  }

export const modifierLActiviteDeCoordination =
  (auteurId: UtilisateurId): EcrireLActiviteDeCoordination =>
  async (activite) => {
    await modifier(activite)
    journaliser(auteurId, 'ModifierActiviteCoordination', activite)
  }
