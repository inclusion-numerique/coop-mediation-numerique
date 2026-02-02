import {
  deleteBrevoContact,
  deploymentCanDeleteBrevoContact,
} from '@app/web/external-apis/brevo/deleteBrevoContact'
import { conseillerNumeriqueMongoCollection } from '@app/web/external-apis/conseiller-numerique/conseillerNumeriqueMongoClient'
import { prismaClient } from '@app/web/prismaClient'
import { PrismaClient } from '@prisma/client'

type PrismaTransaction = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>

const includeCoordinateur = {
  mediateur: {
    select: { id: true },
  },
  coordinateur: {
    select: { id: true },
  },
}

const include = {
  coordinateur: {
    include: {
      invitations: true,
      mediateursCoordonnes: {
        include: {
          mediateur: {
            select: { id: true },
          },
        },
      },
      ActiviteCoordination: {
        select: { id: true },
      },
    },
  },
  mutations: {
    select: { id: true },
  },
  mediateur: {
    include: {
      beneficiaires: {
        select: { id: true },
      },
      activites: {
        select: { id: true },
      },
      invitations: true,
      coordinations: {
        include: {
          coordinateur: {
            select: { id: true },
          },
        },
      },
      enActivite: {
        include: {
          structure: {
            select: { id: true },
          },
        },
      },
    },
  },
  emplois: {
    include: {
      structure: {
        select: { id: true },
      },
    },
  },
}

type Coordinateur = {
  id: string
  mediateursCoordonnes: {
    mediateur: { id: string }
  }[]
  ActiviteCoordination: { id: string }[]
  invitations: { email: string; coordinateurId: string }[]
}

type Mediateur = {
  id: string
  beneficiaires: { id: string }[]
  activites: { id: string }[]
  coordinations: { coordinateur: { id: string } }[]
  enActivite: { structure: { id: string } }[]
  invitations: { coordinateurId: string }[]
}

const toId = ({ id }: { id: string }) => id

const toStructureId = ({ structure: { id } }: { structure: { id: string } }) =>
  id

const toCoordinationId = ({
  coordinateur: { id },
}: {
  coordinateur: { id: string }
}) => id

const toMediateurCoordooneId = ({
  mediateur: { id },
}: {
  mediateur: { id: string }
}) => id

const toCoordinateurId = ({ coordinateurId }: { coordinateurId: string }) =>
  coordinateurId

const toMediateurEmail = ({ email }: { email: string }) => email

const notIn = (values: string[]) => (value: string) => !values.includes(value)

const mergeInvitationsRecues =
  (prisma: PrismaTransaction) =>
  async (
    sourceUser: { email: string; mediateur: Mediateur },
    targetUser: { email: string; mediateur: Mediateur },
  ) => {
    const sourceMediateurInvitationIds =
      sourceUser.mediateur.invitations.map(toCoordinateurId)

    const targetMediateurInvitationIds =
      targetUser.mediateur.invitations.map(toCoordinateurId)

    await prisma.invitationEquipe.updateMany({
      where: {
        email: sourceUser.email,
        coordinateurId: {
          in: sourceMediateurInvitationIds.filter(
            notIn(targetMediateurInvitationIds),
          ),
        },
      },
      data: { mediateurId: targetUser.mediateur.id, email: targetUser.email },
    })

    await prisma.invitationEquipe.deleteMany({
      where: { email: sourceUser.email },
    })
  }

const mergeLieuxActivite =
  (prisma: PrismaTransaction) =>
  async (
    { mediateur: sourceMediateur }: { mediateur: Mediateur },
    { mediateur: targetMediateur }: { mediateur: Mediateur },
  ) => {
    const sourceLieuActiviteIds = sourceMediateur.enActivite.map(toStructureId)
    const targetLieuxActiviteIds = targetMediateur.enActivite.map(toStructureId)

    await prisma.mediateurEnActivite.updateMany({
      where: {
        mediateurId: sourceMediateur.id,
        structureId: {
          in: sourceLieuActiviteIds.filter(notIn(targetLieuxActiviteIds)),
        },
      },
      data: { mediateurId: targetMediateur.id },
    })

    await prisma.mediateurEnActivite.deleteMany({
      where: { mediateurId: sourceMediateur.id },
    })
  }

