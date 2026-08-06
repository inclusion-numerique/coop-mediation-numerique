import { writeFile } from 'node:fs/promises'
import { entrepotPrismaClient } from '@app/web/entrepotPrismaClient'
import { getAuditOutputPath } from '@app/web/jobs/audit-output'
import { output } from '@app/web/jobs/output'
import { mergeStructureAdministrative } from '@app/web/jobs/structures-main/mergeEmployeuseCoop'
import { prismaClient } from '@app/web/prismaClient'
import type { DeduplicateEmployeusesJob } from './deduplicateEmployeusesJob'

// Déduplique les employeuses (`coop.structure_administrative`) selon DEUX critères, avant
// toute liaison vers `main` : fusionner d'abord évite de poser des liens qu'on casserait
// ensuite, et évite de graver le doublon dans `main`.
//
//   SIRET      — le SIRET identifie la personne morale : deux employeuses qui le partagent
//                sont la même identité en double.
//   IDENTITÉ   — nom + adresse + code INSEE strictement identiques (accents et ponctuation
//                normalisés). Nécessaire parce que 136 employeuses n'ont pas de SIRET, dont
//                seulement 11 ont une jumelle avec SIRET : le critère SIRET seul les laisse
//                toutes en place.
//
// Les deux critères sont CHAÎNÉS : si A partage son SIRET avec B, et B son identité avec C,
// les trois forment un seul groupe. C'est le cas réel de #PARISESTMARNE&BOIS, où la ligne la
// plus riche (13 822 activités) n'avait pas de SIRET et ne rejoignait ses jumelles que par
// l'identité.
//
// CRITÈRES ÉCARTÉS — « nom + INSEE » et « nom + commune » ont été mesurés puis rejetés :
// ils n'ajoutent que 145 et 167 lignes, mais 70 de leurs groupes portent des adresses
// différentes, c'est-à-dire des antennes réellement distinctes dans la même commune. Même
// piège que le rapprochement au SIREN, écarté pour les mêmes raisons.
//
// LIGNES `main` DÉTACHÉES — quand plusieurs employeuses d'un groupe sont déjà reliées à
// `main`, une seule survit à la fusion ; les lignes `main` des absorbées verraient leur
// `structure_coop_id` pointer dans le vide. On les DÉTACHE (`structure_coop_id = NULL`)
// avant la fusion, et on les exporte : ce sont des doublons de `main`, que seule l'équipe
// Entrepôt peut fusionner chez elle.
//
// Seules les tables `coop` sont écrites, plus ce détachement ciblé sur `main`.

type Employeuse = {
  id: string
  siret: string | null
  nom: string
  adresse: string
  commune: string
  codeInsee: string | null
  modification: Date
  _count: { emplois: number; activites: number }
}

type Groupe = {
  critere: string
  cible: Employeuse
  absorbees: Employeuse[]
}

const csvHeader = [
  'critere',
  'role',
  'statut',
  'id',
  'nom',
  'siret',
  'adresse',
  'commune',
  'emplois',
  'activites',
  'main_id',
  'main_detachee',
].join(';')

const detacheesCsvHeader = [
  'main_id',
  'main_siret',
  'main_denomination_sirene',
  'main_denomination_antenne',
  'coop_nom_absorbee',
  'coop_commune_absorbee',
  'coop_id_survivante',
  'coop_nom_survivante',
].join(';')

