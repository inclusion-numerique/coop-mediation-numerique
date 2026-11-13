import { Prisma } from '@app/web/generated/prisma/client'
import { failure, type Result, success } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import { addMutationLog } from '@app/web/utils/addMutationLog'
import { v4 } from 'uuid'
import { activiteDeCoordinationVersLaBase } from '../../../../db/activite-de-coordination.transfer'
import {
  type ActiviteDeCoordination,
  ActiviteDeCoordinationId,
  ActiviteIntrouvable,
  type CoordinateurId,
  type DateTropLointaine,
  type TagInutilisable,
  type TagsUtilisables,
  TypeDActiviteIncompatible,
  tagsDeLaSaisie,
  type UtilisateurId,
} from '../../../../domain'
import {
  ActionNonAutorisee,
  type ActiviteEnregistree,
  activiteDeLaSaisie,
  type SaisieDeCoordination,
} from '../../domain'

export type EchecDEnregistrement =
  | ActionNonAutorisee
  | ActiviteIntrouvable
  | TypeDActiviteIncompatible
  | TagInutilisable
  | DateTropLointaine

type Enregistrement =
  | { readonly _tag: 'Creation'; readonly id: ActiviteDeCoordinationId }
  | {
      readonly _tag: 'Modification'
      readonly id: ActiviteDeCoordinationId
      readonly creation: Date
    }

const enregistrementDe = async (
  saisie: SaisieDeCoordination,
  coordinateurId: CoordinateurId,
): Promise<
  Result<Enregistrement, ActiviteIntrouvable | TypeDActiviteIncompatible>
> => {
  if (saisie.id === null) {
    return success({
      _tag: 'Creation',
      id: ActiviteDeCoordinationId(v4()),
    })
  }
  const activite = await prismaClient.activiteCoordination.findFirst({
    where: { id: saisie.id, coordinateurId, suppression: null },
    select: { type: true, creation: true },
  })
  if (activite === null) return failure(ActiviteIntrouvable())
  return activite.type === saisie._tag
    ? success({
        _tag: 'Modification',
        id: saisie.id,
        creation: activite.creation,
      })
    : failure(TypeDActiviteIncompatible())
}

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

export const enregistrerUneActiviteDeCoordination = async ({
  saisie,
  coordinateurId,
  auteurId,
  tagsUtilisables,
  maintenant = new Date(),
}: {
  readonly saisie: SaisieDeCoordination
  readonly coordinateurId: CoordinateurId | null
  readonly auteurId: UtilisateurId
  readonly tagsUtilisables: TagsUtilisables
  readonly maintenant?: Date
}): Promise<Result<ActiviteEnregistree, EchecDEnregistrement>> => {
  if (coordinateurId === null) return failure(ActionNonAutorisee())

  const enregistrement = await enregistrementDe(saisie, coordinateurId)
  if (!enregistrement.success) return enregistrement

  const tags = tagsDeLaSaisie(saisie.tags, await tagsUtilisables(saisie.tags))
  if (!tags.success) return tags

  const activite = activiteDeLaSaisie({
    saisie,
    id: enregistrement.data.id,
    coordinateurId,
    tags: tags.data,
    creation:
      enregistrement.data._tag === 'Modification'
        ? enregistrement.data.creation
        : maintenant,
    maintenant,
  })
  if (!activite.success) return activite

  await (enregistrement.data._tag === 'Creation'
    ? creer(activite.data)
    : modifier(activite.data))

  addMutationLog({
    userId: auteurId,
    nom:
      enregistrement.data._tag === 'Creation'
        ? 'CreerActiviteCoordination'
        : 'ModifierActiviteCoordination',
    duration: 0,
    data: { type: activite.data._tag, id: activite.data.id },
  })

  return success({ id: activite.data.id, type: activite.data._tag })
}
