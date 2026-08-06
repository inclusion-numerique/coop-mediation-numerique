import { writeFile } from 'node:fs/promises'
import { getAuditOutputPath } from '@app/web/jobs/audit-output'
import { prismaClient } from '@app/web/prismaClient'
import type { JobExecutor } from '../jobExecutors'
import { output } from '../output'

// Réconciliation du pivot `coop.users` <-> `main.personne` (ADR-002 périmètre élargi) : c'est le
// `coop_id` sur `main.personne` qui donne accès, côté coop, aux affectations (structures employeuses)
// et contrats de `main`. La coop fait AUTORITÉ sur `coop_id` à partir de cette PR (les synchros
// Entrepôt disparaissent) : on peut donc non seulement lier les manquants, mais aussi re-pointer un
// lien mal posé — sans jamais casser un compte vivant.
//
// Deux sources de match, la plus forte prioritaire : (1) email EXACT (lower+trim) sur les 3 chemins
// réels du `contact` jsonb (`coop.email`, `idposte.mail_perso`, `idposte.mail_pro`) ; (2) nom+prénom
// identiques + SIRET de l'employeuse coop (via l'affectation idposte de la SA), pour rattraper les 2e
// comptes à email divergent. Le match nom+SIRET (plus faible) n'autorise PAS le vol par récence.
// Tie-break : email > nom+SIRET, puis personne portant une affectation `idposte` active + structure.
//
// Table de décision par user U non lié :
//   - LINK        : la personne candidate est LIBRE (`coop_id` NULL)                 -> on lie.
//   - RE-POINT    : la personne est liée à un jumeau U' MORT et U est VIVANT         -> on déplace le lien.
//   - RE-POINT-RECENCE : jumeau U' VIVANT mais U s'est connecté PLUS RÉCEMMENT       -> on déplace vers U.
//   - CONFLIT-MANUEL : jumeau U' VIVANT et au moins aussi récent que U               -> on ne touche à rien.
//   - INACTIF     : U lui-même est mort (jamais connecté) et n'a que des liens tiers -> on ne touche à rien.
//   - SANS-MATCH  : aucune personne par email                                        -> hors périmètre (create séparé).
//
// « VIVANT » = `last_login IS NOT NULL` ET non supprimé ET pas un compte legacy `conseiller-v1`.
// « MORT »   = la négation. Garde de sûreté absolue : un jumeau VIVANT n'est JAMAIS dépossédé (auto).
//
// Écrit dans une base partagée -> dry-run par défaut ; chaque run produit un CSV (une ligne par user
// ciblé, avec les deux `last_login`) pour relire chaque re-pointage avant application.

// Compte legacy auto-généré lors de l'import V1 (jamais un vrai login humain). Vérifié en base :
// 1900 comptes, tous sur ce domaine, aucun autre pattern (v0/v2).
const LEGACY_V1_LIKE = 'conseiller-v1-%@coop-numerique.anct.gouv.fr'

type Outcome =
  | 'lie'
  | 're-point'
  | 're-point-recence'
  | 'conflit-manuel'
  | 'conflit-personne-disputee'
  | 'inactif'
  | 'sans-match'

// Outcomes qui écrivent un `coop_id`. `re-point`* déplacent depuis le jumeau (garde sur `jumeau_id`) ;
// `lie` pose sur une personne encore libre (garde sur `coopId IS NULL`).
const ecritDepuisJumeau = (outcome: Outcome): boolean =>
  outcome === 're-point' || outcome === 're-point-recence'

const estEcriture = (outcome: Outcome): boolean =>
  outcome === 'lie' || ecritDepuisJumeau(outcome)

type AnalyseRow = {
  user_id: string
  email: string
  is_conseiller_numerique: boolean
  outcome: Outcome
  match_type: 'email' | 'nom-siret' | null
  personne_id: number | null
  jumeau_id: string | null
  jumeau_email: string | null
  u_last_login: Date | null
  jumeau_last_login: Date | null
}

