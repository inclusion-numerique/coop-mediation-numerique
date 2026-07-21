import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { entrepotPrismaClient } from '@app/web/entrepotPrismaClient'
import { mergeStructureAdministrative } from '@app/web/features/structures/use-cases/merge/mutations/mergeStructureAdministrative'
import { getAuditOutputPath } from '@app/web/jobs/audit-output'
import { output } from '@app/web/jobs/output'
import { creerLigneMain } from '@app/web/jobs/structures-main/creerLigneMain'
import {
  reclamerLigneMain,
  trouverLigneAReclamer,
} from '@app/web/jobs/structures-main/reclamerLigneMain'
import { prismaClient } from '@app/web/prismaClient'
import { parse } from 'csv-parse/sync'
import type { AppliquerPlanCouvertureJob } from './appliquerPlanCouvertureJob'

// Applique le plan de couverture employeuses coop -> `main`, tel qu'ARBITRÉ À LA MAIN
// dans le CSV produit par `refactor/audit-coop-main/export-plan.sh` : chaque groupe y
// porte une colonne `Apply` (OK / NOK) posée par un humain. Seuls les groupes OK sont
// exécutés ; les NOK sont comptés et re-listés, jamais appliqués.
//
// L'objectif est la COUVERTURE : que chaque `coop.structure_administrative` ait sa ligne
// `main.structure_administrative` portant son `structure_coop_id`. La cohérence des
// données n'est pas visée — on ne corrige ni nom, ni adresse.
//
// Trois actions, dans cet ordre :
//   LIER      -> poser `structure_coop_id` sur une ligne `main` libre.
//   FUSIONNER -> absorber les orphelines dans une jumelle coop déjà liée (suppression dure).
//   CREER     -> créer adresse + ligne `main` quand le SIRET n'y existe pas du tout.
//
// CIBLE DISPUTÉE — `structure_coop_id` est UNIQUE : deux orphelines ne peuvent pas viser
// la même ligne `main`. Quand le CSV en valide plusieurs, celle qui porte le plus
// d'activités prend la place et les autres sont FUSIONNÉES dans elle (arbitrage validé
// avec le métier : ce sont des doublons stricts — même nom, adresse, SIRET, commune).

type LignePlan = {
  groupe: string
  action: string
  role: string
  nom: string
  siret: string
  commune: string
  code_postal: string
  adresse: string
  activites: string
  identifiant: string
  Apply: string
}

type Groupe = {
  numero: string
  action: string
  lignes: LignePlan[]
  decision: string
}

type Liaison = {
  coopId: string
  mainId: number
  nom: string
  activites: number
}
type Fusion = { sourceId: string; cibleId: string; nom: string; motif: string }
type Creation = {
  coopId: string
  nom: string
  siret: string
  commune: string
  codePostal: string
  adresse: string
}

const csvHeader = ['action', 'statut', 'nom', 'detail'].join(';')

