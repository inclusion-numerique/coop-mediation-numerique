import { writeFile } from 'node:fs/promises'
import { entrepotPrismaClient } from '@app/web/entrepotPrismaClient'
import { mergeStructureAdministrative } from '@app/web/features/structures/use-cases/merge/mutations/mergeStructureAdministrative'
import { getAuditOutputPath } from '@app/web/jobs/audit-output'
import { output } from '@app/web/jobs/output'
import { prismaClient } from '@app/web/prismaClient'
import type { CouvrirEmployeusesRestantesJob } from './couvrirEmployeusesRestantesJob'

// Solde les employeuses coop que le plan de couverture ne sait pas traiter, parce que la
// CRÉATION y est impossible : la place `(siret, denomination_antenne NULL)` est déjà prise
// dans `main` par une autre ligne coop. Table DÉCLARATIVE, instruite cas par cas.
//
// Repérage : `refactor/audit-coop-main/collisions-creation.sql`.
//
// RÈGLE — quand cette place est occupée, l'occupante de cette ligne précise est le partenaire
// de fusion, QUEL QUE SOIT son SIRET : la ligne `main` porte déjà le SIRET de l'orpheline,
// donc l'occupante revendique une identité qui n'est pas la sienne. C'est une règle étroite
// et sûre. NE PAS la généraliser en « chercher une jumelle dans tout le SIREN » : mesuré sur
// la base de prod, 25 452 paires coop de même SIREN sont dans des communes différentes contre
// 224 dans la même — ce serait ~99 % de fusions abusives (La Poste Argelès avec La Poste Tarbes).
//
// SENS DE LA FUSION — contre-intuitif : c'est l'ORPHELINE qui survit, alors qu'elle est
// souvent la plus pauvre en activités. `completeTargetIdentity` fait `siret: target.siret ??
// source.siret` et ne remplace jamais une valeur existante : fusionner dans l'autre sens
// laisserait la survivante sans SIRET (POSSE 33) ou avec un SIRET fermé (Forum du Pays Provinois).
//
// Objectif : la COUVERTURE (chaque ligne coop a sa ligne `main` portant son
// `structure_coop_id`). La cohérence des données n'est pas visée.

type Cas =
  // La ligne `main` existe et est libre : on y pose le lien.
  | {
      action: 'lier'
      coopId: string
      mainId: number
      libelle: string
      raison: string
    }
  // La ligne `main` est occupée par une jumelle coop obsolète : on repointe PUIS on absorbe.
  | {
      action: 'transferer'
      coopId: string
      mainId: number
      absorbeeId: string
      libelle: string
      raison: string
    }
  // Aucune ligne `main` ne porte l'identité légale : on la crée (antenne NULL libre).
  | { action: 'creer'; coopId: string; libelle: string; raison: string }

const PLAN: Cas[] = [
  {
    action: 'transferer',
    coopId: '554f3338-f40f-4bd4-9fef-865dcde05482',
    mainId: 8212,
    absorbeeId: '1e10ac29-af83-48fa-95e1-e85ae0491489',
    libelle: 'POSSE 33 (Chambéry)',
    raison:
      "Même structure saisie deux fois au 24 avenue Daniel-Rops à Chambéry : l'orpheline " +
      "porte le siret 41067254700032, l'occupante « Posse 33 Chambéry » n'en a AUCUN mais " +
      'détient le lien et les 304 activités. La ligne main 8212 porte ce siret : elle revient ' +
      "donc à l'orpheline, qui absorbe l'occupante et récupère son historique.",
  },
  {
    action: 'transferer',
    coopId: 'd966fef8-cf1e-49c9-851e-ace4da195843',
    mainId: 10726,
    absorbeeId: 'fd469c5c-f569-47d3-a81b-f34f0cc6464b',
    libelle: 'Association Forum du Pays Provinois',
    raison:
      'SIRENE : ...00022 (Longueville) est le siège ACTIF depuis le 11/10/2024, ...00014 ' +
      "(Provins) est l'ancien siège FERMÉ le même jour (ancien_siege: true). L'occupante de " +
      "main 10726 porte l'ancien siret alors que la ligne main porte le nouveau : on repointe " +
      "vers le siège actif puis on absorbe l'obsolète.",
  },
]

const csvHeader = ['action', 'statut', 'libelle', 'detail'].join(';')

