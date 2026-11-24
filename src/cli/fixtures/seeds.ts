import { crasDeDemonstration } from '@/features/activites/fixtures/cras-de-demonstration'
import { enregistrerLesCras } from '@/features/activites/fixtures/enregistrer-les-cras'
import {
  beneficiairesDeDemonstration,
  referencesDesBeneficiaires,
} from '@/features/beneficiaire/fixtures/beneficiaires-de-demonstration'
import { semerLesEmployeusesDeDemonstration } from '@/features/employeuse/fixtures/employeuses-de-demonstration'
import { enregistrerLesCoordinations } from '@/features/equipe/fixtures/enregistrer-les-coordinations'
import { enregistrerLesInvitations } from '@/features/equipe/fixtures/enregistrer-les-invitations'
import { enregistrerLesMediateursCoordonnes } from '@/features/equipe/fixtures/enregistrer-les-mediateurs-coordonnes'
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
import { coordinateurInscritAvecToutCoordinateurId } from '@/features/utilisateurs/fixtures/coordinateurs/coordinateur-inscrit-avec-tout'
import { enregistrerLesUtilisateurs } from '@/features/utilisateurs/fixtures/enregistrer-les-utilisateurs'
import {
  equipeCoordonnee,
  membresDeLEquipeCoordonnee,
} from '@/features/utilisateurs/fixtures/equipe-coordonnee'
import {
  administrateursDeLEquipe,
  coordinations,
  mediateursDeLEquipe,
  mediateursDesEquipesProduit,
  mediateursDesPersonas,
  personas,
  utilisateursDeRecetteRdv,
} from '@/features/utilisateurs/fixtures/personas'
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

  await enregistrerLesUtilisateurs(transaction)('user', personas)

  await enregistrerLesUtilisateurs(transaction)(
    'team administrator',
    administrateursDeLEquipe,
  )

  await enregistrerLesUtilisateurs(transaction)('team mediateur', [
    ...mediateursDeLEquipe,
    ...utilisateursDeRecetteRdv,
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

  await enregistrerLesUtilisateurs(transaction)('equipe user', equipeCoordonnee)

  await semerLesActivitesDansLesLieux(transaction, [
    ...activitesDesPersonas(mediateursDesPersonas),
    ...activitesDesEquipesProduit(mediateursDesEquipesProduit),
    ...activitesDeLEquipeCoordonnee(membresDeLEquipeCoordonnee),
  ])

  const allCoordinations = [
    ...coordinations,
    coordinationDeLEquipe(equipeDeDemonstration),
  ]
  await enregistrerLesCoordinations(transaction)(allCoordinations)

  await enregistrerLesMediateursCoordonnes(transaction)(
    departsDeLEquipe(equipeDeDemonstration),
  )

  await enregistrerLesInvitations(transaction)(
    invitationsDeLEquipe(equipeDeDemonstration),
  )

  await enregistrerLesCras({
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
      ...personas,
      ...administrateursDeLEquipe,
      ...mediateursDeLEquipe,
      ...utilisateursDeRecetteRdv,
      ...equipeCoordonnee,
    ],
  )
}
