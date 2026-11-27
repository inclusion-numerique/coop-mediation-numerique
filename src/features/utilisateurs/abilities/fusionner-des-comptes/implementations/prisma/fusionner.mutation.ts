import { prismaClient } from '@/configuration/prisma'
import type { SynchroniserLaPersonne } from '@/features/utilisateurs/implementations/prisma/registre-des-personnes.mutation'
import type { Prisma } from '@/generated/prisma/client'
import type { FusionAutorisee, RoleDeFusion } from '../../domain'

type Tx = Prisma.TransactionClient

const absentsDe =
  (presents: readonly string[]) =>
  (valeur: string): boolean =>
    !presents.includes(valeur)

type ParRole = Readonly<Record<RoleDeFusion['_tag'], () => Promise<unknown>>>

const enSuite = <T>(
  elements: readonly T[],
  effectuer: (element: T) => Promise<unknown>,
): Promise<void> =>
  elements.reduce<Promise<void>>(async (precedent, element) => {
    await precedent
    await effectuer(element)
  }, Promise.resolve())

const creerLeRole = (tx: Tx, cibleId: string): ParRole => ({
  Mediateur: () => tx.mediateur.create({ data: { userId: cibleId } }),
  Coordinateur: () => tx.coordinateur.create({ data: { userId: cibleId } }),
})

const mediateurSelect = {
  id: true,
  coordinations: { select: { coordinateurId: true } },
  enActivite: { select: { structureId: true } },
  user: { select: { email: true } },
} satisfies Prisma.MediateurSelect

const coordinateurSelect = {
  id: true,
  invitations: { select: { email: true } },
  mediateursCoordonnes: { select: { mediateurId: true } },
} satisfies Prisma.CoordinateurSelect

const mediateurDuCompte = (tx: Tx, userId: string) =>
  tx.mediateur.findUniqueOrThrow({
    where: { userId },
    select: mediateurSelect,
  })

const coordinateurDuCompte = (tx: Tx, userId: string) =>
  tx.coordinateur.findUniqueOrThrow({
    where: { userId },
    select: coordinateurSelect,
  })

type MediateurDesRoles = Awaited<ReturnType<typeof mediateurDuCompte>>
type CoordinateurDesRoles = Awaited<ReturnType<typeof coordinateurDuCompte>>

const adresse = (email: string): Prisma.StringFilter => ({
  equals: email,
  mode: 'insensitive',
})

const invitationsDe = (
  mediateurId: string,
  email: string,
): Prisma.InvitationEquipeWhereInput => ({
  OR: [{ mediateurId }, { email: adresse(email) }],
})

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

  await tx.partageStatistiques.deleteMany({
    where: { mediateurId: sourceId },
  })

  const invitationsDeLaSource = invitationsDe(sourceId, source.email)
  const invitationsDeLaCible = invitationsDe(cibleId, cible.email)

  const equipesDeLaCible = (
    await tx.invitationEquipe.findMany({
      where: invitationsDeLaCible,
      select: { coordinateurId: true },
    })
  ).map(({ coordinateurId }) => coordinateurId)

  await tx.invitationEquipe.updateMany({
    where: { email: adresse(cible.email), mediateurId: null },
    data: { mediateurId: cibleId },
  })
  await tx.invitationEquipe.updateMany({
    where: {
      ...invitationsDeLaSource,
      coordinateurId: { notIn: equipesDeLaCible },
    },
    data: { mediateurId: cibleId, email: cible.email },
  })
  await tx.invitationEquipe.deleteMany({ where: invitationsDeLaSource })

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

  await tx.partageStatistiques.deleteMany({
    where: { coordinateurId: source.id },
  })

  await tx.activiteCoordination.updateMany({
    where: { coordinateurId: source.id },
    data: { coordinateurId: cible.id },
  })
  await tx.tag.updateMany({
    where: { coordinateurId: source.id },
    data: { coordinateurId: cible.id },
  })
}

const personneDe = (tx: Tx, coopId: string) =>
  tx.personneMain.findUnique({ where: { coopId }, select: { id: true } })

const fusionnerLesPersonnes = async (
  tx: Tx,
  sourceId: string,
  cibleId: string,
) => {
  const [personneSource, personneCible] = await Promise.all([
    personneDe(tx, sourceId),
    personneDe(tx, cibleId),
  ])

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

const fusionnerLeRole = (
  tx: Tx,
  sourceId: string,
  cibleId: string,
): ParRole => ({
  Mediateur: async () => {
    const [source, cible] = await Promise.all([
      mediateurDuCompte(tx, sourceId),
      mediateurDuCompte(tx, cibleId),
    ])
    await fusionnerLesMediateurs(
      tx,
      { email: source.user.email, mediateur: source },
      { email: cible.user.email, mediateur: cible },
    )
  },
  Coordinateur: async () => {
    const [source, cible] = await Promise.all([
      coordinateurDuCompte(tx, sourceId),
      coordinateurDuCompte(tx, cibleId),
    ])
    await fusionnerLesCoordinateurs(tx, source, cible)
  },
})

const revoquerLePartage = (
  tx: Tx,
  cibleId: string,
  revoqueLe: Date,
): ParRole => ({
  Mediateur: () =>
    tx.partageStatistiques.updateMany({
      where: { mediateur: { userId: cibleId } },
      data: { deleted: revoqueLe },
    }),
  Coordinateur: () =>
    tx.partageStatistiques.updateMany({
      where: { coordinateur: { userId: cibleId } },
      data: { deleted: revoqueLe },
    }),
})

export const fusionner =
  (synchroniserLaPersonne: SynchroniserLaPersonne) =>
  async ({ source, cible, plan }: FusionAutorisee): Promise<void> => {
    await prismaClient.$transaction(
      async (tx) => {
        await enSuite(plan.rolesACreer, (role) =>
          creerLeRole(tx, cible.id)[role._tag](),
        )
        await enSuite(plan.partagesARevoquer, (role) =>
          revoquerLePartage(tx, cible.id, plan.revoqueLe)[role._tag](),
        )
        await enSuite(plan.rolesAFusionner, (role) =>
          fusionnerLeRole(tx, source.id, cible.id)[role._tag](),
        )
        await fusionnerLesPersonnes(tx, source.id, cible.id)
        await reattribuerLesTraces(tx, source.id, cible.id)
        await transfererLesLiaisons(tx, source.id, cible.id)
        await retirerLaSource(tx, source.id)
        await synchroniserLaPersonne(tx, cible.id)
      },
      { timeout: 60_000 },
    )
  }