// Pour chaque `coop.users` actif non lié, choisit la meilleure action (LINK > RE-POINT > CONFLIT >
// INACTIF, puis affectation idposte, puis plus petit id de personne). `attribution` garantit qu'une
// même personne n'est écrite que par un seul user (déterministe : plus petit `user_id`), les autres
// candidats à l'écriture retombant en `conflit-personne-disputee`.
const analyser = (): Promise<AnalyseRow[]> =>
  prismaClient.$queryRaw<AnalyseRow[]>`
    WITH cible AS (
      SELECT
        u.id AS user_id,
        lower(trim(u.email)) AS email,
        u.email AS email_raw,
        lower(trim(u.first_name)) AS prenom,
        lower(trim(u.last_name)) AS nom,
        u.last_login AS u_last_login,
        (u.last_login IS NOT NULL) AS u_vivant,
        u.is_conseiller_numerique
      FROM coop.users u
      WHERE u.deleted IS NULL
        AND NOT EXISTS (SELECT 1 FROM main.personne p WHERE p.coop_id = u.id)
    ),
    correspondance AS (
      -- Match FORT par email exact (3 chemins réels du contact jsonb).
      SELECT c.user_id, p.id AS personne_id, 'email'::text AS match_type
      FROM cible c
      JOIN main.personne p
        ON lower(p.contact->'coop'->>'email') = c.email
        OR lower(p.contact->'idposte'->>'mail_perso') = c.email
        OR lower(p.contact->'idposte'->>'mail_pro') = c.email
      UNION
      -- Match plus FAIBLE par nom+prénom identiques ET SIRET de l'employeuse coop (via l'affectation
      -- idposte de la SA correspondante). Rattrape les 2e comptes à email divergent.
      SELECT c.user_id, p.id, 'nom-siret'
      FROM cible c
      JOIN coop.employes_structures es
        ON es.user_id = c.user_id AND es.suppression IS NULL
      JOIN main.structure_administrative sc
        ON sc.structure_coop_id = es.structure_id
      JOIN main.personne_affectations_emploi af
        ON af.structure_administrative_id = sc.id AND af.source = 'idposte' AND af.est_active
      JOIN main.personne p
        ON p.id = af.personne_id
        AND lower(trim(p.nom)) = c.nom
        AND lower(trim(p.prenom)) = c.prenom
      WHERE c.nom <> '' AND c.prenom <> ''
    ),
    candidat AS (
      SELECT
        c.user_id, c.email_raw, c.u_last_login, c.u_vivant, c.is_conseiller_numerique,
        co.personne_id, co.match_type,
        p.coop_id AS jumeau_id,
        tw.email AS jumeau_email,
        tw.last_login AS jumeau_last_login,
        EXISTS (
          SELECT 1 FROM main.personne_affectations_emploi a
          WHERE a.personne_id = p.id AND a.est_active
            AND a.source = 'idposte' AND a.structure_administrative_id IS NOT NULL
        ) AS aff_idposte,
        CASE
          WHEN p.coop_id IS NULL THEN NULL
          ELSE (
            tw.last_login IS NOT NULL
            AND tw.deleted IS NULL
            AND tw.email NOT ILIKE ${LEGACY_V1_LIKE}
          )
        END AS jumeau_vivant
      FROM correspondance co
      JOIN cible c ON c.user_id = co.user_id
      JOIN main.personne p ON p.id = co.personne_id
      LEFT JOIN coop.users tw ON tw.id = p.coop_id
    ),
    score AS (
      SELECT *,
        CASE
          WHEN jumeau_id IS NULL THEN 'lie'
          WHEN jumeau_vivant IS FALSE AND u_vivant THEN 're-point'
          -- both-alive : l'orphelin est le compte réellement utilisé (last_login strictement plus
          -- récent que le jumeau) -> on re-pointe vers lui. Sinon le jumeau reste (conflit-manuel).
          -- Récence réservée au match EMAIL (fort) : sur nom+SIRET (plus faible), on ne vole JAMAIS
          -- un compte vivant -> conflit-manuel pour revue humaine.
          WHEN jumeau_vivant IS TRUE AND u_vivant
               AND u_last_login > jumeau_last_login
               AND match_type = 'email' THEN 're-point-recence'
          WHEN jumeau_vivant IS TRUE THEN 'conflit-manuel'
          ELSE 'inactif'
        END AS action
      FROM candidat
    ),
    meilleur AS (
      SELECT DISTINCT ON (user_id)
        user_id, email_raw, is_conseiller_numerique, personne_id, jumeau_id,
        jumeau_email, u_last_login, jumeau_last_login, match_type, action
      FROM score
      ORDER BY user_id,
        CASE action
          WHEN 'lie' THEN 0 WHEN 're-point' THEN 1 WHEN 're-point-recence' THEN 2
          WHEN 'conflit-manuel' THEN 3 ELSE 4
        END,
        (match_type = 'email') DESC,
        aff_idposte DESC, personne_id ASC
    ),
    attribution AS (
      SELECT DISTINCT ON (personne_id) user_id, personne_id
      FROM meilleur
      WHERE action IN ('lie', 're-point', 're-point-recence')
      ORDER BY personne_id, user_id
    )
    SELECT
      c.user_id,
      c.email_raw AS email,
      c.is_conseiller_numerique,
      COALESCE(
        CASE
          WHEN m.action IN ('lie', 're-point', 're-point-recence')
               AND a.user_id IS NULL
            THEN 'conflit-personne-disputee'
          ELSE m.action
        END,
        'sans-match'
      ) AS outcome,
      m.match_type,
      m.personne_id,
      m.jumeau_id,
      m.jumeau_email,
      c.u_last_login,
      m.jumeau_last_login
    FROM cible c
    LEFT JOIN meilleur m ON m.user_id = c.user_id
    LEFT JOIN attribution a
      ON a.user_id = c.user_id AND a.personne_id = m.personne_id
    ORDER BY outcome, c.user_id`

