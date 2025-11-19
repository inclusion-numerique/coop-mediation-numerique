import { output } from '@app/cli/output'
import { prismaClient } from '@app/web/prismaClient'
import { FixTagsJob } from './fixTagsJob'

const mediateursHaving = async (selectedTag: { id: string; nom: string }) =>
  await prismaClient.mediateur.findMany({
    select: {
      id: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    where: {
      activites: {
        some: { tags: { some: { tag: { id: selectedTag.id } } } },
      },
    },
  })

const coordinateursHaving = async (selectedTag: { id: string; nom: string }) =>
  await prismaClient.coordinateur.findMany({
    select: {
      id: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    where: {
      ActiviteCoordination: {
        some: { tags: { some: { tag: { id: selectedTag.id } } } },
      },
    },
  })

const createMediateurTag =
  (selectedTag: { id: string; nom: string }) =>
  async ({ id }: { id: string }) => {
    const existing = await prismaClient.tag.findFirst({
      where: {
        nom: selectedTag.nom,
        mediateurId: id,
      },
    })

    if (existing) return

    return prismaClient.tag.create({
      data: {
        nom: selectedTag.nom,
        mediateur: { connect: { id } },
      },
    })
  }

const createCoordinateurTag =
  (selectedTag: { id: string; nom: string }) =>
  async ({ id }: { id: string }) => {
    const existing = await prismaClient.tag.findFirst({
      where: {
        nom: selectedTag.nom,
        coordinateurId: id,
      },
    })

    if (existing) return

    return prismaClient.tag.create({
      data: {
        nom: selectedTag.nom,
        coordinateur: { connect: { id } },
      },
    })
  }

const activitiesMediationWithTag = async (selectedTag: {
  id: string
  nom: string
}) =>
  await prismaClient.activite.findMany({
    where: {
      tags: {
        some: { tag: { id: selectedTag.id } },
      },
    },
  })

const activitiesCoordinationWithTag = async (selectedTag: {
  id: string
  nom: string
}) =>
  await prismaClient.activiteCoordination.findMany({
    where: {
      tags: {
        some: { tag: { id: selectedTag.id } },
      },
    },
  })

const replaceWithMediateurTag =
  (selectedTag: { id: string; nom: string }) =>
  async ({
    mediateurId,
    id: activiteId,
  }: {
    mediateurId: string
    id: string
  }) => {
    const newTag = await prismaClient.tag.findFirst({
      where: {
        nom: selectedTag.nom,
        mediateurId: mediateurId,
      },
    })

    if (!newTag) {
      output(`No new tag found for mediateur ${mediateurId}`)
      return
    }

    await prismaClient.activitesTags.delete({
      where: {
        activiteId_tagId: {
          activiteId,
          tagId: selectedTag.id,
        },
      },
    })

    await prismaClient.activitesTags.create({
      data: {
        activiteId,
        tagId: newTag.id,
      },
    })
  }

const replaceWithCoordinateurTag =
  (selectedTag: { id: string; nom: string }) =>
  async ({
    coordinateurId,
    id: activiteCoordinationId,
  }: {
    coordinateurId: string
    id: string
  }) => {
    const newTag = await prismaClient.tag.findFirst({
      where: {
        nom: selectedTag.nom,
        coordinateurId: coordinateurId,
      },
    })

    if (!newTag) {
      output(`No new tag found for coordinateur ${coordinateurId}`)
      return
    }

    await prismaClient.activitesCoordinationTags.delete({
      where: {
        activiteCoordinationId_tagId: {
          activiteCoordinationId,
          tagId: selectedTag.id,
        },
      },
    })

    await prismaClient.activitesCoordinationTags.create({
      data: {
        activiteCoordinationId,
        tagId: newTag.id,
      },
    })
  }

const deleteTag = (selectedTag: { id: string; nom: string }) =>
  prismaClient.tag.delete({
    where: { id: selectedTag.id },
  })

export const executeFixTags = async (_job: FixTagsJob) => {
  const TAGS_TO_REMOVE = [
    {
      id: 'f836e256-d8a4-4fcd-a148-0961b032a6ce',
      nom: 'Mobilité',
    },
    {
      id: '874177cb-c862-4fc3-a7e1-fb77b13bde2b',
      nom: 'Simulation automobile',
    },
    {
      id: '20279ee2-9530-4048-ac91-edc8a3689479',
      nom: 'Autonomie Numérique',
    },
  ]

  for (const tag of TAGS_TO_REMOVE) {
    const mediateurs = await mediateursHaving(tag)
    await Promise.all(mediateurs.map(createMediateurTag(tag)))
    await Promise.all(
      (await activitiesMediationWithTag(tag)).map(replaceWithMediateurTag(tag)),
    )

    const coordinateurs = await coordinateursHaving(tag)
    await Promise.all(coordinateurs.map(createCoordinateurTag(tag)))
    await Promise.all(
      (await activitiesCoordinationWithTag(tag)).map(
        replaceWithCoordinateurTag(tag),
      ),
    )

    await deleteTag(tag)
  }

  return {
    success: true,
  }
}
