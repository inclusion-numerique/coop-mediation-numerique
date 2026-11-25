import { prismaClient } from '@/configuration/prisma'
import { sansDrapeauDispositif } from '@/features/utilisateurs/fixtures/enregistrer-les-utilisateurs'
import {
  coordinations,
  personas,
} from '@/features/utilisateurs/fixtures/personas'
import {
  type EmployeuseDeDemonstration,
  garantirAffectationEmployeuse,
  garantirAffectationIdposte,
  garantirContratRompu,
  refleterCoordinateurDansMain,
} from '@/features/utilisateurs/fixtures/personnes-main-conseiller-numerique'
import type { Session } from '@/generated/prisma/client'

type Coordination = {
  coordinateurId: string
  mediateurIds: string[]
}

export type DonneesDeDemonstration = {
  readonly employeuse: EmployeuseDeDemonstration
  readonly semerLesActivitesDansLesLieux: (
    mediateurId: string,
  ) => Promise<unknown>
  readonly semerLesBeneficiaires: (mediateurId: string) => Promise<unknown>
  readonly semerLesCras: (mediateurId: string) => Promise<unknown>
  readonly semerLesCoordinations: (
    coordinations: Coordination[],
  ) => Promise<unknown>
}

const compteSelect = {
  id: true,
  isFixture: true,
  firstName: true,
  lastName: true,
  name: true,
  email: true,
  rdvAccount: { select: { id: true } },
  mediateur: { select: { id: true } },
  coordinateur: { select: { id: true } },
} as const

const isCoordinateur = (resetedUser: {
  coordinateur: { id: string } | null
}): resetedUser is { coordinateur: { id: string } } =>
  resetedUser.coordinateur?.id != null

const isMediateur = (user: {
  mediateur: { id: string } | null
}): user is { mediateur: { id: string } } => user.mediateur?.id != null

const onlyForCoordinateur =
  ({ coordinateur }: { coordinateur: { id: string } }) =>
  ({ coordinateurId }: Coordination) =>
    coordinateurId === coordinateur.id

const onlyForMediateur =
  ({ mediateur }: { mediateur: { id: string } }) =>
  ({ mediateurIds }: Coordination) =>
    mediateurIds.includes(mediateur.id)

const toCoordinationFor =
  ({ mediateur }: { mediateur: { id: string } }) =>
  ({ coordinateurId }: Coordination) => ({
    coordinateurId,
    mediateurIds: [mediateur.id],
  })

export const reinitialiserUnUtilisateur = async (
  { id }: { id: string },
  demonstration: DonneesDeDemonstration,
  processCoordinations: boolean = true,
) => {
  const userId = id

  const user = await prismaClient.user.findUnique({
    where: {
      id,
    },
    select: compteSelect,
  })

  const userFixture = personas.find((u) => u.id === userId)
  if (!userFixture || (!!user && !user.isFixture)) {
    throw new Error(`User with id ${id} is not a fixture user`)
  }

  let sessions: Session[] = []

  /** Delete all data related to the user if exists */
  if (user) {
    /**
     * We will re-create sessions after reset to avoid unneccessary re-login
     * This is mostly useful in dev environment
     */

    sessions = await prismaClient.session.findMany({
      where: {
        userId: user.id,
      },
    })

    if (user.rdvAccount) {
      const duCompte = { rdvAccountId: user.rdvAccount.id }
      await prismaClient.rdv.deleteMany({ where: duCompte })
      await prismaClient.rdvSyncLog.deleteMany({ where: duCompte })
      await prismaClient.rdvAccountOrganisation.deleteMany({
        where: { accountId: user.rdvAccount.id },
      })
      await prismaClient.rdvAccount.delete({
        where: {
          id: user.rdvAccount.id,
        },
      })
    }

    // Delete mediateur, mediateurEnActivite, mediateurCoordonne, conseillerNumerique
    const mediateurId = user.mediateur?.id

    if (mediateurId) {
      await prismaClient.accompagnement.deleteMany({
        where: {
          activite: {
            mediateurId,
          },
        },
      })

      await prismaClient.activite.deleteMany({
        where: {
          mediateurId,
        },
      })

      await prismaClient.mediateurEnActivite.deleteMany({
        where: {
          mediateurId,
        },
      })

      await prismaClient.mediateurCoordonne.deleteMany({
        where: {
          mediateurId,
        },
      })

      await prismaClient.beneficiaire.deleteMany({
        where: {
          mediateurId,
        },
      })

      await prismaClient.beneficiaire.deleteMany({
        where: {
          mediateurId,
        },
      })

      await prismaClient.invitationEquipe.deleteMany({
        where: {
          mediateurId,
        },
      })

      await prismaClient.mediateur.delete({
        where: {
          id: mediateurId,
        },
      })
    }

    // Delete coordinateur and mediateurs coordonnes
    if (user.coordinateur) {
      const coordinateurId = user.coordinateur.id
      await prismaClient.mediateurCoordonne.deleteMany({
        where: {
          coordinateurId,
        },
      })

      await prismaClient.invitationEquipe.deleteMany({
        where: {
          coordinateurId,
        },
      })

      await prismaClient.coordinateur.delete({
        where: {
          id: coordinateurId,
        },
      })
    }

    await prismaClient.user.delete({
      where: {
        id,
      },
    })
  }

  const resetedUser = await prismaClient.user.create({
    // Le drapeau `isConseillerNumerique` des fixtures n'est plus une colonne : il pilote le semis de
    // l'affectation `idposte` dans `main` (voir `seedPersonnesMain`), pas la ligne `coop.users`.
    data: sansDrapeauDispositif(userFixture),
    select: compteSelect,
  })

  // Le dispositif conseiller numérique n'est plus une colonne : une fixture CC recréée doit
  // retrouver son affectation `idposte`, sans quoi la dérivation la voit hors dispositif.
  if (userFixture.isConseillerNumerique) {
    await garantirAffectationIdposte(
      prismaClient,
      demonstration.employeuse,
      userFixture.id,
    )
  }

  if (userFixture.employeDeLaStructureEmployeuse) {
    await garantirAffectationEmployeuse(
      prismaClient,
      demonstration.employeuse,
      userFixture.id,
    )
  }

  // Le rôle coordinateur vient de `main` depuis ADR-002 : une fixture qui le déclare côté coop doit
  // le voir reflété, sinon le parcours d'inscription la prend pour un simple conseiller.
  await refleterCoordinateurDansMain(prismaClient)

  await garantirContratRompu(
    prismaClient,
    demonstration.employeuse,
    userFixture.id,
  )

  await prismaClient.session.createMany({
    data: sessions,
  })

  /**
   * Re-create mediateur owned data
   */
  if (isMediateur(resetedUser)) {
    const mediateurId = resetedUser.mediateur.id
    await demonstration.semerLesActivitesDansLesLieux(mediateurId)
    await demonstration.semerLesBeneficiaires(mediateurId)
    await demonstration.semerLesCras(mediateurId)

    if (processCoordinations) {
      await demonstration.semerLesCoordinations(
        coordinations
          .filter(onlyForMediateur(resetedUser))
          .map(toCoordinationFor(resetedUser)),
      )
    }
  }

  if (isCoordinateur(resetedUser) && processCoordinations) {
    await demonstration.semerLesCoordinations(
      coordinations.filter(onlyForCoordinateur(resetedUser)),
    )
  }

  return resetedUser
}
