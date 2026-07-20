import { writeFile } from 'node:fs/promises'
import { entrepotPrismaClient } from '@app/web/entrepotPrismaClient'
import { mergeStructureAdministrative } from '@app/web/features/structures/use-cases/merge/mutations/mergeStructureAdministrative'
import { getAuditOutputPath } from '@app/web/jobs/audit-output'
import { output } from '@app/web/jobs/output'
import { prismaClient } from '@app/web/prismaClient'
import type { DeduplicateEmployeusesJob } from './deduplicateEmployeusesJob'

// Déduplique les IDENTITÉS LÉGALES EMPLOYEUSES (`structure_administrative`) partageant un
// même SIRET : le SIRET identifie la personne morale, deux employeuses qui le partagent
// sont donc la même identité en double. Frère de `deduplicate-lieux` (qui déduplique les
// LIEUX, sur nom + adresse, puisqu'un lieu n'est pas porté par son SIRET).
//
// PÉRIMÈTRE — un groupe SIRET n'est traité que s'il contient AU MOINS UNE employeuse
// orpheline (sans `structure_coop_id` dans `main`) et AU PLUS UNE employeuse déjà liée.
//   • Aucune orpheline           -> le groupe est déjà consolidé côté Entrepôt, on n'y touche pas.
//   • Plusieurs déjà liées       -> `main` porte lui-même la duplication (plusieurs lignes pour
//                                   ce SIRET, chacune liée) : la cible ne se déduit pas, arbitrage humain.
// Cette borne garantit que toute employeuse ABSORBÉE est orpheline, donc que la suppression
// dure faite par `mergeStructureAdministrative` ne laisse jamais un `structure_coop_id` de
// `main` pointant dans le vide.
//
// ORDRE — la déduplication précède la liaison (pose des `structure_coop_id` manquants) :
// fusionner d'abord évite de poser des liens qu'on casserait ensuite, et évite de graver le
// doublon dans `main` en liant une orpheline dont la jumelle est déjà liée.
//
// `main` n'est lu qu'en SELECT (via `entrepotPrismaClient`, rôle en lecture seule) ; seules
// les tables `coop` sont écrites.

type Employeuse = {
  id: string
  siret: string | null
  nom: string
  commune: string
  modification: Date
  _count: { emplois: number; activites: number }
}

type Groupe = {
  siret: string
  cible: Employeuse
  absorbees: Employeuse[]
}

const csvHeader = [
  'siret',
  'role',
  'statut',
  'id',
  'nom',
  'commune',
  'emplois',
  'activites',
  'lie_a_main',
].join(';')