const mergeEquipes =
  (prisma: PrismaTransaction) =>
  async (
    { mediateur: sourceMediateur }: { mediateur: Mediateur },
    { mediateur: targetMediateur }: { mediateur: Mediateur },
  ) => {
    const sourceCoordIds = sourceMediateur.coordinations.map(toCoordinationId)
    const targetCoordIds = targetMediateur.coordinations.map(toCoordinationId)

    await prisma.mediateurCoordonne.updateMany({
      where: {
        mediateurId: sourceMediateur.id,
        coordinateurId: { in: sourceCoordIds.filter(notIn(targetCoordIds)) },
      },
      data: { mediateurId: targetMediateur.id },
    })

    await prisma.mediateurCoordonne.deleteMany({
      where: { mediateurId: sourceMediateur.id },
    })
  }

type PartageStatistiques = { id: string; deleted: Date | null } | null

const applyPartageStatistiquesMergeRule =
  (prisma: PrismaTransaction) =>
  async (
    sourcePartage: PartageStatistiques,
    targetPartage: PartageStatistiques,
  ) => {
    const sourceActif = sourcePartage != null && sourcePartage.deleted == null
    const targetActif = targetPartage != null && targetPartage.deleted == null

    if (sourcePartage != null) {
      await prisma.partageStatistiques.delete({
        where: { id: sourcePartage.id },
      })
    }

    if (!sourceActif && targetActif) {
      await prisma.partageStatistiques.update({
        where: { id: targetPartage.id },
        data: { deleted: new Date() },
      })
    }
  }

const mergePartageStatistiquesMediateur =
  (prisma: PrismaTransaction) =>
  async (sourceMediateurId: string, targetMediateurId: string) => {
    const sourcePartage = await prisma.partageStatistiques.findUnique({
      where: { mediateurId: sourceMediateurId },
    })
    const targetPartage = await prisma.partageStatistiques.findUnique({
      where: { mediateurId: targetMediateurId },
    })

    await applyPartageStatistiquesMergeRule(prisma)(
      sourcePartage,
      targetPartage,
    )
  }

const mergeMediateurs =
  (prisma: PrismaTransaction) =>
  async (
    sourceUser: { email: string; mediateur: Mediateur | null },
    targetUser: { email: string; mediateur: Mediateur | null },
  ) => {
    if (sourceUser.mediateur == null || targetUser.mediateur == null) return

    await prisma.activite.updateMany({
      where: { id: { in: sourceUser.mediateur.activites.map(toId) } },
      data: { mediateurId: targetUser.mediateur.id },
    })
    await prisma.tag.updateMany({
      where: { mediateurId: sourceUser.mediateur.id },
      data: { mediateurId: targetUser.mediateur.id },
    })
    await prisma.beneficiaire.updateMany({
      where: { id: { in: sourceUser.mediateur.beneficiaires.map(toId) } },
      data: { mediateurId: targetUser.mediateur.id },
    })
    await mergePartageStatistiquesMediateur(prisma)(
      sourceUser.mediateur.id,
      targetUser.mediateur.id,
    )
    await mergeInvitationsRecues(prisma)(
      { email: sourceUser.email, mediateur: sourceUser.mediateur },
      { email: targetUser.email, mediateur: targetUser.mediateur },
    )
    await mergeLieuxActivite(prisma)(
      { mediateur: sourceUser.mediateur },
      { mediateur: targetUser.mediateur },
    )
    await mergeEquipes(prisma)(
      { mediateur: sourceUser.mediateur },
      { mediateur: targetUser.mediateur },
    )
  }

const mergeInvitationEnvoyees =
  (prisma: PrismaTransaction) =>
  async (
    sourceCoordinateur: Coordinateur,
    targetCoordinateur: Coordinateur,
  ) => {
    const sourceEmails = sourceCoordinateur.invitations.map(toMediateurEmail)
    const targetEmails = targetCoordinateur.invitations.map(toMediateurEmail)

    await prisma.invitationEquipe.updateMany({
      where: {
        email: { in: sourceEmails.filter(notIn(targetEmails)) },
        coordinateurId: sourceCoordinateur.id,
      },
      data: { coordinateurId: targetCoordinateur.id },
    })

    await prisma.invitationEquipe.deleteMany({
      where: { coordinateurId: sourceCoordinateur.id },
    })
  }

