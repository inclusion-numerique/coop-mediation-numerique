import {
  fixtureCrasCollectifs,
  fixtureCrasDemarchesAdministratives,
  fixtureCrasIndividuels,
} from '@app/fixtures/activites'
import { fixtureBeneficiaires } from '@app/fixtures/beneficiaires'
import { output } from '@app/fixtures/output'
import { seedStructures } from '@app/fixtures/structures'
import { upsertCraFixtures } from '@app/fixtures/upsertCraFixtures'
import {
  coordinations,
  fixtureUsers,
  teamAdministrateurs,
  teamMediateurs,
  rdvServicePublicStagingUsers,
} from '@app/fixtures/users'
import type { Prisma } from '@prisma/client'
import { upsertCoordinationFixtures } from './upsertCoordinationFixture'

export const deleteAll = async (transaction: Prisma.TransactionClient) => {
  const tables = await transaction.$queryRaw<
    { table_name: string }[]
  >`SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      AND table_name != '_prisma_migrations'
      AND table_name != '_prisma_migrations_lock'
      AND table_name != 'structures'
      AND table_name != 'cras_conseiller_numerique_V1'
  `

  await transaction.$queryRawUnsafe(
    `TRUNCATE TABLE "${tables
      .map(({ table_name }) => table_name)
      .join('", "')}" CASCADE`,
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

  await upsertCoordinationFixtures(transaction)(coordinations)

  await upsertCraFixtures({
    transaction,
    crasIndividuels: fixtureCrasIndividuels,
    crasDemarchesAdministratives: fixtureCrasDemarchesAdministratives,
    crasCollectifs: fixtureCrasCollectifs,
  })
}
