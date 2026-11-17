import {
  fixtureCrasCollectifs,
  fixtureCrasDemarchesAdministratives,
  fixtureCrasIndividuels,
} from '@app/web/fixtures/activites'
import { fixtureBeneficiaires } from '@app/web/fixtures/beneficiaires'
import {
  equipeCoordonnee,
  equipeCordonneeIds,
  invitationsEquipe,
  quitterEquipe,
} from '@app/web/fixtures/equipeCoordonnee'
import { seedPersonnesMain } from '@app/web/fixtures/personnesMainConseillerNumerique'
import { seedStructures } from '@app/web/fixtures/structures'
import { upsertCoordinationFixtures } from '@app/web/fixtures/upsertCoordinationFixture'
import { upsertCraFixtures } from '@app/web/fixtures/upsertCraFixtures'
import { upsertInvitationEquipeFixtures } from '@app/web/fixtures/upsertInvitationEquipeFixture'
import { upsertMediateurCoordonneFixtures } from '@app/web/fixtures/upsertMediateurCoordonneFixture'
import { upsertUserFixtures } from '@app/web/fixtures/upsertUserFixture'
import {
  coordinations,
  fixtureUsers,
  rdvServicePublicStagingUsers,
  teamAdministrateurs,
  teamMediateurs,
} from '@app/web/fixtures/users'
import { coordinateurInscritAvecToutCoordinateurId } from '@app/web/fixtures/users/coordinateurInscritAvecTout'
import { Prisma } from '@app/web/generated/prisma/client'
import { enSerie } from '@app/web/libraries/fixtures/enSerie'
import { output } from '@app/web/libraries/fixtures/output'

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
  await seedStructures(transaction)

  await upsertUserFixtures(transaction)('user', fixtureUsers)

  await upsertUserFixtures(transaction)(
    'team administrator',
    teamAdministrateurs,
  )

  await upsertUserFixtures(transaction)('team mediateur', [
    ...teamMediateurs,
    ...rdvServicePublicStagingUsers,
  ])

  await enSerie(fixtureBeneficiaires, (beneficiaire) =>
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

  await seedPersonnesMain(transaction, [
    ...fixtureUsers,
    ...teamAdministrateurs,
    ...teamMediateurs,
    ...rdvServicePublicStagingUsers,
    ...equipeCoordonnee,
  ])
}
