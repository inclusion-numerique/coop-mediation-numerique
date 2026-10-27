import type { Prisma } from '@app/web/generated/prisma/client'
import { prismaClient } from '@app/web/prismaClient'
import type { FusionAutorisee } from '../../domain'

type Tx = Prisma.TransactionClient

const absentsDe =
  (presents: readonly string[]) =>
  (valeur: string): boolean =>
    !presents.includes(valeur)

const garantirLesRoles = async (tx: Tx, sourceId: string, cibleId: string) => {
  const [source, cible] = await Promise.all(
    [sourceId, cibleId].map((id) =>
      tx.user.findUniqueOrThrow({
        where: { id },
        select: {
          mediateur: { select: { id: true } },
          coordinateur: { select: { id: true } },
        },
      }),
    ),
  )

  if (source.mediateur !== null && cible.mediateur === null)
    await tx.mediateur.create({ data: { userId: cibleId } })
  if (source.coordinateur !== null && cible.coordinateur === null)
    await tx.coordinateur.create({ data: { userId: cibleId } })
}

const rolesDe = (tx: Tx, userId: string) =>
  tx.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      email: true,
      mediateur: {
        select: {
          id: true,
          invitations: { select: { coordinateurId: true } },
          coordinations: { select: { coordinateurId: true } },
          enActivite: { select: { structureId: true } },
        },
      },
      coordinateur: {
        select: {
          id: true,
          invitations: { select: { email: true } },
          mediateursCoordonnes: { select: { mediateurId: true } },
        },
      },
    },
  })

type Roles = Awaited<ReturnType<typeof rolesDe>>
type MediateurDesRoles = NonNullable<Roles['mediateur']>
type CoordinateurDesRoles = NonNullable<Roles['coordinateur']>

const fusionnerLePartage = async (
  tx: Tx,
  source: { id: string; deleted: Date | null } | null,
  cible: { id: string; deleted: Date | null } | null,
) => {
  if (source === null) return
  await tx.partageStatistiques.delete({ where: { id: source.id } })
  if (source.deleted !== null && cible !== null && cible.deleted === null)
    await tx.partageStatistiques.update({
      where: { id: cible.id },
      data: { deleted: new Date() },
    })
}

const fusionnerLesMediateurs = async (
  tx: Tx,
  source: { email: string; mediateur: MediateurDesRoles },
  cible: { email: string; mediateur: MediateurDesRoles },
) => {
  const sourceId = source.mediateur.id
  const cibleId = cible.mediateur.id

  await tx.activite.updateMany({
    where: { mediateurId: sourceId },
    data: { mediateurId: cibleId },
  })
  await tx.tag.updateMany({
    where: { mediateurId: sourceId },
    data: { mediateurId: cibleId },
  })
  await tx.beneficiaire.updateMany({
    where: { mediateurId: sourceId },
    data: { mediateurId: cibleId },
  })

  const compteurs = await tx.mediateur.findUniqueOrThrow({
    where: { id: sourceId },
    select: {
      activitesCount: true,
      accompagnementsCount: true,
      beneficiairesCount: true,
    },
  })
  await tx.mediateur.update({
    where: { id: cibleId },
    data: {
      activitesCount: { increment: compteurs.activitesCount },
      accompagnementsCount: { increment: compteurs.accompagnementsCount },
      beneficiairesCount: { increment: compteurs.beneficiairesCount },
    },
  })

  await fusionnerLePartage(
    tx,
    await tx.partageStatistiques.findUnique({
      where: { mediateurId: sourceId },
    }),
    await tx.partageStatistiques.findUnique({
      where: { mediateurId: cibleId },
    }),
  )

  await tx.invitationEquipe.updateMany({
    where: {
      email: source.email,
      coordinateurId: {
        in: source.mediateur.invitations
          .map(({ coordinateurId }) => coordinateurId)
          .filter(
            absentsDe(
              cible.mediateur.invitations.map(
                ({ coordinateurId }) => coordinateurId,
              ),
            ),
          ),
      },
    },
    data: { mediateurId: cibleId, email: cible.email },
  })
  await tx.invitationEquipe.deleteMany({ where: { email: source.email } })
  await tx.invitationEquipe.deleteMany({ where: { mediateurId: sourceId } })

  await tx.mediateurEnActivite.updateMany({
    where: {
      mediateurId: sourceId,
      structureId: {
        in: source.mediateur.enActivite
          .map(({ structureId }) => structureId)
          .filter(
            absentsDe(
              cible.mediateur.enActivite.map(({ structureId }) => structureId),
            ),
          ),
      },
    },
    data: { mediateurId: cibleId },
  })
  await tx.mediateurEnActivite.deleteMany({ where: { mediateurId: sourceId } })

  await tx.mediateurCoordonne.updateMany({
    where: {
      mediateurId: sourceId,
      coordinateurId: {
        in: source.mediateur.coordinations
          .map(({ coordinateurId }) => coordinateurId)
          .filter(
            absentsDe(
              cible.mediateur.coordinations.map(
                ({ coordinateurId }) => coordinateurId,
              ),
            ),
          ),
      },
    },
    data: { mediateurId: cibleId },
  })
  await tx.mediateurCoordonne.deleteMany({ where: { mediateurId: sourceId } })
}

