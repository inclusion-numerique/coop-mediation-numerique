import { conseillerInscriptionSansContrat } from '@/features/utilisateurs/fixtures/conseillers/conseiller-inscription-sans-contrat'
import { conseillerSansLieuInscription } from '@/features/utilisateurs/fixtures/conseillers/conseiller-sans-lieu-inscription'
import { contratRompuDeLExConseiller } from '@/features/utilisateurs/fixtures/conseillers/ex-conseiller-apres-rupture'
import { coordinateurInscription } from '@/features/utilisateurs/fixtures/coordinateurs/coordinateur-inscription'
import type { UtilisateurAEnregistrer } from '@/features/utilisateurs/fixtures/enregistrer-les-utilisateurs'
import { personas } from '@/features/utilisateurs/fixtures/personas'
import type { Prisma } from '@/generated/prisma/client'
import { enSerie } from '@/libraries/fixtures'

export type EmployeuseDeDemonstration = {
  readonly structureCoopId: string
}

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
    ...personas
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
  employeuse: EmployeuseDeDemonstration,
  coopId: string,
): Promise<void> => {
  const structureAdministrativeMain =
    await transaction.structureAdministrativeMain.findFirst({
      where: { structureCoopId: employeuse.structureCoopId },
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
  employeuse: EmployeuseDeDemonstration,
  coopId: string,
): Promise<void> => {
  const contratRompu = contratsRompus.find(
    (contrat) => contrat.coopId === coopId,
  )
  if (contratRompu === undefined) return

  const structureAdministrativeMain =
    await transaction.structureAdministrativeMain.findFirst({
      where: { structureCoopId: employeuse.structureCoopId },
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
  employeuse: EmployeuseDeDemonstration,
  coopId: string,
): Promise<void> => {
  const structureAdministrativeMain =
    await transaction.structureAdministrativeMain.findFirst({
      where: { structureCoopId: employeuse.structureCoopId },
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

const idsPresentsDansCoop = async (
  transaction: Prisma.TransactionClient,
  ids: readonly string[],
): Promise<ReadonlySet<string>> =>
  new Set(
    (
      await transaction.user.findMany({
        where: { id: { in: [...ids] } },
        select: { id: true },
      })
    ).map(({ id }) => id),
  )

export const seedPersonnesMain = async (
  transaction: Prisma.TransactionClient,
  employeuse: EmployeuseDeDemonstration,
  utilisateurs: readonly UtilisateurAEnregistrer[],
) => {
  const employes = utilisateurs
    .filter(
      ({ employeDeLaStructureEmployeuse }) => employeDeLaStructureEmployeuse,
    )
    .map(({ id }) => id)

  const presents = await idsPresentsDansCoop(transaction, [
    ...employes,
    ...idsConseillersNumeriques(),
    ...contratsRompus.map(({ coopId }) => coopId),
  ])
  const estPresent = (coopId: string) => presents.has(coopId)

  await enSerie(employes.filter(estPresent), (coopId) =>
    garantirAffectationEmployeuse(transaction, employeuse, coopId),
  )

  // Passe 2 — affectation idposte vers la SA main de structureEmployeuse, pour tout CN de fixture.
  await enSerie(idsConseillersNumeriques().filter(estPresent), (coopId) =>
    garantirAffectationIdposte(transaction, employeuse, coopId),
  )

  // Passe 3 — le rôle coordinateur, que la coop déclare et que `main` doit porter.
  await refleterCoordinateurDansMain(transaction)

  await enSerie(
    contratsRompus.filter(({ coopId }) => estPresent(coopId)),
    ({ coopId }) => garantirContratRompu(transaction, employeuse, coopId),
  )
}

export const effacerLesPersonnesMainDeDemonstration = async (
  transaction: Prisma.TransactionClient,
) => {
  const coopId = { in: personas.map(({ id }) => id) }

  await transaction.contratMain.deleteMany({ where: { personne: { coopId } } })
  await transaction.personneAffectationEmploiMain.deleteMany({
    where: { personne: { coopId } },
  })
  await transaction.personneMain.deleteMany({ where: { coopId } })
}
