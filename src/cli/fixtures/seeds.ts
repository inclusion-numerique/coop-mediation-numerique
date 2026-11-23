import { crasDeDemonstration } from '@/features/activites/fixtures/cras-de-demonstration'
import { upsertCraFixtures } from '@/features/activites/fixtures/enregistrer-les-cras'
import {
  beneficiairesDeDemonstration,
  referencesDesBeneficiaires,
} from '@/features/beneficiaire/fixtures/beneficiaires-de-demonstration'
import { semerLesEmployeusesDeDemonstration } from '@/features/employeuse/fixtures/employeuses-de-demonstration'
import { upsertCoordinationFixtures } from '@/features/equipe/fixtures/enregistrer-les-coordinations'
import { upsertInvitationEquipeFixtures } from '@/features/equipe/fixtures/enregistrer-les-invitations'
import { upsertMediateurCoordonneFixtures } from '@/features/equipe/fixtures/enregistrer-les-mediateurs-coordonnes'
import {
  coordinationDeLEquipe,
  departsDeLEquipe,
  invitationsDeLEquipe,
} from '@/features/equipe/fixtures/equipe-coordonnee'
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
import { upsertUserFixtures } from '@/features/utilisateurs/fixtures/enregistrer-les-utilisateurs'
import {
  coordinations,
  fixtureUsers,
  mediateursDesEquipesProduit,
  mediateursDesPersonas,
  rdvServicePublicStagingUsers,
  teamAdministrateurs,
  teamMediateurs,
} from '@/features/utilisateurs/fixtures/personas'
import { coordinateurInscritAvecToutCoordinateurId } from '@/features/utilisateurs/fixtures/personas/coordinateur-inscrit-avec-tout'
import {
  equipeCoordonnee,
  membresDeLEquipeCoordonnee,
} from '@/features/utilisateurs/fixtures/personas/equipe-coordonnee'
import {
  effacerLesPersonnesMainDeDemonstration,
  seedPersonnesMain,
} from '@/features/utilisateurs/fixtures/personnes-main-conseiller-numerique'
import { Prisma } from '@/generated/prisma/client'
import { enSerie } from '@/libraries/fixtures/enSerie'
import { output } from '@/libraries/fixtures/output'

export const deleteAll = async (transaction: Prisma.TransactionClient) => {
  await effacerLesPersonnesMainDeDemonstration(transaction)

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

const equipeDeDemonstration = {
  coordinateurId: coordinateurInscritAvecToutCoordinateurId,
  membres: membresDeLEquipeCoordonnee,
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
    coordinationDeLEquipe(equipeDeDemonstration),
  ]
  await upsertCoordinationFixtures(transaction)(allCoordinations)

  await upsertMediateurCoordonneFixtures(transaction)(
    departsDeLEquipe(equipeDeDemonstration),
  )

  await upsertInvitationEquipeFixtures(transaction)(
    invitationsDeLEquipe(equipeDeDemonstration),
  )

  await upsertCraFixtures({
    transaction,
    ...crasDeDemonstration({
      mediateurs: mediateursDesPersonas,
      beneficiaires: referencesDesBeneficiaires,
      lieux: { mediateque },
    }),
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