const mergeMediateursCoordonnes =
  (prisma: PrismaTransaction) =>
  async (
    sourceCoordinateur: Coordinateur,
    targetCoordinateur: Coordinateur,
  ) => {
    const sourceMedIds =
      sourceCoordinateur?.mediateursCoordonnes.map(toMediateurCoordooneId) ?? []
    const targetMedIds =
      targetCoordinateur?.mediateursCoordonnes.map(toMediateurCoordooneId) ?? []

    await prisma.mediateurCoordonne.updateMany({
      where: {
        mediateurId: { in: sourceMedIds.filter(notIn(targetMedIds)) },
        coordinateurId: sourceCoordinateur.id,
      },
      data: { coordinateurId: targetCoordinateur.id },
    })

    await prisma.mediateurCoordonne.deleteMany({
      where: { coordinateurId: sourceCoordinateur.id },
    })
  }

const mergePartageStatistiquesCoordinateur =
  (prisma: PrismaTransaction) =>
  async (sourceCoordinateurId: string, targetCoordinateurId: string) => {
    const sourcePartage = await prisma.partageStatistiques.findUnique({
      where: { coordinateurId: sourceCoordinateurId },
    })
    const targetPartage = await prisma.partageStatistiques.findUnique({
      where: { coordinateurId: targetCoordinateurId },
    })

    await applyPartageStatistiquesMergeRule(prisma)(
      sourcePartage,
      targetPartage,
    )
  }

const mergeCoordinateurs =
  (prisma: PrismaTransaction) =>
  async (
    { coordinateur: sourceCoord }: { coordinateur: Coordinateur | null },
    { coordinateur: targetCoord }: { coordinateur: Coordinateur | null },
  ) => {
    if (sourceCoord == null || targetCoord == null) return

    await mergeInvitationEnvoyees(prisma)(sourceCoord, targetCoord)
    await mergeMediateursCoordonnes(prisma)(sourceCoord, targetCoord)
    await mergePartageStatistiquesCoordinateur(prisma)(
      sourceCoord.id,
      targetCoord.id,
    )

    await prisma.activiteCoordination.updateMany({
      where: { id: { in: sourceCoord.ActiviteCoordination.map(toId) } },
      data: { coordinateurId: targetCoord.id },
    })
    await prisma.tag.updateMany({
      where: { coordinateurId: sourceCoord.id },
      data: { coordinateurId: targetCoord.id },
    })
  }

const mergeStructuresEmployeuses =
  (prisma: PrismaTransaction) =>
  async (
    sourceUser: {
      id: string
      emplois: { structure: { id: string } }[]
    },
    targetUser: {
      id: string
      emplois: { structure: { id: string } }[]
    },
  ) => {
    const targetStructureIds = targetUser.emplois.map(toStructureId)
    const sourceStructureIds = sourceUser.emplois.map(toStructureId)

    await prisma.employeStructure.updateMany({
      where: {
        userId: sourceUser.id,
        structureId: {
          in: sourceStructureIds.filter(notIn(targetStructureIds)),
        },
      },
      data: { userId: targetUser.id },
    })

    await prisma.employeStructure.deleteMany({
      where: { userId: sourceUser.id },
    })
  }

const mergeMutations =
  (prisma: PrismaTransaction) =>
  async (
    sourceUser: { id: string; mutations: { id: string }[] },
    targetUser: { id: string; mutations: { id: string }[] },
  ) => {
    await prisma.mutation.updateMany({
      where: { userId: sourceUser.id },
      data: { userId: targetUser.id },
    })
  }