const fusionnerLesCoordinateurs = async (
  tx: Tx,
  source: CoordinateurDesRoles,
  cible: CoordinateurDesRoles,
) => {
  await tx.invitationEquipe.updateMany({
    where: {
      coordinateurId: source.id,
      email: {
        in: source.invitations
          .map(({ email }) => email)
          .filter(absentsDe(cible.invitations.map(({ email }) => email))),
      },
    },
    data: { coordinateurId: cible.id },
  })
  await tx.invitationEquipe.deleteMany({ where: { coordinateurId: source.id } })

  await tx.mediateurCoordonne.updateMany({
    where: {
      coordinateurId: source.id,
      mediateurId: {
        in: source.mediateursCoordonnes
          .map(({ mediateurId }) => mediateurId)
          .filter(
            absentsDe(
              cible.mediateursCoordonnes.map(({ mediateurId }) => mediateurId),
            ),
          ),
      },
    },
    data: { coordinateurId: cible.id },
  })
  await tx.mediateurCoordonne.deleteMany({
    where: { coordinateurId: source.id },
  })

  await fusionnerLePartage(
    tx,
    await tx.partageStatistiques.findUnique({
      where: { coordinateurId: source.id },
    }),
    await tx.partageStatistiques.findUnique({
      where: { coordinateurId: cible.id },
    }),
  )

  await tx.activiteCoordination.updateMany({
    where: { coordinateurId: source.id },
    data: { coordinateurId: cible.id },
  })
  await tx.tag.updateMany({
    where: { coordinateurId: source.id },
    data: { coordinateurId: cible.id },
  })
}

const fusionnerLesPersonnes = async (
  tx: Tx,
  sourceId: string,
  cibleId: string,
) => {
  const [personneSource, personneCible] = await Promise.all(
    [sourceId, cibleId].map((coopId) =>
      tx.personneMain.findUnique({ where: { coopId }, select: { id: true } }),
    ),
  )

  if (personneSource === null) return

  if (personneCible === null) {
    await tx.personneMain.update({
      where: { id: personneSource.id },
      data: { coopId: cibleId },
    })
    return
  }

  const clesCible = new Set(
    (
      await tx.personneAffectationEmploiMain.findMany({
        where: { personneId: personneCible.id },
        select: { structureAdministrativeId: true, source: true },
      })
    ).map(
      ({ structureAdministrativeId, source }) =>
        `${structureAdministrativeId}:${source}`,
    ),
  )

  const deplacables = (
    await tx.personneAffectationEmploiMain.findMany({
      where: { personneId: personneSource.id },
      select: { id: true, structureAdministrativeId: true, source: true },
    })
  )
    .filter(
      ({ structureAdministrativeId, source }) =>
        !clesCible.has(`${structureAdministrativeId}:${source}`),
    )
    .map(({ id }) => id)

  await tx.personneAffectationEmploiMain.updateMany({
    where: { id: { in: deplacables } },
    data: { personneId: personneCible.id },
  })
  await tx.personneAffectationEmploiMain.deleteMany({
    where: { personneId: personneSource.id },
  })

  await tx.contratMain.updateMany({
    where: { personneId: personneSource.id },
    data: { personneId: personneCible.id },
  })
  await tx.formationMain.updateMany({
    where: { personneId: personneSource.id },
    data: { personneId: personneCible.id },
  })

  const postesCible = new Set(
    (
      await tx.posteMain.findMany({
        where: { personneId: personneCible.id, structureId: { not: null } },
        select: { posteConumId: true, structureId: true },
      })
    ).map(({ posteConumId, structureId }) => `${posteConumId}:${structureId}`),
  )

  const postesDeplacables = (
    await tx.posteMain.findMany({
      where: { personneId: personneSource.id },
      select: { id: true, posteConumId: true, structureId: true },
    })
  )
    .filter(
      ({ posteConumId, structureId }) =>
        !postesCible.has(`${posteConumId}:${structureId}`),
    )
    .map(({ id }) => id)

  await tx.posteMain.updateMany({
    where: { id: { in: postesDeplacables } },
    data: { personneId: personneCible.id },
  })
  await tx.posteMain.updateMany({
    where: { personneId: personneSource.id },
    data: { personneId: null },
  })
  await tx.personneMain.delete({ where: { id: personneSource.id } })
}

