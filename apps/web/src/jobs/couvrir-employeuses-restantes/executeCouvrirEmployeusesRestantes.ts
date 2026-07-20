import { writeFile } from 'node:fs/promises'
import { entrepotPrismaClient } from '@app/web/entrepotPrismaClient'
import { mergeStructureAdministrative } from '@app/web/features/structures/use-cases/merge/mutations/mergeStructureAdministrative'
import { getAuditOutputPath } from '@app/web/jobs/audit-output'
import { output } from '@app/web/jobs/output'
import { prismaClient } from '@app/web/prismaClient'
import type { CouvrirEmployeusesRestantesJob } from './couvrirEmployeusesRestantesJob'

// Solde les 6 dernières employeuses coop sans équivalent dans `main`, une fois les lots
// automatisables épuisés. Chaque cas a été instruit individuellement (SIRENE via l'API
// Recherche d'entreprises, SIRET ProConnect des employés, contenu réel de `main`) : le plan
// est donc une TABLE DÉCLARATIVE et non une heuristique. Chaque entrée porte sa raison.
//
// Le point qui a débloqué 3 cas sur 6 : une employeuse coop peut avoir sa ligne dans `main`
// sous un AUTRE ÉTABLISSEMENT du même SIREN. Chercher à SIRET strictement égal les masque.
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
    action: 'lier',
    coopId: '8339213d-4b87-40eb-aa69-9e2b5fd95751',
    mainId: 10189,
    libelle: 'Emmaüs Connect Grenoble',
    raison:
      'main 10189 = « Emmaüs Connect Grenoble », 7 allée du Jardin Hoche, Grenoble : ' +
      'adresse identique. Porte le siret ...600067 (autre établissement du SIREN 792272916). ' +
      "SIRENE : aucun établissement Emmaüs en Isère, le lieu n'est pas immatriculé.",
  },
  {
    action: 'lier',
    coopId: 'dee97d20-5a2f-4966-8fed-3021ec6f4974',
    mainId: 10183,
    libelle: 'Emmaüs Connect Roubaix',
    raison:
      'main 10183 = « EMMAUS CONNECT FONDATEUR... », 10 Mail de Lannoy, Roubaix : ' +
      'adresse identique. Porte le siret ...600042 (autre établissement du même SIREN). ' +
      'SIRENE : aucun établissement à Roubaix, le seul du Nord est à Lille.',
  },
  {
    action: 'lier',
    coopId: 'e777fdb2-677a-459b-93ac-dcc7531dc586',
    mainId: 4201,
    libelle: 'France services Pôle numérique de Pierrefitte',
    raison:
      'main 4201 = « Pôle numérique de la mairie de Pierrefitte », Pierrefitte-sur-Seine 93380 : ' +
      'nom identique, même avenue (16 vs 18). Le siret 21930059700016 est mort des DEUX côtés ' +
      '(commune fusionnée avec Saint-Denis au 01/01/2025) : les deux bases restent cohérentes.',
  },
  {
    action: 'transferer',
    coopId: 'd966fef8-cf1e-49c9-851e-ace4da195843',
    mainId: 10726,
    absorbeeId: 'fd469c5c-f569-47d3-a81b-f34f0cc6464b',
    libelle: 'Association Forum du Pays Provinois',
    raison:
      'SIRENE : ...00022 (Longueville) est le siège ACTIF depuis le 11/10/2024, ...00014 ' +
      "(Provins) est l'ancien siège FERMÉ le même jour (ancien_siege: true). La ligne coop " +
      "qui occupe main 10726 porte l'ancien siret : on repointe 10726 vers le siège actif, " +
      "puis on absorbe l'obsolète. Fusionner dans l'autre sens conserverait l'établissement mort.",
  },
  {
    action: 'creer',
    coopId: '7b3e274d-d52f-461b-86ab-9eaffc5a4ba0',
    libelle: 'FRANCE TRAVAIL (siège, Le Cinétic Paris 20e)',
    raison:
      'SIRENE : 13000548100010 est le BON siret, Le Cinétic est bien le siège / direction ' +
      'générale à cette adresse. Les 5 employés portent tous ce même siret ProConnect. ' +
      "`main` a des dizaines d'agences France Travail mais AUCUNE à Paris : rien à quoi se lier.",
  },
  {
    action: 'creer',
    coopId: 'f3b1e975-3f80-4e1a-acae-cf6e4d8110d8',
    libelle: 'COMMUNE ASSOCIEE DE LOMME (mairie)',
    raison:
      'SIRENE : 21590355000014 est le BON siret (mairie de Lomme, entité distincte de Lille, ' +
      'adresse et code INSEE exacts). `main` ne contient que les deux EPN (Cyber Espaces Marais ' +
      'et Mont à Camp), aucune ligne ne porte la mairie. Aucun employé rattaché, aucune piste.',
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
