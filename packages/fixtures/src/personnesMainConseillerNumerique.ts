import { structureEmployeuse } from '@app/fixtures/structures'
import { fixtureUsers } from '@app/fixtures/users'
import { conseillerInscriptionSansContrat } from '@app/fixtures/users/conseillerInscriptionSansContrat'
import { conseillerSansLieuInscription } from '@app/fixtures/users/conseillerSansLieuInscription'
import { coordinateurInscription } from '@app/fixtures/users/coordinateurInscription'
import type { Prisma } from '@prisma/client'

// Peuple `main` avec l'employeuse des users de test, comme en prod (où la coop lit l'employeuse depuis
// `main.personne` + affectations). Deux passes :
//  1. GÉNÉRAL : personne (coop_id) + affectation `source=coop` active pour tout user ayant un emploi
//     coop actif dont la structure a une SA main — miroir du backfill `backfill-personnes-affectations
//     -main`. Nécessaire aux reads pur-main (sessionUser, CRA, admin, mon-réseau…).
//  2. CN INSCRIPTION : affectation `source=idposte` (l'Entrepôt la fournit en prod ; le mock Dataspace
//     ne peuple que les emplois coop) vers la SA main de `structureEmployeuse`, pour les 4 CN dont
//     l'employeuse n'est pas seedée en emploi.
//
// À exécuter APRÈS `fixtureUsers` + `seedStructures` (FK `personne.coop_id` -> `coop.users`, SA main).

/**
 * Les conseillers numériques de fixtures se déclaraient par `isConseillerNumerique: true` sur la
 * ligne `coop.users`. Cette colonne a disparu (ADR-002) : le dispositif se dérive de l'affectation
 * `idposte` active. Le drapeau de fixture pilote donc désormais ce semis — l'intention reste
 * déclarée dans chaque fixture, seule sa traduction change.
 *
 * Les quatre CN d'inscription restent listés à part : ils n'ont pas d'emploi coop seedé, donc rien
 * d'autre ne leur donnerait d'affectation.
 */
const cnInscriptionUserIds = [
  conseillerInscriptionSansContrat.id,
  conseillerSansLieuInscription.id,
  coordinateurInscription.id,
]

const idsConseillersNumeriques = (): string[] => [
  ...new Set([
    ...cnInscriptionUserIds,
    ...fixtureUsers
      .filter(({ isConseillerNumerique }) => isConseillerNumerique === true)
      .map(({ id }) => id),
  ]),
]

/**
 * Garantit l'affectation `idposte` active d'un utilisateur de fixture — ce qui, depuis ADR-002, EST
 * le fait d'être conseiller numérique. Extrait pour être réutilisable par `resetFixtureUser` : un
 * test qui recrée une fixture CN doit lui rendre son dispositif, sinon la dérivation le voit sortir.
 */
/**
 * Reflète le rôle coordinateur dans `main`, comme l'Entrepôt le fait en production.
 *
 * Les fixtures déclarent le coordinateur côté coop (`coordinateur: connectOrCreate`), mais depuis
 * ADR-002 c'est `main.personne.is_coordinateur` qui fait foi : sans ce reflet, un coordinateur de
 * fixture est vu comme un simple conseiller numérique et le parcours d'inscription l'envoie sur la
 * mauvaise étape.
 */
export const refleterCoordinateurDansMain = async (
  transaction: Prisma.TransactionClient,
): Promise<void> => {
  await transaction.$executeRaw`
    UPDATE main.personne p
    SET is_coordinateur = true
    FROM coop.coordinateurs c
    WHERE c.user_id = p.coop_id
      AND p.is_coordinateur IS DISTINCT FROM true`
}

export const garantirAffectationIdposte = async (
  transaction: Prisma.TransactionClient,
  coopId: string,
): Promise<void> => {
  const structureAdministrativeMain =
    await transaction.structureAdministrativeMain.findFirst({
      where: { structureCoopId: structureEmployeuse.id },
      select: { id: true },
    })
  if (!structureAdministrativeMain) return

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
}

export const seedPersonnesMain = async (
  transaction: Prisma.TransactionClient,
) => {
  // Passe 1 — personne + affectation coop pour tout emploi coop actif ayant une SA main.
  await transaction.$executeRaw`
    INSERT INTO main.personne (coop_id)
    SELECT DISTINCT es.user_id
    FROM coop.employes_structures es
    JOIN main.structure_administrative m ON m.structure_coop_id = es.structure_id
    WHERE es.suppression IS NULL
      AND NOT EXISTS (SELECT 1 FROM main.personne p WHERE p.coop_id = es.user_id)
    ON CONFLICT DO NOTHING`
  await transaction.$executeRaw`
    INSERT INTO main.personne_affectations_emploi (personne_id, structure_administrative_id, source, est_active)
    SELECT DISTINCT p.id, m.id, 'coop', true
    FROM coop.employes_structures es
    JOIN main.structure_administrative m ON m.structure_coop_id = es.structure_id
    JOIN main.personne p ON p.coop_id = es.user_id
    WHERE es.suppression IS NULL
    ON CONFLICT (personne_id, structure_administrative_id, source) DO NOTHING`

  // Passe 2 — affectation idposte vers la SA main de structureEmployeuse, pour tout CN de fixture.
  await Promise.all(
    idsConseillersNumeriques().map((coopId) =>
      garantirAffectationIdposte(transaction, coopId),
    ),
  )

  // Passe 3 — le rôle coordinateur, que la coop déclare et que `main` doit porter.
  await refleterCoordinateurDansMain(transaction)
}