const reattribuerLesTraces = async (
  tx: Tx,
  sourceId: string,
  cibleId: string,
) => {
  await tx.mutation.updateMany({
    where: { userId: sourceId },
    data: { userId: cibleId },
  })
  await tx.lieuInclusion.updateMany({
    where: { creationParId: sourceId },
    data: { creationParId: cibleId },
  })
  await tx.lieuInclusion.updateMany({
    where: { derniereModificationParId: sourceId },
    data: { derniereModificationParId: cibleId },
  })
  await tx.lieuInclusion.updateMany({
    where: { suppressionParId: sourceId },
    data: { suppressionParId: cibleId },
  })
  await tx.mediateurEnActivite.updateMany({
    where: { creationParId: sourceId },
    data: { creationParId: cibleId },
  })
  await tx.mediateurEnActivite.updateMany({
    where: { derniereModificationParId: sourceId },
    data: { derniereModificationParId: cibleId },
  })
  await tx.mediateurEnActivite.updateMany({
    where: { suppressionParId: sourceId },
    data: { suppressionParId: cibleId },
  })
  await tx.session.updateMany({
    where: { usurperId: sourceId },
    data: { usurperId: null },
  })
}

const transfererLesLiaisons = async (
  tx: Tx,
  sourceId: string,
  cibleId: string,
) => {
  await tx.account.updateMany({
    where: { userId: sourceId },
    data: { userId: cibleId },
  })

  const compteRdvDeLaCible = await tx.rdvAccount.findUnique({
    where: { userId: cibleId },
    select: { id: true },
  })

  if (compteRdvDeLaCible === null) {
    await tx.rdvAccount.updateMany({
      where: { userId: sourceId },
      data: { userId: cibleId },
    })
    return
  }

  const comptesRdvDeLaSource = (
    await tx.rdvAccount.findMany({
      where: { userId: sourceId },
      select: { id: true },
    })
  ).map(({ id }) => id)

  await tx.rdv.deleteMany({
    where: { rdvAccountId: { in: comptesRdvDeLaSource } },
  })
  await tx.rdvSyncLog.deleteMany({
    where: { rdvAccountId: { in: comptesRdvDeLaSource } },
  })
  await tx.rdvAccountOrganisation.deleteMany({
    where: { accountId: { in: comptesRdvDeLaSource } },
  })
  await tx.rdvAccount.deleteMany({ where: { userId: sourceId } })
}

const retirerLaSource = async (tx: Tx, sourceId: string) => {
  await tx.session.deleteMany({ where: { userId: sourceId } })
  await tx.coordinateur.deleteMany({ where: { userId: sourceId } })
  await tx.mediateur.deleteMany({ where: { userId: sourceId } })
  await tx.user.delete({ where: { id: sourceId } })
}

export const fusionner = async ({
  source,
  cible,
}: FusionAutorisee): Promise<void> => {
  await prismaClient.$transaction(
    async (tx) => {
      await garantirLesRoles(tx, source.id, cible.id)

      const [rolesSource, rolesCible] = await Promise.all([
        rolesDe(tx, source.id),
        rolesDe(tx, cible.id),
      ])

      if (rolesSource.mediateur !== null && rolesCible.mediateur !== null)
        await fusionnerLesMediateurs(
          tx,
          { email: rolesSource.email, mediateur: rolesSource.mediateur },
          { email: rolesCible.email, mediateur: rolesCible.mediateur },
        )

      if (rolesSource.coordinateur !== null && rolesCible.coordinateur !== null)
        await fusionnerLesCoordinateurs(
          tx,
          rolesSource.coordinateur,
          rolesCible.coordinateur,
        )

      await fusionnerLesPersonnes(tx, source.id, cible.id)
      await reattribuerLesTraces(tx, source.id, cible.id)
      await transfererLesLiaisons(tx, source.id, cible.id)
      await retirerLaSource(tx, source.id)
    },
    { timeout: 60_000 },
  )
}