const escapeCsvField = (value: string): string =>
  /[";\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value

const isoOrEmpty = (date: Date | null): string =>
  date === null ? '' : date.toISOString()

const csvHeader = [
  'user_id',
  'email',
  'is_conseiller_numerique',
  'outcome',
  'match_type',
  'personne_id',
  'jumeau_id',
  'jumeau_email',
  'u_last_login',
  'jumeau_last_login',
  'applied',
].join(';')

const rowToCsv = (row: AnalyseRow, applied: string): string =>
  [
    row.user_id,
    escapeCsvField(row.email),
    String(row.is_conseiller_numerique),
    row.outcome,
    row.match_type ?? '',
    row.personne_id === null ? '' : String(row.personne_id),
    row.jumeau_id ?? '',
    escapeCsvField(row.jumeau_email ?? ''),
    isoOrEmpty(row.u_last_login),
    isoOrEmpty(row.jumeau_last_login),
    applied,
  ].join(';')

// Applique un lien : `lie` n'écrit que si la personne est TOUJOURS libre ; `re-point` n'écrit que si
// elle pointe TOUJOURS vers le jumeau attendu (garde contre une course entre l'analyse et l'écriture).
// 0 ligne affectée = état changé entre-temps -> on ne force pas, on trace « course ».
const appliquer = async (
  row: AnalyseRow & { personne_id: number },
): Promise<'oui' | 'course'> => {
  const { count } = await prismaClient.personneMain.updateMany({
    where: {
      id: row.personne_id,
      coopId: ecritDepuisJumeau(row.outcome) ? row.jumeau_id : null,
    },
    data: { coopId: row.user_id },
  })
  return count === 1 ? 'oui' : 'course'
}

export const executeRelierPersonnesCoopMain: JobExecutor<
  'relier-personnes-coop-main'
> = async (job) => {
  const dryRun = job.payload?.dryRun ?? true

  const rows = await analyser()

  const appliedByUser = new Map<string, 'oui' | 'course'>()
  if (!dryRun) {
    const aEcrire = rows.filter(
      (row): row is AnalyseRow & { personne_id: number } =>
        estEcriture(row.outcome) && row.personne_id !== null,
    )
    await aEcrire.reduce<Promise<void>>(async (previous, row) => {
      await previous
      appliedByUser.set(row.user_id, await appliquer(row))
    }, Promise.resolve())
  }

  const filePath = getAuditOutputPath(
    `relier-personnes-coop-main-${dryRun ? 'dry-run' : 'apply'}.csv`,
  )
  await writeFile(
    filePath,
    [
      csvHeader,
      ...rows.map((row) => rowToCsv(row, appliedByUser.get(row.user_id) ?? '')),
    ].join('\n'),
    'utf-8',
  )

  const count = (predicate: (row: AnalyseRow) => boolean) =>
    rows.filter(predicate).length

  const results = {
    dryRun,
    csv: filePath,
    ciblesNonLiees: rows.length,
    aLier: count((r) => r.outcome === 'lie'),
    aRepointer: count((r) => r.outcome === 're-point'),
    aRepointerCn: count(
      (r) => r.outcome === 're-point' && r.is_conseiller_numerique,
    ),
    aRepointerRecence: count((r) => r.outcome === 're-point-recence'),
    aRepointerRecenceCn: count(
      (r) => r.outcome === 're-point-recence' && r.is_conseiller_numerique,
    ),
    conflitsManuel: count((r) => r.outcome === 'conflit-manuel'),
    conflitsDisputee: count((r) => r.outcome === 'conflit-personne-disputee'),
    inactifs: count((r) => r.outcome === 'inactif'),
    sansMatch: count((r) => r.outcome === 'sans-match'),
    // Matches issus du signal plus faible nom+SIRET (à relire au CSV en priorité).
    viaNomSiret: count((r) => r.match_type === 'nom-siret'),
    ecrituresAppliquees: [...appliedByUser.values()].filter((v) => v === 'oui')
      .length,
    ecrituresCourse: [...appliedByUser.values()].filter((v) => v === 'course')
      .length,
  }

  output.log(
    `relier-personnes-coop-main: ${dryRun ? 'DRY RUN — ' : ''}${
      results.ciblesNonLiees
    } users non liés ; à lier ${results.aLier} ; à re-pointer ${
      results.aRepointer
    } (dont CN ${results.aRepointerCn}) ; re-point récence ${
      results.aRepointerRecence
    } (dont CN ${results.aRepointerRecenceCn}) ; conflit-manuel ${
      results.conflitsManuel
    } ; disputée ${results.conflitsDisputee} ; inactifs ${
      results.inactifs
    } ; sans-match ${results.sansMatch} ; via nom+SIRET ${
      results.viaNomSiret
    }` +
      (dryRun
        ? ''
        : ` ; écrits ${results.ecrituresAppliquees} (course ${results.ecrituresCourse})`) +
      ` ; CSV ${filePath}`,
  )

  return results
}