const escapeCsvField = (field: string | number): string => {
  const value = String(field)
  return /[";\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value
}

const ligneDuRole = (groupe: Groupe, role: string): LignePlan | undefined =>
  groupe.lignes.find((ligne) => ligne.role === role)

const lignesDuRole = (groupe: Groupe, role: string): LignePlan[] =>
  groupe.lignes.filter((ligne) => ligne.role === role)

// Un groupe = un bloc de lignes partageant le même numéro. La décision est portée par
// la ligne cible (`cible_main`), ou par la ligne source pour une création sans cible.
const grouper = (lignes: LignePlan[]): Groupe[] => [
  ...lignes
    .reduce((groupes, ligne) => {
      const existant = groupes.get(ligne.groupe)
      return groupes.set(ligne.groupe, {
        numero: ligne.groupe,
        action: existant?.action ?? ligne.action,
        lignes: [...(existant?.lignes ?? []), ligne],
        decision: ligne.Apply.trim() || (existant?.decision ?? ''),
      })
    }, new Map<string, Groupe>())
    .values(),
]

// Deux liaisons validées sur la même ligne `main` : la plus riche en activités la prend,
// les autres deviennent des fusions dans celle-ci.
const arbitrerCiblesDisputees = (
  liaisons: Liaison[],
): { retenues: Liaison[]; reconverties: Fusion[] } => {
  const parCible = liaisons.reduce(
    (parMainId, liaison) =>
      parMainId.set(liaison.mainId, [
        ...(parMainId.get(liaison.mainId) ?? []),
        liaison,
      ]),
    new Map<number, Liaison[]>(),
  )

  const arbitrages = [...parCible.values()].map((concurrentes) => {
    const [gagnante, ...perdantes] = [...concurrentes].sort(
      (a, b) => b.activites - a.activites,
    )
    return {
      gagnante,
      perdantes: perdantes.map((perdante) => ({
        sourceId: perdante.coopId,
        cibleId: gagnante.coopId,
        nom: perdante.nom,
        motif: `cible ${gagnante.mainId} disputée`,
      })),
    }
  })

  return {
    retenues: arbitrages.map(({ gagnante }) => gagnante),
    reconverties: arbitrages.flatMap(({ perdantes }) => perdantes),
  }
}

// L'UPDATE re-vérifie `structure_coop_id IS NULL` : si la ligne a été prise entre le
// calcul et l'écriture, on ne l'écrase pas — le compteur renvoyé vaut alors 0.
const poserLien = async ({ coopId, mainId }: Liaison): Promise<boolean> => {
  const misesAJour = await entrepotPrismaClient.$executeRaw`
    UPDATE main.structure_administrative
    SET structure_coop_id = ${coopId}::uuid, updated_at = now(), updated_at_coop = now()
    WHERE id = ${mainId}
      AND structure_coop_id IS NULL
  `
  return misesAJour === 1
}

// Création dans `main` : déléguée à `creerLigneMain`, partagée avec
// `couvrir-employeuses-restantes` — réutilisation d'adresse, choix d'antenne et transaction.
// Le CSV ne porte pas le code INSEE : on relit la ligne coop d'origine.
const creerDansMain = async (creation: Creation): Promise<boolean> => {
  const structure = await prismaClient.structureAdministrative.findUnique({
    where: { id: creation.coopId },
    select: {
      id: true,
      siret: true,
      nom: true,
      adresse: true,
      commune: true,
      codePostal: true,
      codeInsee: true,
    },
  })

  if (structure === null) {
    output.log(`  création ${creation.nom} ignorée : introuvable côté coop`)
    return false
  }

  // Ne JAMAIS créer quand une ligne `main` porte déjà le SIRET de l'employeuse et son
  // identité légale : on la réclame à l'occupante qui n'y a pas droit. Créer fabriquerait
  // un doublon dans un schéma co-possédé avec l'Entrepôt.
  const reclamation = await trouverLigneAReclamer(structure)

  if (reclamation !== null) {
    const reprise = await reclamerLigneMain(structure.id, reclamation)
    output.log(`  ${creation.nom} : ${reprise.detail}`)
    return reprise.statut === 'reclamee'
  }

  const resultat = await creerLigneMain(structure)

  if (resultat.statut !== 'creee') {
    output.log(
      `  création ${creation.nom} ${resultat.statut} : ${resultat.detail}`,
    )
  }

  // `liee` est un succès : `creerLigneMain` a trouvé une ligne `main` libre au même SIRET et
  // dans la même commune, et s'y est raccrochée au lieu d'en fabriquer une seconde.
  return resultat.statut === 'creee' || resultat.statut === 'liee'
}

export const executeAppliquerPlanCouverture = async (
  job: AppliquerPlanCouvertureJob,
) => {
  const { dryRun, csvPath } = job.payload

  output.log(
    `appliquer-plan-couverture: démarrage${dryRun ? ' (DRY RUN)' : ''}...`,
  )

  const texte = await readFile(join(process.cwd(), csvPath), 'utf-8')
  const lignes = parse(texte, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as LignePlan[]

  // Les séparateurs de groupes peuvent être réenregistrés en lignes de virgules vides
  // (`,,,,`) par un tableur : `skip_empty_lines` ne les voit pas, on les écarte ici.
  const groupes = grouper(lignes.filter(({ groupe }) => groupe.trim() !== ''))
  const valides = groupes.filter(({ decision }) => decision === 'OK')
  const refuses = groupes.filter(({ decision }) => decision === 'NOK')
  const sansDecision = groupes.filter(
    ({ decision }) => decision !== 'OK' && decision !== 'NOK',
  )

  output.log(
    `${groupes.length} groupes lus : ${valides.length} OK, ${refuses.length} NOK` +
      `${sansDecision.length > 0 ? `, ${sansDecision.length} SANS DÉCISION (ignorés)` : ''}`,
  )

  // ── Plan ──
  const liaisonsBrutes = valides
    .filter(({ action }) => action === 'LIER')
    .flatMap((groupe) => {
      const source = ligneDuRole(groupe, 'a_lier')
      const cible = ligneDuRole(groupe, 'cible_main')
      return source && cible
        ? [
            {
              coopId: source.identifiant,
              mainId: Number(cible.identifiant),
              nom: source.nom,
              activites: Number(source.activites) || 0,
            },
          ]
        : []
    })

  const { retenues, reconverties } = arbitrerCiblesDisputees(liaisonsBrutes)

  const fusions = valides
    .filter(({ action }) => action === 'FUSIONNER')
    .flatMap((groupe) => {
      const cible = ligneDuRole(groupe, 'cible_coop')
      return cible
        ? lignesDuRole(groupe, 'a_absorber').map((source) => ({
            sourceId: source.identifiant,
            cibleId: cible.identifiant,
            nom: source.nom,
            motif: 'plan',
          }))
        : []
    })

  const creations = valides
    .filter(({ action }) => action === 'CREER')
    .flatMap((groupe) => {
      const source = ligneDuRole(groupe, 'a_creer')
      return source
        ? [
            {
              coopId: source.identifiant,
              nom: source.nom,
              siret: source.siret,
              commune: source.commune,
              codePostal: source.code_postal,
              adresse: source.adresse,
            },
          ]
        : []
    })

  const toutesFusions = [...fusions, ...reconverties]

  output.log(
    `Plan : ${retenues.length} liaisons, ${toutesFusions.length} fusions ` +
      `(dont ${reconverties.length} issues d'une cible disputée), ${creations.length} création(s)`,
  )

  // ── Exécution ──
  const liaisonsPosees = dryRun
    ? []
    : await retenues.reduce(async (precedent: Promise<Liaison[]>, liaison) => {
        const faites = await precedent
        const posee = await poserLien(liaison)
        return posee ? [...faites, liaison] : faites
      }, Promise.resolve([]))

  const fusionsFaites = dryRun
    ? []
    : await toutesFusions.reduce(
        async (precedent: Promise<Fusion[]>, fusion) => {
          const faites = await precedent
          return mergeStructureAdministrative(fusion.sourceId, fusion.cibleId)
            .then(() => [...faites, fusion])
            .catch((error: unknown) => {
              output.log(
                `  fusion ${fusion.nom} ignorée : ${String(error).slice(0, 90)}`,
              )
              return faites
            })
        },
        Promise.resolve([]),
      )

  const creationsFaites = dryRun
    ? []
    : await creations.reduce(
        async (precedent: Promise<Creation[]>, creation) => {
          const faites = await precedent
          return creerDansMain(creation)
            .then((creee) => (creee ? [...faites, creation] : faites))
            .catch((error: unknown) => {
              output.log(
                `  création ${creation.nom} ignorée : ${String(error).slice(0, 90)}`,
              )
              return faites
            })
        },
        Promise.resolve([]),
      )

  // ── Trace ──
  const csvLines = [
    ...retenues.map((liaison) =>
      [
        'LIER',
        dryRun
          ? 'a_faire'
          : liaisonsPosees.includes(liaison)
            ? 'fait'
            : 'echec',
        liaison.nom,
        `coop ${liaison.coopId} -> main ${liaison.mainId}`,
      ].map(escapeCsvField),
    ),
    ...toutesFusions.map((fusion) =>
      [
        'FUSIONNER',
        dryRun ? 'a_faire' : fusionsFaites.includes(fusion) ? 'fait' : 'echec',
        fusion.nom,
        `${fusion.sourceId} absorbée par ${fusion.cibleId} (${fusion.motif})`,
      ].map(escapeCsvField),
    ),
    ...creations.map((creation) =>
      [
        'CREER',
        dryRun
          ? 'a_faire'
          : creationsFaites.includes(creation)
            ? 'fait'
            : 'echec',
        creation.nom,
        `siret ${creation.siret} pour coop ${creation.coopId}`,
      ].map(escapeCsvField),
    ),
    ...refuses.map((groupe) =>
      [
        groupe.action,
        'refuse_NOK',
        ligneDuRole(groupe, 'a_lier')?.nom ??
          ligneDuRole(groupe, 'a_absorber')?.nom ??
          '',
        `groupe ${groupe.numero}`,
      ].map(escapeCsvField),
    ),
  ].map((champs) => champs.join(';'))

  const filePath = getAuditOutputPath(
    `appliquer-plan-couverture-${dryRun ? 'dry-run' : 'applied'}.csv`,
  )
  await writeFile(filePath, [csvHeader, ...csvLines].join('\n'), 'utf-8')

  output.log(`\n=== PLAN DE COUVERTURE ${dryRun ? '(DRY RUN)' : ''} ===`)
  output.log(
    `Liaisons  : ${dryRun ? retenues.length : liaisonsPosees.length} / ${retenues.length}`,
  )
  output.log(
    `Fusions   : ${dryRun ? toutesFusions.length : fusionsFaites.length} / ${toutesFusions.length}`,
  )
  output.log(
    `Créations : ${dryRun ? creations.length : creationsFaites.length} / ${creations.length}`,
  )
  output.log(`Refusés (NOK, non appliqués) : ${refuses.length}`)
  output.log(`Export: ${filePath}`)
  output.log(`\nappliquer-plan-couverture: terminé`)

  return {
    dryRun,
    groupes: groupes.length,
    valides: valides.length,
    refuses: refuses.length,
    sansDecision: sansDecision.length,
    liaisons: dryRun ? retenues.length : liaisonsPosees.length,
    fusions: dryRun ? toutesFusions.length : fusionsFaites.length,
    creations: dryRun ? creations.length : creationsFaites.length,
    export: filePath,
  }
}
