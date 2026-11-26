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

  await enSerie(idsConseillersNumeriques().filter(estPresent), (coopId) =>
    garantirAffectationIdposte(transaction, employeuse, coopId),
  )

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
