import { structureEmployeuse } from '@app/fixtures/structures'
import { conseillerInscription } from '@app/fixtures/users/conseillerInscription'
import { conseillerInscriptionSansContrat } from '@app/fixtures/users/conseillerInscriptionSansContrat'
import { conseillerSansLieuInscription } from '@app/fixtures/users/conseillerSansLieuInscription'
import { coordinateurInscription } from '@app/fixtures/users/coordinateurInscription'
import type { Prisma } from '@prisma/client'

// En prod, l'employeuse d'un CN vient d'une affectation `idposte` dans `main` (fournie par l'Entrepôt),
// PAS d'une écriture coop. Le mock Dataspace, lui, ne peuple que les emplois coop -> le read pur-main
// du récap serait vide en e2e. On sème donc ici, pour chaque CN d'inscription, la `main.personne`
// (liée par `coop_id`) + une affectation `idposte` active vers la SA main de `structureEmployeuse`
// (déjà seedée par seedStructures). Reflète l'état que l'Entrepôt garantit en prod.
//
// À seeder APRÈS `fixtureUsers` (la FK `personne.coop_id` référence `coop.users`).
const cnInscriptionUserIds = [
  conseillerInscription.id,
  conseillerInscriptionSansContrat.id,
  conseillerSansLieuInscription.id,
  coordinateurInscription.id,
]

export const seedPersonnesMainConseillerNumerique = async (
  transaction: Prisma.TransactionClient,
) => {
  const structureAdministrativeMain =
    await transaction.structureAdministrativeMain.findFirst({
      where: { structureCoopId: structureEmployeuse.id },
      select: { id: true },
    })
  if (!structureAdministrativeMain) return

  await Promise.all(
    cnInscriptionUserIds.map(async (coopId) => {
      const personne = await transaction.personneMain.upsert({
        where: { coopId },
        create: { coopId },
        update: {},
        select: { id: true },
      })

      await transaction.personneAffectationEmploiMain.upsert({
        where: {
          personneId_structureAdministrativeId_source: {
            personneId: personne.id,
            structureAdministrativeId: structureAdministrativeMain.id,
            source: 'idposte',
          },
        },
        create: {
          personneId: personne.id,
          structureAdministrativeId: structureAdministrativeMain.id,
          source: 'idposte',
          estActive: true,
        },
        update: { estActive: true },
      })
    }),
  )
}
