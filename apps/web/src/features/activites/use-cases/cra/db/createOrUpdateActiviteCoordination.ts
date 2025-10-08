import { CraAnimationData } from '@app/web/features/activites/use-cases/cra/animation/validation/CraAnimationValidation'
import { craDureeDataToMinutes } from '@app/web/features/activites/use-cases/cra/db/minutesToCraDuree'
import { CraEvenementData } from '@app/web/features/activites/use-cases/cra/evenement/validation/CraEvenementValidation'
import { CraPartenariatData } from '@app/web/features/activites/use-cases/cra/partenariat/validation/CraPartenariatValidation'
import { prismaClient } from '@app/web/prismaClient'
import { addMutationLog } from '@app/web/utils/addMutationLog'
import { createStopwatch } from '@app/web/utils/stopwatch'
import { Prisma } from '@prisma/client'
import { v4 } from 'uuid'

export type CreateOrUpdateActiviteCoordinationInput =
  | {
      type: 'Animation'
      data: CraAnimationData
    }
  | {
      type: 'Evenement'
      data: CraEvenementData
    }
  | {
      type: 'Partenariat'
      data: CraPartenariatData
    }

const activiteDataForType = (
  input: CreateOrUpdateActiviteCoordinationInput,
) => {
  if (input.type === 'Animation') {
    const data = input.data
    return {
      duree: craDureeDataToMinutes(data.duree),
      mediateurs: data.mediateurs,
      structures: data.structures,
      autresActeurs: data.autresActeurs,
      typeAnimation: data.typeAnimation,
      ...(data.typeAnimation === 'Autre'
        ? { typeAnimationAutre: data.typeAnimationAutre }
        : {}),
      initiative: data.initiative,
      thematiquesAnimation: data.thematiquesAnimation,
      ...(data.thematiquesAnimation.includes('Autre')
        ? { thematiqueAnimationAutre: data.thematiqueAnimationAutre }
        : {}),
    }
  }

  if (input.type === 'Evenement') {
    const data = input.data
    return {
      participants: data.participants,
      nomEvenement: data.nomEvenement,
      typeEvenement: data.typeEvenement,
      ...(data.typeEvenement === 'Autre'
        ? { typeEvenementAutre: data.typeEvenementAutre }
        : {}),
      organisateurs: data.organisateurs,
      ...(data.organisateurs.includes('Autre')
        ? { organisateurAutre: data.organisateurAutre }
        : {}),
      echelonTerritorial: data.echelonTerritorial,
    }
  }

  if (input.type === 'Partenariat') {
    const data = input.data
    return {
      naturePartenariat: data.naturePartenariat,
      ...(data.naturePartenariat.includes('Autre')
        ? { naturePartenariatAutre: data.naturePartenariatAutre }
        : {}),
      echelonTerritorial: data.echelonTerritorial,
      structuresPartenaires: data.structuresPartenaires,
    }
  }
}

export const createOrUpdateActiviteCoordination = async ({
  input,
  userId,
  coordinateurId,
}: {
  input: CreateOrUpdateActiviteCoordinationInput
  userId: string
  coordinateurId: string
}) => {
  const stopwatch = createStopwatch()

  const creationId = v4()

  const existingActivite = input.data.id
    ? await prismaClient.activiteCoordination.findUnique({
        where: { id: input.data.id },
        select: {
          id: true,
          coordinateurId: true,
        },
      })
    : null

  const activiteData = {
    date: new Date(input.data.date),
    coordinateur: { connect: { id: coordinateurId } },
    notes: input.data.notes,
    ...activiteDataForType(input),
  } satisfies Prisma.ActiviteCoordinationUpdateInput

  if (existingActivite) {
    await prismaClient.$transaction(async (transaction) => {
      await transaction.activitesCoordinationTags.deleteMany({
        where: {
          activiteCoordinationId: existingActivite.id,
        },
      })

      await transaction.activitesCoordinationTags.createMany({
        data: input.data.tags.map((tag) => ({
          activiteCoordinationId: existingActivite.id,
          tagId: tag.id,
        })),
      })

      await transaction.activiteCoordination.update({
        where: { id: existingActivite.id },
        data: {
          ...activiteData,
          modification: new Date(),
        },
      })
    })

    // Create mutation for audit log
    addMutationLog({
      userId,
      nom: 'ModifierActiviteCoordination',
      duration: stopwatch.stop().duration,
      data: input,
    })

    return {
      type: input.type,
    }
  }

  await prismaClient.$transaction(async (transaction) => {
    await transaction.activiteCoordination.create({
      data: {
        ...activiteData,
        type: input.type,
        id: creationId,
      },
      select: { id: true },
    })

    await transaction.activitesCoordinationTags.createMany({
      data: input.data.tags.map((tag) => ({
        activiteCoordinationId: creationId,
        tagId: tag.id,
      })),
    })
  })

  // Create mutation for audit log
  addMutationLog({
    userId,
    nom: 'CreerActiviteCoordination',
    duration: stopwatch.stop().duration,
    data: input,
  })

  return {
    id: creationId,
    type: input.type,
  }
}