const escapeCsvField = (field: string | number | boolean): string => {
  const value = String(field)
  return /[";\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value
}

const findEmployeusesAvecSiret = async (): Promise<Employeuse[]> =>
  prismaClient.structureAdministrative.findMany({
    where: { suppression: null, siret: { not: null } },
    select: {
      id: true,
      siret: true,
      nom: true,
      commune: true,
      modification: true,
      _count: {
        select: {
          emplois: { where: { suppression: null } },
          activites: { where: { suppression: null } },
        },
      },
    },
  })

// Les employeuses coop connues de `main`. On ne filtre PAS sur `deleted_at` : une ligne
// `main` supprimée référence toujours son `structure_coop_id`, supprimer la coop
// correspondante laisserait donc quand même une référence orpheline.
const findEmployeusesLieesAMain = async (): Promise<Set<string>> => {
  const lignes = await entrepotPrismaClient.$queryRaw<
    { structure_coop_id: string }[]
  >`
    SELECT structure_coop_id
    FROM main.structure_administrative
    WHERE structure_coop_id IS NOT NULL
  `

  return new Set(lignes.map(({ structure_coop_id }) => structure_coop_id))
}

const groupBySiret = (employeuses: Employeuse[]): Map<string, Employeuse[]> =>
  employeuses.reduce((groupes, employeuse) => {
    const siret = employeuse.siret ?? ''
    return groupes.set(siret, [...(groupes.get(siret) ?? []), employeuse])
  }, new Map<string, Employeuse[]>())

// Cible = celle qui est déjà liée à `main` (son lien fait foi), sinon la plus riche :
// le plus d'emplois, puis le plus d'activités, puis la plus récemment modifiée.
const parPriorite =
  (lieesAMain: Set<string>) => (a: Employeuse, b: Employeuse) =>
    Number(lieesAMain.has(b.id)) - Number(lieesAMain.has(a.id)) ||
    b._count.emplois - a._count.emplois ||
    b._count.activites - a._count.activites ||
    b.modification.getTime() - a.modification.getTime()

const planifierGroupe =
  (lieesAMain: Set<string>) =>
  ([siret, employeuses]: [string, Employeuse[]]): Groupe | null => {
    const orphelines = employeuses.filter(({ id }) => !lieesAMain.has(id))
    const liees = employeuses.filter(({ id }) => lieesAMain.has(id))

    if (employeuses.length < 2 || orphelines.length === 0) return null
    // `main` porte lui-même le doublon pour ce SIRET : la cible ne se déduit pas.
    if (liees.length > 1) return null

    const [cible, ...absorbees] = [...employeuses].sort(parPriorite(lieesAMain))

    // Invariant du périmètre : seules des orphelines sont absorbées. Défensif — si la
    // priorité venait à changer, on préfère ignorer le groupe que créer un lien pendant.
    if (absorbees.some(({ id }) => lieesAMain.has(id))) return null

    return { siret, cible, absorbees }
  }

const ligneCsv = (
  groupe: Groupe,
  employeuse: Employeuse,
  role: 'cible' | 'absorbee',
  statut: string,
  lieesAMain: Set<string>,
) =>
  [
    groupe.siret,
    role,
    statut,
    employeuse.id,
    employeuse.nom,
    employeuse.commune,
    employeuse._count.emplois,
    employeuse._count.activites,
    lieesAMain.has(employeuse.id),
  ]
    .map(escapeCsvField)
    .join(';')

export const executeDeduplicateEmployeuses = async (
  job: DeduplicateEmployeusesJob,
) => {
  const dryRun = job.payload?.dryRun ?? true
  const excludeSirets = new Set(job.payload?.excludeSirets ?? [])

  output.log(
    `deduplicate-employeuses: démarrage${dryRun ? ' (DRY RUN)' : ''}...`,
  )

  const [employeuses, lieesAMain] = await Promise.all([
    findEmployeusesAvecSiret(),
    findEmployeusesLieesAMain(),
  ])

  const groupes = [...groupBySiret(employeuses).entries()]
    .filter(([siret]) => !excludeSirets.has(siret))
    .map(planifierGroupe(lieesAMain))
    .filter((groupe): groupe is Groupe => groupe !== null)

  const absorbeesCount = groupes.reduce(
    (total, { absorbees }) => total + absorbees.length,
    0,
  )

  output.log(
    `${groupes.length} groupes SIRET à fusionner, ${absorbeesCount} employeuses à absorber`,
  )

  const fusionnes = dryRun
    ? []
    : await groupes.reduce(
        async (precedent: Promise<Groupe[]>, groupe) => {
          const faits = await precedent
          await groupe.absorbees.reduce(async (attente, absorbee) => {
            await attente
            await mergeStructureAdministrative(absorbee.id, groupe.cible.id, {
              timeout: 120_000,
            })
          }, Promise.resolve())
          output.log(
            `  ${groupe.siret} : ${groupe.absorbees.length} absorbée(s) -> ${groupe.cible.id}`,
          )
          return [...faits, groupe]
        },
        Promise.resolve([] as Groupe[]),
      )

  const statut = dryRun ? 'a_fusionner' : 'fusionnee'
  const csvLines = groupes.flatMap((groupe) => [
    ligneCsv(groupe, groupe.cible, 'cible', 'conservee', lieesAMain),
    ...groupe.absorbees.map((absorbee) =>
      ligneCsv(groupe, absorbee, 'absorbee', statut, lieesAMain),
    ),
    '',
  ])

  const filePath = getAuditOutputPath(
    `deduplicate-employeuses-${dryRun ? 'dry-run' : 'applied'}.csv`,
  )
  await writeFile(filePath, [csvHeader, ...csvLines].join('\n'), 'utf-8')

  output.log(`\n=== DÉDUPLICATION EMPLOYEUSES ${dryRun ? '(DRY RUN)' : ''} ===`)
  output.log(`Groupes SIRET: ${groupes.length}`)
  output.log(
    `${dryRun ? 'À absorber' : 'Absorbées'}: ${dryRun ? absorbeesCount : fusionnes.reduce((total, { absorbees }) => total + absorbees.length, 0)}`,
  )
  output.log(`Export: ${filePath}`)
  output.log(`\ndeduplicate-employeuses: terminé`)

  return {
    dryRun,
    groupes: groupes.length,
    absorbees: absorbeesCount,
    export: filePath,
  }
}