const deleteUser =
  (prisma: PrismaTransaction) =>
  async ({ id: userId }: { id: string; mediateur: { id: string } | null }) => {
    const rdvAccounts = await prisma.rdvAccount.findMany({
      where: { userId },
      select: { id: true },
    })
    const rdvAccountIds = rdvAccounts.map(({ id }) => id)

    if (rdvAccountIds.length > 0) {
      await prisma.rdv.deleteMany({
        where: { rdvAccountId: { in: rdvAccountIds } },
      })
      await prisma.rdvSyncLog.deleteMany({
        where: { rdvAccountId: { in: rdvAccountIds } },
      })
      await prisma.rdvAccountOrganisation.deleteMany({
        where: { accountId: { in: rdvAccountIds } },
      })
    }

    await prisma.rdvAccount.deleteMany({ where: { userId } })
    await prisma.session.deleteMany({ where: { userId } })
    await prisma.account.deleteMany({ where: { userId } })
    await prisma.coordinateur.deleteMany({ where: { userId } })
    await prisma.mediateur.deleteMany({ where: { userId } })
    await prisma.user.deleteMany({ where: { id: userId } })
  }

const initMediateurs =
  (prisma: PrismaTransaction) =>
  async (sourceUserId: string, targetUserId: string) => {
    const sourceMediateur = await prisma.mediateur.findUnique({
      where: { userId: sourceUserId },
    })

    const targetMediateur = await prisma.mediateur.findUnique({
      where: { userId: targetUserId },
    })

    if (sourceMediateur != null && targetMediateur == null) {
      await prisma.mediateur.create({ data: { userId: targetUserId } })
    }
  }

const initCoordinateurs =
  (prisma: PrismaTransaction) =>
  async (sourceUserId: string, targetUserId: string) => {
    const sourceUser = await prisma.user.findUnique({
      where: { id: sourceUserId },
      include: includeCoordinateur,
    })

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: includeCoordinateur,
    })

    if (sourceUser?.coordinateur != null && targetUser?.coordinateur == null) {
      await prisma.coordinateur.create({
        data: {
          userId: targetUserId,
        },
      })
    }
  }

const getUsers =
  (prisma: PrismaTransaction) =>
  async (sourceUserId: string, targetUserId: string) => ({
    sourceUser: await prisma.user.findUnique({
      where: { id: sourceUserId },
      include,
    }),
    targetUser: await prisma.user.findUnique({
      where: { id: targetUserId },
      include,
    }),
  })

const syncWithMongo =
  (prisma: PrismaTransaction) =>
  async ({
    id: userId,
    email,
  }: {
    id: string
    email: string
    mediateur?: { id: string } | null
    coordinateur?: { id: string } | null
  }) => {
    const conseillerCollection =
      await conseillerNumeriqueMongoCollection('conseillers')

    const mongoConseiller = await conseillerCollection.findOne({
      emailPro: email,
    })

    if (!mongoConseiller) return

    // Set isConseillerNumerique on User
    await prisma.user.update({
      where: { id: userId },
      data: {
        isConseillerNumerique: true,
      },
    })
  }

export const mergeUser = async (
  sourceUserId: string,
  targetUserId: string,
): Promise<void> => {
  const sourceUserForBrevo = await prismaClient.user.findUnique({
    where: { id: sourceUserId },
    select: { email: true },
  })

  await prismaClient.$transaction(async (prisma) => {
    await initMediateurs(prisma)(sourceUserId, targetUserId)
    await initCoordinateurs(prisma)(sourceUserId, targetUserId)

    const { sourceUser, targetUser } = await getUsers(prisma)(
      sourceUserId,
      targetUserId,
    )

    if (!sourceUser || !targetUser)
      throw new Error('One or both users not found')

    await mergeMediateurs(prisma)(sourceUser, targetUser)
    await mergeCoordinateurs(prisma)(sourceUser, targetUser)
    await mergeStructuresEmployeuses(prisma)(sourceUser, targetUser)
    await mergeMutations(prisma)(sourceUser, targetUser)
    await deleteUser(prisma)(sourceUser)
    await syncWithMongo(prisma)(targetUser)
  })

  if (sourceUserForBrevo && deploymentCanDeleteBrevoContact()) {
    await deleteBrevoContact(sourceUserForBrevo.email)
  }
}
