import { prismaClient } from '@app/web/prismaClient'
import { getUserDisplayName, UserDisplayName } from '@app/web/utils/user'

type MergeUser = UserDisplayName & {
  id: string
  emplois: { structure: { id: string } }[]
  mediateur: {
    activites: { id: string }[]
    beneficiaires: { id: string }[]
    enActivite: { structure: { id: string } }[]
    coordinations: { coordinateur: { id: string } }[]
    tags: { id: string }[]
    invitations: {
      email: string
      coordinateurId: string
      mediateurId: string | null
    }[]
  } | null
  coordinateur: {
    Tag: { id: string }[]
    invitations: {
      email: string
      coordinateurId: string
      mediateurId: string | null
    }[]
    mediateursCoordonnes: { mediateur: { id: string } }[]
  } | null
  mutations: { id: string }[]
  deleted: Date | null
}

export type MergeData = {
  coordinationsIds: string[]
  mediateursCoordonnesIds: string[]
  beneficiaireIds: string[]
  activitesIds: string[]
  structureEmployeusesIds: string[]
  lieuxActiviteIds: string[]
  invitationsRecues: string[]
  invitationsEnvoyees: string[]
  mutationsIds: string[]
  tags: string[]
}

export type MergeInfo = MergeData & {
  id: string
  email: string
  name: string
}

const include = {
  mediateur: {
    include: {
      beneficiaires: {
        select: { id: true },
        where: { suppression: null },
      },
      activites: {
        where: { suppression: null },
      },
      tags: {
        select: { id: true },
      },
      invitations: true,
      coordinations: {
        where: { suppression: null },
        include: {
          coordinateur: {
            select: { id: true },
          },
        },
      },
      enActivite: {
        where: { suppression: null, fin: null },
        include: {
          structure: {
            select: { id: true },
          },
        },
      },
    },
  },
  coordinateur: {
    include: {
      mediateursCoordonnes: {
        where: { suppression: null },
        include: {
          mediateur: {
            select: { id: true },
          },
        },
      },
      Tag: {
        select: { id: true },
      },
      invitations: true,
    },
  },
  emplois: {
    where: { suppression: null, fin: null },
    include: {
      structure: {
        select: { id: true },
      },
    },
  },
  mutations: true,
}

const toId = ({ id }: { id: string }) => id

const toStructureId = ({ structure }: { structure: { id: string } }) =>
  structure.id

const toCoordinateurId = ({ coordinateur }: { coordinateur: { id: string } }) =>
  coordinateur.id

const toMediateurId = ({ mediateur }: { mediateur: { id: string } }) =>
  mediateur.id

const toMergedIds = ({
  email,
  coordinateurId,
  mediateurId,
}: {
  email: string
  coordinateurId: string
  mediateurId: string | null
}) => `${email}-${coordinateurId}-${mediateurId}`

const toMergeInfo = (user: MergeUser) => ({
  id: user.id,
  email: user.email,
  name: getUserDisplayName(user),
  activitesIds: user.mediateur?.activites.map(toId) ?? [],
  beneficiaireIds: user.mediateur?.beneficiaires.map(toId) ?? [],
  structureEmployeusesIds: user.emplois.map(toStructureId) ?? [],
  lieuxActiviteIds: user.mediateur?.enActivite.map(toStructureId) ?? [],
  coordinationsIds: user.mediateur?.coordinations.map(toCoordinateurId) ?? [],
  mediateursCoordonnesIds:
    user.coordinateur?.mediateursCoordonnes.map(toMediateurId) ?? [],
  mutationsIds: user.mutations.map(toId) ?? [],
  tags: [
    ...(user.mediateur?.tags.map(toId) ?? []),
    ...(user.coordinateur?.Tag.map(toId) ?? []),
  ],
  invitationsRecues: user.mediateur?.invitations.map(toMergedIds) ?? [],
  invitationsEnvoyees: user.coordinateur?.invitations.map(toMergedIds) ?? [],
  deleted: user.deleted,
})

const toMergeCommon = (mergeSource: MergeData, mergeTarget: MergeData) => ({
  activitesIds: mergeSource.activitesIds.filter((id) =>
    mergeTarget.activitesIds.includes(id),
  ),
  beneficiaireIds: mergeSource.beneficiaireIds.filter((id) =>
    mergeTarget.beneficiaireIds.includes(id),
  ),
  structureEmployeusesIds: mergeSource.structureEmployeusesIds.filter((id) =>
    mergeTarget.structureEmployeusesIds.includes(id),
  ),
  lieuxActiviteIds: mergeSource.lieuxActiviteIds.filter((id) =>
    mergeTarget.lieuxActiviteIds.includes(id),
  ),
  coordinationsIds: mergeSource.coordinationsIds.filter((id) =>
    mergeTarget.coordinationsIds.includes(id),
  ),
  mediateursCoordonnesIds: mergeSource.mediateursCoordonnesIds.filter((id) =>
    mergeTarget.mediateursCoordonnesIds.includes(id),
  ),
  invitationsRecues: mergeSource.invitationsRecues.filter((id) =>
    mergeTarget.invitationsRecues.includes(id),
  ),
  invitationsEnvoyees: mergeSource.invitationsEnvoyees.filter((id) =>
    mergeTarget.invitationsEnvoyees.includes(id),
  ),
  mutationsIds: mergeSource.mutationsIds.filter((id) =>
    mergeTarget.mutationsIds.includes(id),
  ),
  tags: mergeSource.tags.filter((id) => mergeTarget.tags.includes(id)),
})

export const getMergeData = async (
  userSourceId: string,
  userTargetId: string,
) => {
  const userSource = await prismaClient.user.findUnique({
    where: { id: userSourceId },
    include,
  })

  const userTarget = await prismaClient.user.findUnique({
    where: { id: userTargetId },
    include,
  })

  if (!userSource || !userTarget) return null

  const mergeSource = toMergeInfo(userSource)
  const mergeTarget = toMergeInfo(userTarget)

  return {
    mergeSource,
    mergeTarget,
    mergeCommon: toMergeCommon(mergeSource, mergeTarget),
  }
}

export type MergeSourceAndTargetData = Awaited<ReturnType<typeof getMergeData>>
