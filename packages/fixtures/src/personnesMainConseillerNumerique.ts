import { enSerie } from '@app/fixtures/enSerie'
import { structureEmployeuse } from '@app/fixtures/structures'
import type { UserFixture } from '@app/fixtures/upsertUserFixture'
import { fixtureUsers } from '@app/fixtures/users'
import { conseillerInscriptionSansContrat } from '@app/fixtures/users/conseillerInscriptionSansContrat'
import { conseillerSansLieuInscription } from '@app/fixtures/users/conseillerSansLieuInscription'
import { coordinateurInscription } from '@app/fixtures/users/coordinateurInscription'
import { contratRompuDeLExConseiller } from '@app/fixtures/users/exConseillerApresRupture'
import type { Prisma } from '@app/web/generated/prisma/client'

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

const contratsRompus = [contratRompuDeLExConseiller]

export const garantirContratRompu = async (
  transaction: Prisma.TransactionClient,
  coopId: string,
): Promise<void> => {
  const contratRompu = contratsRompus.find(
    (contrat) => contrat.coopId === coopId,
  )
  if (contratRompu === undefined) return

  const structureAdministrativeMain =
    await transaction.structureAdministrativeMain.findFirst({
      where: { structureCoopId: structureEmployeuse.id },
      select: { id: true },
    })

  const personne = await transaction.personneMain.upsert({
    where: { coopId },
    create: { coopId },
    update: {},
    select: { id: true },
  })

  await transaction.contratMain.deleteMany({
    where: { personneId: personne.id },
  })

  await transaction.contratMain.create({
    data: {
      personneId: personne.id,
      structureId: structureAdministrativeMain?.id ?? null,
      dateDebut: contratRompu.dateDebut,
      dateRupture: contratRompu.dateRupture,
    },
  })
}

export const garantirAffectationEmployeuse = async (
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
        source: 'coop',
      },
    },
    create: {
      personneId: personne.id,
      structureAdministrativeId: structureAdministrativeMain.id,
      source: 'coop',
      estActive: true,
    },
    update: { estActive: true },
  })
}

export const seedPersonnesMain = async (
  transaction: Prisma.TransactionClient,
  utilisateurs: readonly UserFixture[],
) => {
  await enSerie(
    utilisateurs.filter(
      ({ employeDeLaStructureEmployeuse }) => employeDeLaStructureEmployeuse,
    ),
    ({ id }) => garantirAffectationEmployeuse(transaction, id),
  )

  // Passe 2 — affectation idposte vers la SA main de structureEmployeuse, pour tout CN de fixture.
  await enSerie(idsConseillersNumeriques(), (coopId) =>
    garantirAffectationIdposte(transaction, coopId),
  )

  // Passe 3 — le rôle coordinateur, que la coop déclare et que `main` doit porter.
  await refleterCoordinateurDansMain(transaction)

  await enSerie(contratsRompus, ({ coopId }) =>
    garantirContratRompu(transaction, coopId),
  )
}
