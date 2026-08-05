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
import { seedPersonnesMain } from '@app/fixtures/personnesMainConseillerNumerique'
import {
  fixtureStructuresAdministrativesMain,
  seedStructures,
} from '@app/fixtures/structures'
import { upsertCraFixtures } from '@app/fixtures/upsertCraFixtures'
import { upsertUserFixtures } from '@app/fixtures/upsertUserFixture'
import {
  coordinations,
  fixtureUsers,
  rdvServicePublicStagingUsers,
  teamAdministrateurs,
  teamMediateurs,
} from '@app/fixtures/users'
import { coordinateurInscritAvecToutCoordinateurId } from '@app/fixtures/users/coordinateurInscritAvecTout'
import { Prisma } from '@prisma/client'
import { upsertCoordinationFixtures } from './upsertCoordinationFixture'
import { upsertInvitationEquipeFixtures } from './upsertInvitationEquipeFixture'
import { upsertMediateurCoordonneFixtures } from './upsertMediateurCoordonneFixture'

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

  await upsertUserFixtures(transaction)('user', fixtureUsers)

  await upsertUserFixtures(transaction)(
    'team administrator',
    teamAdministrateurs,
  )

  await upsertUserFixtures(transaction)('team mediateur', [
    ...teamMediateurs,
    ...rdvServicePublicStagingUsers,
  ])

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

  // Employeuse des users de test dans `main` (personne + affectations) -> nécessaire aux reads
  // pur-main (sessionUser, CRA, admin, récap…). Miroir des backfills prod. Après users + structures.
  await seedPersonnesMain(transaction)

  // Backfill `structure_main_id` / `structure_employeuse_main_id` sur les emplois et activités seedés
  // (les fixtures ne portent que l'uuid coop) : le périmètre élargi ADR-002 fait lire l'employeuse
  // depuis `main`. Jointure par `structure_coop_id` sur les SA main fixtures (cf. seedStructures).
  //
  // La restriction aux structures de fixtures n'est pas cosmétique : sans elle, ces UPDATE balaient
  // les tables entières. Sur une base de fixtures c'est équivalent (tout est fixture), mais sur une
  // base restaurée depuis la prod, la colonne vient d'être créée par la migration — donc NULLE
  // partout — et le seed réécrivait plusieurs millions de lignes qui ne lui appartiennent pas.
  const structuresCoopDesFixtures = fixtureStructuresAdministrativesMain.map(
    ({ structureCoopId }) => structureCoopId,
  )

  await transaction.$executeRaw`
    UPDATE coop.employes_structures es
    SET structure_main_id = m.id
    FROM main.structure_administrative m
    WHERE m.structure_coop_id = es.structure_id
      AND es.structure_main_id IS NULL
      AND es.structure_id = ANY(ARRAY[${Prisma.join(structuresCoopDesFixtures)}]::uuid[])`
  await transaction.$executeRaw`
    UPDATE coop.activites a
    SET structure_employeuse_main_id = m.id
    FROM main.structure_administrative m
    WHERE m.structure_coop_id = a.structure_employeuse_id
      AND a.structure_employeuse_main_id IS NULL
      AND a.structure_employeuse_id = ANY(ARRAY[${Prisma.join(structuresCoopDesFixtures)}]::uuid[])`
}
