import {
  fixtureCrasCollectifs,
  fixtureCrasDemarchesAdministratives,
  fixtureCrasIndividuels,
} from '@app/fixtures/activites'
import { fixtureBeneficiaires } from '@app/fixtures/beneficiaires'
import {
  equipeCoordonnee,
  equipeCordonneeIds,
  invitationsEquipe,
  quitterEquipe,
} from '@app/fixtures/equipeCoordonnee'
import { output } from '@app/fixtures/output'
import { seedPersonnesMainConseillerNumerique } from '@app/fixtures/personnesMainConseillerNumerique'
import { seedStructures } from '@app/fixtures/structures'
import { upsertCraFixtures } from '@app/fixtures/upsertCraFixtures'
import {
  coordinations,
  fixtureUsers,
  rdvServicePublicStagingUsers,
  teamAdministrateurs,
  teamMediateurs,
} from '@app/fixtures/users'
import { coordinateurInscritAvecToutCoordinateurId } from '@app/fixtures/users/coordinateurInscritAvecTout'
import type { Prisma } from '@prisma/client'
import { upsertCoordinationFixtures } from './upsertCoordinationFixture'
import { upsertInvitationEquipeFixtures } from './upsertInvitationEquipeFixture'
import { upsertMediateurCoordonneFixtures } from './upsertMediateurCoordonneFixture'

export const deleteAll = async (transaction: Prisma.TransactionClient) => {
  const tables = await transaction.$queryRaw<
    { table_name: string }[]
  >`SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'coop'
      AND table_type = 'BASE TABLE'
      AND table_name != '_prisma_migrations'
      AND table_name != '_prisma_migrations_lock'
      AND table_name != 'structures'
      AND table_name != 'structure_administrative'
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
  await seedStructures(transaction)

  await Promise.all(
    fixtureUsers.map((user) =>
      transaction.user
        .upsert({
          where: { id: user.id },
          create: user,
          update: user,
        })
        .catch((error) => {
          output.error('Error upserting user fixture', user)
          throw error
        }),
    ),
  )

  await Promise.all(
    teamAdministrateurs.map((team) =>
      transaction.user
        .upsert({
          where: { id: team.id },
          create: team,
          update: team,
        })
        .catch((error) => {
          output.error('Error upserting team administrator fixture', team)
          throw error
        }),
    ),
  )

  await Promise.all(
    [...teamMediateurs, ...rdvServicePublicStagingUsers].map((team) =>
      transaction.user
        .upsert({
          where: { id: team.id },
          create: team,
          update: team,
        })
        .catch((error) => {
          output.error('Error upserting team mediateur fixture', team)
          throw error
        }),
    ),
  )

  await Promise.all(
    fixtureBeneficiaires.map((beneficiaire) =>
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
    ),
  )

  await Promise.all(
    equipeCoordonnee.map((user) =>
      transaction.user
        .upsert({
          where: { id: user.id },
          create: user,
          update: user,
        })
        .catch((error) => {
          output.error('Error upserting equipe user fixture', user)
          throw error
        }),
    ),
  )

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
    crasIndividuels: fixtureCrasIndividuels,
    crasDemarchesAdministratives: fixtureCrasDemarchesAdministratives,
    crasCollectifs: fixtureCrasCollectifs,
  })

  // Employeuse idposte des CN de test dans `main` (l'Entrepôt la fournit en prod ; le mock ne peuple
  // que les emplois coop) -> nécessaire au read pur-main du récap d'inscription. Après les users.
  await seedPersonnesMainConseillerNumerique(transaction)

  // Backfill `structure_main_id` / `structure_employeuse_main_id` sur les emplois et activités seedés
  // (les fixtures ne portent que l'uuid coop) : le périmètre élargi ADR-002 fait lire l'employeuse
  // depuis `main`. Jointure par `structure_coop_id` sur les SA main fixtures (cf. seedStructures).
  await transaction.$executeRaw`
    UPDATE coop.employes_structures es
    SET structure_main_id = m.id
    FROM main.structure_administrative m
    WHERE m.structure_coop_id = es.structure_id
      AND es.structure_main_id IS NULL`
  await transaction.$executeRaw`
    UPDATE coop.activites a
    SET structure_employeuse_main_id = m.id
    FROM main.structure_administrative m
    WHERE m.structure_coop_id = a.structure_employeuse_id
      AND a.structure_employeuse_main_id IS NULL`
}