const escapeCsvField = (field: string | number | boolean | null): string => {
  const value = field === null ? '' : String(field)
  return /[";\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value
}

// Même normalisation que les requêtes d'audit : on désaccentue AVANT de retirer la
// ponctuation, sinon « Aubière » devient « AUBIRE » et ne rejoint plus « AUBIERE ».
const normaliser = (valeur: string): string =>
  valeur
    .normalize('NFD')
    .replaceAll(/\p{Diacritic}/gu, '')
    .replaceAll(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()

// Les clefs par lesquelles une employeuse peut rejoindre une autre. Une employeuse sans
// SIRET ne porte que sa clef d'identité ; sans code INSEE, elle ne porte que son SIRET.
const clefsDe = ({ siret, nom, adresse, codeInsee }: Employeuse): string[] =>
  [
    siret === null ? null : `siret:${siret}`,
    codeInsee === null
      ? null
      : `identite:${normaliser(nom)}|${normaliser(adresse)}|${codeInsee}`,
  ].filter((clef): clef is string => clef !== null)

const findEmployeuses = async (): Promise<Employeuse[]> =>
  prismaClient.structureAdministrative.findMany({
    where: { suppression: null },
    select: {
      id: true,
      siret: true,
      nom: true,
      adresse: true,
      commune: true,
      codeInsee: true,
      modification: true,
      _count: {
        select: {
          emplois: { where: { suppression: null } },
          activites: { where: { suppression: null } },
        },
      },
    },
  })

// Les employeuses coop connues de `main`, et la ligne `main` qui les porte. On ne filtre PAS
// sur `deleted_at` : une ligne `main` supprimée référence toujours son `structure_coop_id`.
const findLignesMainParEmployeuse = async (): Promise<Map<string, number>> => {
  const lignes = await entrepotPrismaClient.$queryRaw<
    { id: number; structure_coop_id: string }[]
  >`
    SELECT id, structure_coop_id
    FROM main.structure_administrative
    WHERE structure_coop_id IS NOT NULL
  `

  return new Map(
    lignes.map(({ id, structure_coop_id }) => [structure_coop_id, id]),
  )
}

// Composantes connexes du graphe « partage au moins une clef ». Un parcours en profondeur
// suffit : les groupes sont minuscules (9 membres au maximum sur la production).
const regrouper = (employeuses: Employeuse[]): Employeuse[][] => {
  const parClef = employeuses.reduce(
    (index, employeuse) =>
      clefsDe(employeuse).reduce(
        (acc, clef) => acc.set(clef, [...(acc.get(clef) ?? []), employeuse]),
        index,
      ),
    new Map<string, Employeuse[]>(),
  )

  const visitees = new Set<string>()

  const explorer = (employeuse: Employeuse): Employeuse[] => {
    if (visitees.has(employeuse.id)) return []
    visitees.add(employeuse.id)
    return [
      employeuse,
      ...clefsDe(employeuse).flatMap((clef) =>
        (parClef.get(clef) ?? []).flatMap(explorer),
      ),
    ]
  }

  return employeuses.map(explorer).filter((groupe) => groupe.length > 1)
}

// Cible = la plus riche, en privilégiant celle qui est déjà reliée à `main` : conserver un
// lien existant évite un détachement, et `mergeStructureAdministrative` complète la cible
// avec l'identité de la source (`siret: target.siret ?? source.siret`), jamais l'inverse.
const parPriorite =
  (lignesMain: Map<string, number>) => (a: Employeuse, b: Employeuse) =>
    Number(lignesMain.has(b.id)) - Number(lignesMain.has(a.id)) ||
    b._count.emplois - a._count.emplois ||
    b._count.activites - a._count.activites ||
    b.modification.getTime() - a.modification.getTime()

const critereDe = (groupe: Employeuse[]): string => {
  const sirets = new Set(
    groupe.map(({ siret }) => siret).filter((siret) => siret !== null),
  )
  return sirets.size === 1 && groupe.every(({ siret }) => siret !== null)
    ? 'siret'
    : 'identite'
}

const planifierGroupe =
  (lignesMain: Map<string, number>) =>
  (groupe: Employeuse[]): Groupe | null => {
    // Deux SIRET distincts sous une même identité : soit un transfert d'établissement, soit
    // deux entités homonymes à la même adresse. Ça ne se déduit pas, on laisse à l'humain.
    const sirets = new Set(
      groupe.map(({ siret }) => siret).filter((siret) => siret !== null),
    )
    if (sirets.size > 1) return null

    const [cible, ...absorbees] = [...groupe].sort(parPriorite(lignesMain))

    return { critere: critereDe(groupe), cible, absorbees }
  }

// Détacher AVANT la fusion : `mergeStructureAdministrative` supprime la ligne coop absorbée,
// dans l'ordre inverse `main` pointerait un instant vers une ligne disparue.
const detacherLigneMain = async (mainId: number, coopId: string) =>
  entrepotPrismaClient.$executeRaw`
    UPDATE main.structure_administrative
    SET structure_coop_id = NULL, updated_at = now(), updated_at_coop = now()
    WHERE id = ${mainId} AND structure_coop_id = ${coopId}::uuid
  `

export const executeDeduplicateEmployeuses = async (
  job: DeduplicateEmployeusesJob,
) => {
  const dryRun = job.payload?.dryRun ?? true
  const excludeSirets = new Set(job.payload?.excludeSirets ?? [])

  output.log(
    `deduplicate-employeuses: démarrage${dryRun ? ' (DRY RUN)' : ''}...`,
  )

  const [employeuses, lignesMain] = await Promise.all([
    findEmployeuses(),
    findLignesMainParEmployeuse(),
  ])

  const groupesBruts = regrouper(employeuses)

  const groupes = groupesBruts
    .filter((groupe) =>
      groupe.every(({ siret }) => siret === null || !excludeSirets.has(siret)),
    )
    .map(planifierGroupe(lignesMain))
    .filter((groupe): groupe is Groupe => groupe !== null)

  const ecartes = groupesBruts.length - groupes.length

  const absorbeesCount = groupes.reduce(
    (total, { absorbees }) => total + absorbees.length,
    0,
  )

  const aDetacher = groupes.flatMap(({ cible, absorbees }) =>
    absorbees.flatMap((absorbee) => {
      const mainId = lignesMain.get(absorbee.id)
      return mainId === undefined ? [] : [{ mainId, absorbee, cible }]
    }),
  )

  const parCritere = (critere: string) =>
    groupes.filter((groupe) => groupe.critere === critere).length

  output.log(
    `${groupes.length} groupes à fusionner (${parCritere('siret')} par SIRET, ` +
      `${parCritere('identite')} par identité), ${absorbeesCount} employeuses à absorber`,
  )
  output.log(`${aDetacher.length} lignes main à détacher`)
  if (ecartes > 0) {
    output.log(
      `${ecartes} groupes écartés (SIRET divergents, arbitrage humain)`,
    )
  }

  const applique = dryRun
    ? []
    : await groupes.reduce(
        async (precedent: Promise<Groupe[]>, groupe) => {
          const faits = await precedent

          await groupe.absorbees.reduce(async (attente, absorbee) => {
            await attente
            const mainId = lignesMain.get(absorbee.id)
            if (mainId !== undefined) {
              await detacherLigneMain(mainId, absorbee.id)
            }
            await mergeStructureAdministrative(absorbee.id, groupe.cible.id, {
              timeout: 120_000,
            })
          }, Promise.resolve())

          output.log(
            `  ${groupe.critere} : ${groupe.absorbees.length} absorbée(s) -> ${groupe.cible.id}`,
          )
          return [...faits, groupe]
        },
        Promise.resolve([] as Groupe[]),
      )

  const statut = dryRun ? 'a_fusionner' : 'fusionnee'

  const ligneCsv = (
    groupe: Groupe,
    employeuse: Employeuse,
    role: 'cible' | 'absorbee',
  ) =>
    [
      groupe.critere,
      role,
      role === 'cible' ? 'conservee' : statut,
      employeuse.id,
      employeuse.nom,
      employeuse.siret ?? '',
      employeuse.adresse,
      employeuse.commune,
      employeuse._count.emplois,
      employeuse._count.activites,
      lignesMain.get(employeuse.id) ?? '',
      role === 'absorbee' && lignesMain.has(employeuse.id),
    ]
      .map(escapeCsvField)
      .join(';')

  const csvLines = groupes.flatMap((groupe) => [
    ligneCsv(groupe, groupe.cible, 'cible'),
    ...groupe.absorbees.map((absorbee) =>
      ligneCsv(groupe, absorbee, 'absorbee'),
    ),
    '',
  ])

  const filePath = getAuditOutputPath(
    `deduplicate-employeuses-${dryRun ? 'dry-run' : 'applied'}.csv`,
  )
  await writeFile(filePath, [csvHeader, ...csvLines].join('\n'), 'utf-8')

  // Livrable pour l'équipe Entrepôt : les lignes `main` qui perdent leur lien coop parce
  // qu'elles doublonnent une autre ligne `main`. À elle de décider de les fusionner.
  const detachees =
    aDetacher.length === 0
      ? []
      : await entrepotPrismaClient.$queryRaw<
          {
            id: number
            siret: string | null
            denomination_sirene: string | null
            denomination_antenne: string | null
          }[]
        >`
          SELECT id, siret, denomination_sirene, denomination_antenne
          FROM main.structure_administrative
          WHERE id = ANY(${aDetacher.map(({ mainId }) => mainId)}::int[])
        `

  const detacheesParId = new Map(detachees.map((ligne) => [ligne.id, ligne]))

  const detacheesCsv = aDetacher.map(({ mainId, absorbee, cible }) => {
    const ligne = detacheesParId.get(mainId)
    return [
      mainId,
      ligne?.siret ?? '',
      ligne?.denomination_sirene ?? '',
      ligne?.denomination_antenne ?? '',
      absorbee.nom,
      absorbee.commune,
      cible.id,
      cible.nom,
    ]
      .map(escapeCsvField)
      .join(';')
  })

  const detacheesPath = getAuditOutputPath(
    `lignes-main-detachees-${dryRun ? 'dry-run' : 'applied'}.csv`,
  )
  await writeFile(
    detacheesPath,
    [detacheesCsvHeader, ...detacheesCsv].join('\n'),
    'utf-8',
  )

  output.log(`\n=== DÉDUPLICATION EMPLOYEUSES ${dryRun ? '(DRY RUN)' : ''} ===`)
  output.log(`Groupes: ${groupes.length} (écartés: ${ecartes})`)
  output.log(`${dryRun ? 'À absorber' : 'Absorbées'}: ${absorbeesCount}`)
  output.log(`${dryRun ? 'À détacher' : 'Détachées'}: ${aDetacher.length}`)
  output.log(`Export: ${filePath}`)
  output.log(`Export lignes main détachées: ${detacheesPath}`)
  output.log(`\ndeduplicate-employeuses: terminé`)

  return {
    dryRun,
    groupes: groupes.length,
    ecartes,
    absorbees: absorbeesCount,
    detachees: aDetacher.length,
    appliques: applique.length,
    export: filePath,
    exportDetachees: detacheesPath,
  }
}
