import { writeFile } from 'node:fs/promises'
import { entrepotPrismaClient } from '@app/web/entrepotPrismaClient'
import { getAuditOutputPath } from '@app/web/jobs/audit-output'
import { output } from '@app/web/jobs/output'
import {
  choisirAntenne,
  creerLigneMain,
} from '@app/web/jobs/structures-main/creerLigneMain'
import { prismaClient } from '@app/web/prismaClient'
import type { CouvrirEmployeusesRestantesJob } from './couvrirEmployeusesRestantesJob'

// JOB DE CLÔTURE : crée dans `main` une ligne pour CHAQUE employeuse coop encore sans
// équivalent, afin d'amener le delta à ZÉRO — prérequis pour repointer les clés étrangères
// de coop vers main.
//
// ⚠️ À EXÉCUTER EN DERNIER, après `appliquer-plan-couverture`. Lancé avant, il créerait des
// lignes pour des employeuses qui avaient une cible parfaitement valable dans `main`.
//
// Trois pièges, tous constatés en exécution réelle :
//
//   1. `main.adresse` porte une contrainte unique sur (code_postal, nom_commune, nom_voie,
//      numero_voie, repetition). Insérer une adresse déjà présente échoue : on RÉUTILISE
//      la ligne existante.
//   2. `main.structure_administrative` porte une contrainte unique sur (siret,
//      denomination_antenne) en NULLS NOT DISTINCT : un seul enregistrement par siret peut
//      avoir une antenne nulle. On prend cette place si elle est libre — c'est la ligne qui
//      porte l'identité légale — sinon on nomme l'antenne d'après la structure coop.
//   3. Les deux écritures doivent être dans UNE transaction : sans cela, un échec sur la
//      structure laisse une adresse orpheline (constaté, 2 lignes à nettoyer à la main).

type Employeuse = {
  id: string
  siret: string | null
  nom: string
  adresse: string
  commune: string
  codePostal: string
  codeInsee: string | null
}

type Resultat = {
  employeuse: Employeuse
  statut: 'creee' | 'deja_couverte' | 'ignoree' | 'echec'
  detail: string
}

const csvHeader = ['statut', 'nom', 'siret', 'commune', 'detail'].join(';')

const escapeCsvField = (field: string | number): string => {
  const value = String(field)
  return /[";\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value
}

// Les fixtures locales n'existent pas en production ; leur créer une ligne `main`
// polluerait l'Entrepôt avec des données de démonstration.
const FIXTURES = [
  '36929ed7-3b6f-4ed3-9924-b5e1a6c27096',
  'f4dbca97-6fe8-4be1-97be-bdf5e66b9ea8',
]

const findEmployeusesSansEquivalent = async (): Promise<Employeuse[]> => {
  const couvertes = await entrepotPrismaClient.$queryRaw<
    { structure_coop_id: string }[]
  >`
    SELECT structure_coop_id FROM main.structure_administrative
    WHERE structure_coop_id IS NOT NULL
  `
  const couvertesIds = new Set(
    couvertes.map(({ structure_coop_id }) => structure_coop_id),
  )

  const employeuses = await prismaClient.structureAdministrative.findMany({
    where: { suppression: null, id: { notIn: FIXTURES } },
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

  return employeuses.filter(({ id }) => !couvertesIds.has(id))
}

const creer = async (employeuse: Employeuse): Promise<Resultat> => {
  const resultat = await creerLigneMain(employeuse)
  return { employeuse, statut: resultat.statut, detail: resultat.detail }
}

export const executeCouvrirEmployeusesRestantes = async (
  job: CouvrirEmployeusesRestantesJob,
) => {
  const dryRun = job.payload?.dryRun ?? true

  output.log(
    `couvrir-employeuses-restantes: démarrage${dryRun ? ' (DRY RUN)' : ''}...`,
  )

  const restantes = await findEmployeusesSansEquivalent()

  output.log(`${restantes.length} employeuses coop sans équivalent dans main`)

  const resultats = dryRun
    ? await Promise.all(
        restantes.map(async (employeuse): Promise<Resultat> => {
          const { antenne, disponible } = employeuse.siret
            ? await choisirAntenne(employeuse)
            : { antenne: null, disponible: false }
          return {
            employeuse,
            statut: disponible ? 'creee' : 'ignoree',
            detail: disponible
              ? `à créer, antenne ${antenne === null ? 'NULL' : `« ${antenne} »`}`
              : 'siret absent ou aucun nom d’antenne disponible',
          }
        }),
      )
    : await restantes.reduce(
        async (precedent: Promise<Resultat[]>, employeuse) => {
          const faits = await precedent
          const resultat = await creer(employeuse)
          if (resultat.statut !== 'creee') {
            output.log(
              `  ${resultat.statut} ${employeuse.nom} — ${resultat.detail}`,
            )
          }
          return [...faits, resultat]
        },
        Promise.resolve([]),
      )

  const csvLines = resultats.map(({ employeuse, statut, detail }) =>
    [statut, employeuse.nom, employeuse.siret ?? '', employeuse.commune, detail]
      .map(escapeCsvField)
      .join(';'),
  )

  const filePath = getAuditOutputPath(
    `couvrir-employeuses-restantes-${dryRun ? 'dry-run' : 'applied'}.csv`,
  )
  await writeFile(filePath, [csvHeader, ...csvLines].join('\n'), 'utf-8')

  const compter = (statut: Resultat['statut']) =>
    resultats.filter((resultat) => resultat.statut === statut).length

  output.log(`\n=== CLÔTURE DE LA COUVERTURE ${dryRun ? '(DRY RUN)' : ''} ===`)
  output.log(`Sans équivalent : ${restantes.length}`)
  output.log(`${dryRun ? 'À créer' : 'Créées'} : ${compter('creee')}`)
  output.log(`Ignorées        : ${compter('ignoree')}`)
  output.log(`Échecs          : ${compter('echec')}`)
  output.log(`Export: ${filePath}`)
  output.log(`\ncouvrir-employeuses-restantes: terminé`)

  return {
    dryRun,
    restantes: restantes.length,
    creees: compter('creee'),
    ignorees: compter('ignoree'),
    echecs: compter('echec'),
    export: filePath,
  }
}
