import { writeFile } from 'node:fs/promises'
import {
  deactivateCoopAffectationsExcept,
  ensureAffectationEmploiMain,
  ensurePersonneMain,
} from '@app/web/features/employeuse/server'
import { getAuditOutputPath } from '@app/web/jobs/audit-output'
import { prismaClient } from '@app/web/prismaClient'
import type { JobExecutor } from '../jobExecutors'
import { output } from '../output'

// Backfill des `main.personne` + affectations `source=coop` pour les employeuses NON-CN existantes
// (ADR-002 périmètre élargi). Rejoue, sur les emplois coop déjà en base, exactement ce que le chemin
// d'écriture fait à l'inscription (`ensurePersonneMain` + `ensureAffectationEmploiMain`) : aucune
// divergence entre le backfill et le live.
//
// Périmètre NON-CN uniquement : l'employeuse d'un CN vient de l'affectation `idposte` (Entrepôt) ;
// créer une affectation `source=coop` y ferait doublon. La SA main est résolue via `structure_coop_id`
// (indépendant du backfill `structure_main_id`).
//
// est_active = un emploi actif (`fin` nulle ou future) ; agrégé par structure (bool_or) pour gérer les
// ré-embauches. Multi-employeuses actives -> plusieurs affectations actives (cas réel respecté).
// `deactivateCoopAffectationsExcept` retire l'`est_active` des affectations `coop` hors employeuses
// courantes. Écrit dans une base partagée -> dry-run par défaut ; transaction par user ; idempotent.

type CibleRow = {
  user_id: string
  email: string
  structure_main_id: number
  est_active: boolean
  personne_existante: boolean
}

type CibleUser = {
  userId: string
  email: string
  personneExistante: boolean
  structures: { structureMainId: number; estActive: boolean }[]
}

// Une ligne par (user non-CN, structure main de ses emplois actifs), avec est_active agrégé.
const chargerCibles = (): Promise<CibleRow[]> =>
  prismaClient.$queryRaw<CibleRow[]>`
    SELECT
      u.id AS user_id,
      u.email,
      m.id AS structure_main_id,
      bool_or(es.fin_emploi IS NULL OR es.fin_emploi > now()) AS est_active,
      EXISTS (SELECT 1 FROM main.personne p WHERE p.coop_id = u.id) AS personne_existante
    FROM coop.users u
    JOIN coop.employes_structures es
      ON es.user_id = u.id AND es.suppression IS NULL
    JOIN main.structure_administrative m
      ON m.structure_coop_id = es.structure_id
    WHERE u.deleted IS NULL AND u.is_conseiller_numerique = false
    GROUP BY u.id, u.email, m.id
    ORDER BY u.id`

const grouperParUser = (rows: CibleRow[]): CibleUser[] => [
  ...rows
    .reduce<Map<string, CibleUser>>((acc, row) => {
      const existing = acc.get(row.user_id)
      const structure = {
        structureMainId: row.structure_main_id,
        estActive: row.est_active,
      }
      return acc.set(row.user_id, {
        userId: row.user_id,
        email: row.email,
        personneExistante: row.personne_existante,
        structures: existing
          ? [...existing.structures, structure]
          : [structure],
      })
    }, new Map())
    .values(),
]

// Rejoue le dual-write pour un user, atomiquement : personne (find-or-create par email) + une
// affectation coop par structure (est_active agrégé) + désactivation des affectations coop périmées.
const traiter = (user: CibleUser): Promise<void> =>
  prismaClient.$transaction(async (transaction) => {
    const personne = await ensurePersonneMain(
      { coopUserId: user.userId, email: user.email },
      transaction,
    )

    await user.structures.reduce<Promise<void>>(async (previous, structure) => {
      await previous
      await ensureAffectationEmploiMain(
        {
          personneId: personne.id,
          structureAdministrativeId: structure.structureMainId,
          estActive: structure.estActive,
        },
        transaction,
      )
    }, Promise.resolve())

    await deactivateCoopAffectationsExcept(
      {
        personneId: personne.id,
        keepStructureAdministrativeIds: user.structures
          .filter((structure) => structure.estActive)
          .map((structure) => structure.structureMainId),
      },
      transaction,
    )
  })

const escapeCsvField = (value: string): string =>
  /[";\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value

const csvHeader = [
  'user_id',
  'email',
  'personne_existante',
  'nb_structures',
  'nb_actives',
  'statut',
].join(';')

const rowToCsv = (user: CibleUser, statut: string): string =>
  [
    user.userId,
    escapeCsvField(user.email),
    String(user.personneExistante),
    String(user.structures.length),
    String(user.structures.filter((s) => s.estActive).length),
    statut,
  ].join(';')

export const executeBackfillPersonnesAffectationsMain: JobExecutor<
  'backfill-personnes-affectations-main'
> = async (job) => {
  const dryRun = job.payload?.dryRun ?? true

  const users = grouperParUser(await chargerCibles())

  // Apply : une transaction par user, best-effort (une erreur isolée ne casse pas tout le backfill).
  const statutByUser = new Map<string, 'ok' | 'erreur'>()
  if (!dryRun) {
    await users.reduce<Promise<void>>(async (previous, user) => {
      await previous
      await traiter(user)
        .then(() => statutByUser.set(user.userId, 'ok'))
        .catch((error) => {
          statutByUser.set(user.userId, 'erreur')
          output.error(
            `backfill-personnes-affectations-main: échec user ${user.userId}`,
            error,
          )
        })
    }, Promise.resolve())
  }

  const filePath = getAuditOutputPath(
    `backfill-personnes-affectations-main-${dryRun ? 'dry-run' : 'apply'}.csv`,
  )
  await writeFile(
    filePath,
    [
      csvHeader,
      ...users.map((user) =>
        rowToCsv(user, statutByUser.get(user.userId) ?? ''),
      ),
    ].join('\n'),
    'utf-8',
  )

  const affectations = users.flatMap((user) => user.structures)

  const results = {
    dryRun,
    csv: filePath,
    usersCibles: users.length,
    usersSansPersonne: users.filter((user) => !user.personneExistante).length,
    affectationsAGarantir: affectations.length,
    affectationsActives: affectations.filter((s) => s.estActive).length,
    usersTraites: [...statutByUser.values()].filter((s) => s === 'ok').length,
    usersEnErreur: [...statutByUser.values()].filter((s) => s === 'erreur')
      .length,
  }

  output.log(
    `backfill-personnes-affectations-main: ${dryRun ? 'DRY RUN — ' : ''}${
      results.usersCibles
    } users non-CN ; personnes à créer/garantir ${
      results.usersSansPersonne
    } sans lien ; affectations à garantir ${results.affectationsAGarantir} (${
      results.affectationsActives
    } actives)` +
      (dryRun
        ? ''
        : ` ; traités ${results.usersTraites} ; erreurs ${results.usersEnErreur}`) +
      ` ; CSV ${filePath}`,
  )

  return results
}