const escapeCsvField = (field: string | number): string => {
  const value = String(field)
  return /[";\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value
}

type Resultat = {
  cas: Cas
  statut: 'fait' | 'deja_couverte' | 'echec'
  detail: string
}

const estDejaCouverte = async (coopId: string): Promise<boolean> => {
  const lignes = await entrepotPrismaClient.$queryRaw<{ id: number }[]>`
    SELECT id FROM main.structure_administrative WHERE structure_coop_id = ${coopId}::uuid
  `
  return lignes.length > 0
}

// L'UPDATE re-vérifie `structure_coop_id IS NULL` : si la ligne a été prise entre-temps,
// on ne l'écrase pas — le compteur vaut alors 0 et l'opération est signalée en échec.
const lier = async (coopId: string, mainId: number): Promise<boolean> => {
  const misesAJour = await entrepotPrismaClient.$executeRaw`
    UPDATE main.structure_administrative
    SET structure_coop_id = ${coopId}::uuid, updated_at = now(), updated_at_coop = now()
    WHERE id = ${mainId}
      AND structure_coop_id IS NULL
  `
  return misesAJour === 1
}

// Repointer AVANT d'absorber : dans l'ordre inverse, la suppression de l'absorbée
// laisserait `main` pointer vers une ligne coop disparue.
const transferer = async (
  coopId: string,
  mainId: number,
  absorbeeId: string,
): Promise<boolean> => {
  const misesAJour = await entrepotPrismaClient.$executeRaw`
    UPDATE main.structure_administrative
    SET structure_coop_id = ${coopId}::uuid, updated_at = now(), updated_at_coop = now()
    WHERE id = ${mainId}
      AND structure_coop_id = ${absorbeeId}::uuid
  `

  if (misesAJour !== 1) {
    return false
  }

  await mergeStructureAdministrative(absorbeeId, coopId)
  return true
}

const decouperAdresse = (adresse: string) => {
  const correspondance = /^(\d+)\s+(.*)$/.exec(adresse.trim())
  return {
    numeroVoie: correspondance ? Number(correspondance[1]) : null,
    nomVoie: correspondance ? correspondance[2] : adresse.trim() || null,
  }
}

// Création de la ligne portant l'IDENTITÉ LÉGALE : `denomination_antenne` reste NULL,
// place libre sur ces sirets (contrainte unique `(siret, denomination_antenne)` en
// NULLS NOT DISTINCT : une seule ligne par siret peut l'occuper).
// Les deux INSERT sont dans UNE transaction : un échec ne doit pas laisser d'adresse orpheline.
const creer = async (coopId: string): Promise<string> => {
  const structure = await prismaClient.structureAdministrative.findUnique({
    where: { id: coopId },
    select: {
      nom: true,
      siret: true,
      adresse: true,
      commune: true,
      codePostal: true,
      codeInsee: true,
    },
  })

  if (!structure || structure.codeInsee === null || structure.siret === null) {
    return 'ignorée : siret ou code INSEE absent côté coop'
  }

  const { numeroVoie, nomVoie } = decouperAdresse(structure.adresse)

  return entrepotPrismaClient
    .$transaction(async (transaction) => {
      const adresses = await transaction.$queryRaw<{ id: number }[]>`
        INSERT INTO main.adresse
          (code_postal, code_insee, nom_commune, nom_voie, numero_voie, created_at, updated_at)
        VALUES (${structure.codePostal}, ${structure.codeInsee}, ${structure.commune},
                ${nomVoie}, ${numeroVoie}, now(), now())
        RETURNING id`

      const adresseId = adresses.at(0)?.id ?? null

      const creees = await transaction.$executeRaw`
        INSERT INTO main.structure_administrative
          (siret, denomination_sirene, adresse_id, structure_coop_id, edited_by,
           created_at, updated_at, updated_at_coop)
        VALUES (${structure.siret}, ${structure.nom}, ${adresseId}, ${coopId}::uuid,
                'coop', now(), now(), now())`

      return creees === 1
        ? `créée (adresse ${adresseId}, siret ${structure.siret})`
        : 'échec insertion'
    })
    .catch((error: unknown) => `échec : ${String(error).slice(0, 90)}`)
}

const executer = async (cas: Cas): Promise<Resultat> => {
  // Idempotence : si la ligne coop est déjà couverte, on ne retouche rien.
  const dejaCouverte = await estDejaCouverte(cas.coopId)

  if (dejaCouverte) {
    return {
      cas,
      statut: 'deja_couverte',
      detail: 'déjà couverte, rien à faire',
    }
  }

  if (cas.action === 'lier') {
    const pose = await lier(cas.coopId, cas.mainId)
    return pose
      ? { cas, statut: 'fait', detail: `liée à main ${cas.mainId}` }
      : { cas, statut: 'echec', detail: `main ${cas.mainId} n'est plus libre` }
  }

  if (cas.action === 'transferer') {
    const transfere = await transferer(cas.coopId, cas.mainId, cas.absorbeeId)
    return transfere
      ? {
          cas,
          statut: 'fait',
          detail: `main ${cas.mainId} repointée, ${cas.absorbeeId} absorbée`,
        }
      : {
          cas,
          statut: 'echec',
          detail: `main ${cas.mainId} ne pointe plus vers ${cas.absorbeeId}`,
        }
  }

  const detail = await creer(cas.coopId)
  return {
    cas,
    statut: detail.startsWith('créée') ? 'fait' : 'echec',
    detail,
  }
}

export const executeCouvrirEmployeusesRestantes = async (
  job: CouvrirEmployeusesRestantesJob,
) => {
  const dryRun = job.payload?.dryRun ?? true

  output.log(
    `couvrir-employeuses-restantes: démarrage${dryRun ? ' (DRY RUN)' : ''}...`,
  )

  const etats = await Promise.all(
    PLAN.map(async (cas) => ({
      cas,
      couverte: await estDejaCouverte(cas.coopId),
    })),
  )

  const aTraiter = etats.filter(({ couverte }) => !couverte)

  output.log(
    `${PLAN.length} cas au plan, ${aTraiter.length} à traiter ` +
      `(${PLAN.length - aTraiter.length} déjà couverts)`,
  )

  const resultats = dryRun
    ? etats.map(
        ({ cas, couverte }): Resultat => ({
          cas,
          statut: couverte ? 'deja_couverte' : 'fait',
          detail: couverte
            ? 'déjà couverte, rien à faire'
            : cas.action === 'creer'
              ? 'à créer dans main (antenne NULL)'
              : `à ${cas.action} vers main ${cas.mainId}`,
        }),
      )
    : await PLAN.reduce(async (precedent: Promise<Resultat[]>, cas) => {
        const faits = await precedent
        const resultat = await executer(cas)
        output.log(
          `  ${resultat.statut.padEnd(14)} ${cas.libelle} — ${resultat.detail}`,
        )
        return [...faits, resultat]
      }, Promise.resolve([]))

  const csvLines = resultats.map(({ cas, statut, detail }) =>
    [cas.action, statut, cas.libelle, detail].map(escapeCsvField).join(';'),
  )

  const filePath = getAuditOutputPath(
    `couvrir-employeuses-restantes-${dryRun ? 'dry-run' : 'applied'}.csv`,
  )
  await writeFile(filePath, [csvHeader, ...csvLines].join('\n'), 'utf-8')

  const compter = (statut: Resultat['statut']) =>
    resultats.filter((resultat) => resultat.statut === statut).length

  output.log(
    `\n=== COUVERTURE DES DERNIÈRES EMPLOYEUSES ${dryRun ? '(DRY RUN)' : ''} ===`,
  )
  output.log(
    `Liaisons    : ${PLAN.filter((cas) => cas.action === 'lier').length}`,
  )
  output.log(
    `Transferts  : ${PLAN.filter((cas) => cas.action === 'transferer').length}`,
  )
  output.log(
    `Créations   : ${PLAN.filter((cas) => cas.action === 'creer').length}`,
  )
  output.log(`${dryRun ? 'À faire' : 'Faits'} : ${compter('fait')}`)
  output.log(`Déjà couvertes : ${compter('deja_couverte')}`)
  output.log(`Échecs      : ${compter('echec')}`)
  output.log(`Export: ${filePath}`)
  output.log(`\ncouvrir-employeuses-restantes: terminé`)

  return {
    dryRun,
    cas: PLAN.length,
    faits: compter('fait'),
    dejaCouvertes: compter('deja_couverte'),
    echecs: compter('echec'),
    export: filePath,
  }
}
