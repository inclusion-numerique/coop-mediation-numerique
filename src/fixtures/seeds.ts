import { crasDeDemonstration } from '@/features/activites/fixtures/activites'
import { upsertCraFixtures } from '@/features/activites/fixtures/upsertCraFixtures'
import { beneficiairesDeDemonstration } from '@/features/beneficiaire/fixtures/beneficiaires'
import { semerLesEmployeusesDeDemonstration } from '@/features/employeuse/fixtures/employeuses-de-demonstration'
import {
  equipeCoordonnee,
  equipeCordonneeIds,
  invitationsEquipe,
  membresDeLEquipeCoordonnee,
  quitterEquipe,
} from '@/features/equipe/fixtures/equipeCoordonnee'
import { upsertCoordinationFixtures } from '@/features/equipe/fixtures/upsertCoordinationFixture'
import { upsertInvitationEquipeFixtures } from '@/features/equipe/fixtures/upsertInvitationEquipeFixture'
import { upsertMediateurCoordonneFixtures } from '@/features/equipe/fixtures/upsertMediateurCoordonneFixture'
import {
  activitesDeLEquipeCoordonnee,
  activitesDesEquipesProduit,
  activitesDesPersonas,
  semerLesActivitesDansLesLieux,
} from '@/features/lieux-activite/fixtures/activites-dans-les-lieux-de-demonstration'
import {
  mediateque,
  semerLesLieuxDeDemonstration,
  structureEmployeuse,
} from '@/features/lieux-activite/fixtures/lieux-de-demonstration'
import { seedPersonnesMain } from '@/features/utilisateurs/fixtures/personnesMainConseillerNumerique'
import { upsertUserFixtures } from '@/features/utilisateurs/fixtures/upsertUserFixture'
import {
  coordinations,
  fixtureUsers,
  mediateursDesEquipesProduit,
  mediateursDesPersonas,
  rdvServicePublicStagingUsers,
  teamAdministrateurs,
  teamMediateurs,
} from '@/features/utilisateurs/fixtures/users'
import { coordinateurInscritAvecToutCoordinateurId } from '@/features/utilisateurs/fixtures/users/coordinateurInscritAvecTout'
import { Prisma } from '@/generated/prisma/client'
import { enSerie } from '@/libraries/fixtures/enSerie'
import { output } from '@/libraries/fixtures/output'

/**
 * Le `TRUNCATE` ne porte que sur le schéma `coop` : les lignes `main` des
 * utilisateurs de fixtures (personne, affectations, contrats) lui survivraient,
 * et un parcours qui rattache une employeuse la retrouverait au run suivant —
 * l'utilisateur ne serait plus « sans employeuse ». On les efface donc
 * explicitement, en ne visant que les personnes de fixtures.
 */
const deleteFixturePersonnesMain = async (
  transaction: Prisma.TransactionClient,
) => {
  const coopId = { in: fixtureUsers.map(({ id }) => id) }

  await transaction.contratMain.deleteMany({ where: { personne: { coopId } } })
  await transaction.personneAffectationEmploiMain.deleteMany({
    where: { personne: { coopId } },
  })
  await transaction.personneMain.deleteMany({ where: { coopId } })
}

export const deleteAll = async (transaction: Prisma.TransactionClient) => {
  await deleteFixturePersonnesMain(transaction)

  const tables = await transaction.$queryRaw<
    { table_name: string }[]
  >`SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'coop'
      AND table_type = 'BASE TABLE'
      AND table_name != '_prisma_migrations'
      AND table_name != '_prisma_migrations_lock'
      AND table_name != 'structures'
      AND table_name != 'cras_conseiller_numerique_V1'
  `

  await transaction.$queryRawUnsafe(
    `TRUNCATE TABLE "coop"."${tables
      .map(({ table_name }) => table_name)
      .join('", "coop"."')}" CASCADE`,
  )

  return tables.map(({ table_name }) => table_name)
}

export const seed = async (transaction: Prisma.TransactionClient) => {
  await semerLesLieuxDeDemonstration(transaction)
  await semerLesEmployeusesDeDemonstration(transaction, {
    structureEmployeuse,
    mediateque,
  })

  await upsertUserFixtures(transaction)('user', fixtureUsers)

  await upsertUserFixtures(transaction)(
    'team administrator',
    teamAdministrateurs,
  )

  await upsertUserFixtures(transaction)('team mediateur', [
    ...teamMediateurs,
    ...rdvServicePublicStagingUsers,
  ])

  await enSerie(
    beneficiairesDeDemonstration(mediateursDesPersonas).tous,
    (beneficiaire) =>
      transaction.beneficiaire
        .upsert({
          where: { id: beneficiaire.id },
          create: beneficiaire,
          update: beneficiaire,
        })
        .catch((error) => {
          output.error('Error upserting beneficiaire fixture', beneficiaire)
          throw error
        }),
  )

  await upsertUserFixtures(transaction)('equipe user', equipeCoordonnee)

  await semerLesActivitesDansLesLieux(transaction, [
    ...activitesDesPersonas(mediateursDesPersonas),
    ...activitesDesEquipesProduit(mediateursDesEquipesProduit),
    ...activitesDeLEquipeCoordonnee(membresDeLEquipeCoordonnee),
  ])

  const allCoordinations = [
    ...coordinations,
    {
      coordinateurId: coordinateurInscritAvecToutCoordinateurId,
      mediateurIds: equipeCordonneeIds,
    },
  ]
  await upsertCoordinationFixtures(transaction)(allCoordinations)

  await upsertMediateurCoordonneFixtures(transaction)(quitterEquipe)

  await upsertInvitationEquipeFixtures(transaction)(invitationsEquipe)

  await upsertCraFixtures({
    transaction,
    ...crasDeDemonstration({ mediateque }),
  })

  await seedPersonnesMain(
    transaction,
    { structureCoopId: structureEmployeuse.id },
    [
      ...fixtureUsers,
      ...teamAdministrateurs,
      ...teamMediateurs,
      ...rdvServicePublicStagingUsers,
      ...equipeCoordonnee,
    ],
  )
}
