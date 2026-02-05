import { findOrCreateStructure } from '@app/web/features/structures/findOrCreateStructure'
import { prismaClient } from '@app/web/prismaClient'

export type MissingStructure = {
  v1PermanenceId: string | null
  v1StructureId: string | null
  siret: string | null
  nom: string | null
  adresse: string | null
  codePostal: string | null
  commune: string | null
  codeInsee: string | null
  craCount: number
}

export type ManualMatch = {
  v1PermanenceId: string | null
  v1StructureId: string | null
  v2StructureId: string
}

export type ResolutionSummary = {
  resolutionType: string
  crasCount: number
  distinctPermanences: number
  distinctStructures: number
}

export type RepairResult = {
  summary: ResolutionSummary[]
  missingStructures: MissingStructure[]
  updatedCount: number
  dryRun: boolean
}

const buildResolutionCte = (manualMatches: ManualMatch[] = []): string => {
  // Build manual matches CTE if we have any
  const manualMatchesCte =
    manualMatches.length > 0
      ? `manual_matches(v1_permanence_id, v1_structure_id, v2_structure_id) AS (
    VALUES ${manualMatches
      .map(
        (m) =>
          `(${m.v1PermanenceId ? `'${m.v1PermanenceId}'` : 'NULL'}::text, ${m.v1StructureId ? `'${m.v1StructureId}'` : 'NULL'}::text, '${m.v2StructureId}'::uuid)`,
      )
      .join(',\n           ')}
),`
      : ''

  return `
WITH cras_rattachement AS (
    SELECT 
        id,
        v1_conseiller_numerique_id,
        permanence_id,
        permanence_siret,
        permanence_code_commune,
        permanence_nom_enseigne,
        permanence_adresse,
        permanence_code_postal,
        permanence_nom_commune,
        structure_id,
        structure_siret,
        structure_code_commune,
        structure_nom,
        structure_code_postal,
        structure_nom_commune,
        created_at
    FROM cras_conseiller_numerique_v1
    WHERE canal = 'rattachement'
),
${manualMatchesCte}
resolution AS (
    SELECT 
        c.*,
        ${manualMatches.length > 0 ? 'mm_perm.v2_structure_id AS v2_by_manual_permanence,' : ''}
        ${manualMatches.length > 0 ? 'mm_struct.v2_structure_id AS v2_by_manual_structure,' : ''}
        s_perm.id AS v2_by_permanence_id,
        s_perm_siret.id AS v2_by_permanence_siret,
        s_perm_name.id AS v2_by_permanence_name,
        s_perm_addr.id AS v2_by_permanence_adresse,
        s_struct.id AS v2_by_structure_id,
        s_struct_siret.id AS v2_by_structure_siret,
        s_struct_name.id AS v2_by_structure_name,
        CASE 
            ${
              manualMatches.length > 0
                ? `WHEN c.permanence_id IS NOT NULL AND mm_perm.v2_structure_id IS NOT NULL 
                THEN 'permanence_with_v2_manual'`
                : ''
            }
            WHEN c.permanence_id IS NOT NULL AND s_perm.id IS NOT NULL 
                THEN 'permanence_with_v2_structure'
            WHEN c.permanence_id IS NOT NULL AND s_perm_siret.id IS NOT NULL 
                THEN 'permanence_with_v2_by_siret'
            WHEN c.permanence_id IS NOT NULL AND s_perm_name.id IS NOT NULL 
                THEN 'permanence_with_v2_by_name'
            WHEN c.permanence_id IS NOT NULL AND s_perm_addr.id IS NOT NULL 
                THEN 'permanence_with_v2_by_adresse'
            WHEN c.permanence_id IS NOT NULL 
                THEN 'permanence_no_v2'
            ${
              manualMatches.length > 0
                ? `WHEN c.permanence_id IS NULL AND mm_struct.v2_structure_id IS NOT NULL 
                THEN 'no_permanence_with_v2_manual'`
                : ''
            }
            WHEN c.permanence_id IS NULL AND s_struct.id IS NOT NULL 
                THEN 'no_permanence_with_v2_structure'
            WHEN c.permanence_id IS NULL AND s_struct_siret.id IS NOT NULL 
                THEN 'no_permanence_with_v2_by_siret'
            WHEN c.permanence_id IS NULL AND s_struct_name.id IS NOT NULL 
                THEN 'no_permanence_with_v2_by_name'
            ELSE 'no_permanence_no_v2'
        END AS resolution_type,
        COALESCE(
            ${manualMatches.length > 0 ? 'CASE WHEN c.permanence_id IS NOT NULL THEN mm_perm.v2_structure_id END,' : ''}
            CASE WHEN c.permanence_id IS NOT NULL THEN s_perm.id END,
            CASE WHEN c.permanence_id IS NOT NULL THEN s_perm_siret.id END,
            CASE WHEN c.permanence_id IS NOT NULL THEN s_perm_name.id END,
            CASE WHEN c.permanence_id IS NOT NULL THEN s_perm_addr.id END,
            ${manualMatches.length > 0 ? 'mm_struct.v2_structure_id,' : ''}
            s_struct.id,
            s_struct_siret.id,
            s_struct_name.id
        ) AS resolved_structure_id
    FROM cras_rattachement c
    ${
      manualMatches.length > 0
        ? `-- Manual match for permanence
    LEFT JOIN manual_matches mm_perm 
        ON c.permanence_id IS NOT NULL 
        AND mm_perm.v1_permanence_id = c.permanence_id
    -- Manual match for structure
    LEFT JOIN manual_matches mm_struct 
        ON c.permanence_id IS NULL 
        AND mm_struct.v1_structure_id = c.structure_id`
        : ''
    }
    -- Match by v1_permanence_id
    LEFT JOIN structures s_perm 
        ON c.permanence_id IS NOT NULL 
        AND s_perm.v1_permanence_id = c.permanence_id
        AND s_perm.suppression IS NULL
    -- Match by permanence SIRET + code_insee (only if SIRET exists)
    LEFT JOIN structures s_perm_siret 
        ON c.permanence_id IS NOT NULL 
        AND s_perm.id IS NULL
        AND c.permanence_siret IS NOT NULL
        AND s_perm_siret.siret = c.permanence_siret
        AND s_perm_siret.code_insee = c.permanence_code_commune
        AND s_perm_siret.suppression IS NULL
    -- Match by permanence code_insee + nom (case insensitive)
    LEFT JOIN structures s_perm_name 
        ON c.permanence_id IS NOT NULL 
        AND s_perm.id IS NULL
        AND s_perm_siret.id IS NULL
        AND c.permanence_nom_enseigne IS NOT NULL
        AND LOWER(s_perm_name.nom) = LOWER(c.permanence_nom_enseigne)
        AND s_perm_name.code_insee = c.permanence_code_commune
        AND s_perm_name.suppression IS NULL
    -- Match by permanence code_insee + adresse (case insensitive, only if adresse not empty)
    LEFT JOIN structures s_perm_addr 
        ON c.permanence_id IS NOT NULL 
        AND s_perm.id IS NULL
        AND s_perm_siret.id IS NULL
        AND s_perm_name.id IS NULL
        AND c.permanence_adresse IS NOT NULL
        AND c.permanence_adresse != ''
        AND LOWER(s_perm_addr.adresse) = LOWER(c.permanence_adresse)
        AND s_perm_addr.code_insee = c.permanence_code_commune
        AND s_perm_addr.suppression IS NULL
    -- Match by v1_structure_id
    LEFT JOIN structures s_struct 
        ON c.permanence_id IS NULL 
        AND s_struct.v1_structure_id = c.structure_id
        AND s_struct.suppression IS NULL
    -- Match by structure SIRET + code_insee (only if SIRET exists)
    LEFT JOIN structures s_struct_siret 
        ON c.permanence_id IS NULL 
        AND s_struct.id IS NULL
        AND c.structure_siret IS NOT NULL
        AND s_struct_siret.siret = c.structure_siret
        AND s_struct_siret.code_insee = c.structure_code_commune
        AND s_struct_siret.suppression IS NULL
    -- Match by structure code_insee + nom (case insensitive)
    LEFT JOIN structures s_struct_name 
        ON c.permanence_id IS NULL 
        AND s_struct.id IS NULL
        AND s_struct_siret.id IS NULL
        AND c.structure_nom IS NOT NULL
        AND LOWER(s_struct_name.nom) = LOWER(c.structure_nom)
        AND s_struct_name.code_insee = c.structure_code_commune
        AND s_struct_name.suppression IS NULL
)
`
}

export const repairCraV1LieuxActivite = async ({
  dryRun = true,
  manualMatches = [],
  onProgress,
}: {
  dryRun?: boolean
  manualMatches?: ManualMatch[]
  onProgress?: (message: string) => void
} = {}): Promise<RepairResult> => {
  const log =
    onProgress ??
    (() => {
      // void logger
    })
  const resolutionCte = buildResolutionCte(manualMatches)

  log('Step 1/4: Building resolution CTE...')

  // Step 1: Get summary of resolution types
  const summary = await prismaClient.$queryRawUnsafe<
    {
      resolution_type: string
      cras_count: bigint
      distinct_permanences: bigint
      distinct_structures: bigint
    }[]
  >(`
    ${resolutionCte}
    SELECT 
        resolution_type,
        COUNT(*) AS cras_count,
        COUNT(DISTINCT permanence_id) FILTER (WHERE permanence_id IS NOT NULL) AS distinct_permanences,
        COUNT(DISTINCT structure_id) FILTER (WHERE permanence_id IS NULL) AS distinct_structures
    FROM resolution
    GROUP BY resolution_type
    ORDER BY 
        CASE resolution_type
            WHEN 'permanence_with_v2_manual' THEN 1
            WHEN 'permanence_with_v2_structure' THEN 2
            WHEN 'permanence_with_v2_by_siret' THEN 3
            WHEN 'permanence_with_v2_by_name' THEN 4
            WHEN 'permanence_with_v2_by_adresse' THEN 5
            WHEN 'permanence_no_v2' THEN 6
            WHEN 'no_permanence_with_v2_manual' THEN 7
            WHEN 'no_permanence_with_v2_structure' THEN 8
            WHEN 'no_permanence_with_v2_by_siret' THEN 9
            WHEN 'no_permanence_with_v2_by_name' THEN 10
            WHEN 'no_permanence_no_v2' THEN 11
        END
  `)

  const formattedSummary: ResolutionSummary[] = summary.map((row) => ({
    resolutionType: row.resolution_type,
    crasCount: Number(row.cras_count),
    distinctPermanences: Number(row.distinct_permanences),
    distinctStructures: Number(row.distinct_structures),
  }))

  const totalCras = formattedSummary.reduce(
    (acc, row) => acc + row.crasCount,
    0,
  )
  log(`Step 1/4: Done. Found ${totalCras} CRAs to process.`)

  log('Step 2/4: Checking for missing structures...')

  // Step 2: Check for missing structures (permanence_no_v2 and no_permanence_no_v2)
  const missingStructures = await prismaClient.$queryRawUnsafe<
    {
      v1_permanence_id: string | null
      v1_structure_id: string | null
      siret: string | null
      nom: string | null
      adresse: string | null
      code_postal: string | null
      commune: string | null
      code_insee: string | null
      cra_count: bigint
    }[]
  >(`
    ${resolutionCte}
    SELECT 
        permanence_id AS v1_permanence_id,
        NULL::text AS v1_structure_id,
        permanence_siret AS siret,
        permanence_nom_enseigne AS nom,
        permanence_adresse AS adresse,
        permanence_code_postal AS code_postal,
        permanence_nom_commune AS commune,
        permanence_code_commune AS code_insee,
        COUNT(*) AS cra_count
    FROM resolution
    WHERE resolution_type = 'permanence_no_v2'
    GROUP BY 
        permanence_id,
        permanence_siret,
        permanence_nom_enseigne,
        permanence_adresse,
        permanence_code_postal,
        permanence_nom_commune,
        permanence_code_commune
    UNION ALL
    SELECT 
        NULL::text AS v1_permanence_id,
        structure_id AS v1_structure_id,
        structure_siret AS siret,
        structure_nom AS nom,
        NULL::text AS adresse,
        structure_code_postal AS code_postal,
        structure_nom_commune AS commune,
        structure_code_commune AS code_insee,
        COUNT(*) AS cra_count
    FROM resolution
    WHERE resolution_type = 'no_permanence_no_v2'
    GROUP BY 
        structure_id,
        structure_siret,
        structure_nom,
        structure_code_postal,
        structure_nom_commune,
        structure_code_commune
    ORDER BY cra_count DESC
  `)

  const formattedMissingStructures: MissingStructure[] = missingStructures.map(
    (row) => ({
      v1PermanenceId: row.v1_permanence_id,
      v1StructureId: row.v1_structure_id,
      siret: row.siret,
      nom: row.nom,
      adresse: row.adresse,
      codePostal: row.code_postal,
      commune: row.commune,
      codeInsee: row.code_insee,
      craCount: Number(row.cra_count),
    }),
  )

  log(
    `Step 2/4: Done. Found ${formattedMissingStructures.length} missing structures.`,
  )

  // If there are missing structures, don't run the update
  if (formattedMissingStructures.length > 0) {
    log('Step 2/4: Aborting - missing structures must be resolved first.')
    return {
      summary: formattedSummary,
      missingStructures: formattedMissingStructures,
      updatedCount: 0,
      dryRun,
    }
  }

  // Step 3: Create staging table and run update if no missing structures and not dryRun
  let updatedCount = 0

  if (!dryRun) {
    log('Step 3/4: Creating staging table v1_repair_cra_lieux...')

    // Drop existing staging table if exists
    await prismaClient.$executeRawUnsafe(`
      DROP TABLE IF EXISTS v1_repair_cra_lieux
    `)

    // Create staging table with resolution results
    await prismaClient.$executeRawUnsafe(`
      ${resolutionCte}
      SELECT 
          id,
          permanence_id,
          structure_id,
          resolved_structure_id,
          resolution_type
      INTO v1_repair_cra_lieux
      FROM resolution
      WHERE resolved_structure_id IS NOT NULL
    `)

    log('Step 3/4: Staging table created. Creating indexes...')

    // Create indexes for fast lookups
    await prismaClient.$executeRawUnsafe(`
      CREATE INDEX idx_v1_repair_cra_lieux_id ON v1_repair_cra_lieux(id)
    `)
    await prismaClient.$executeRawUnsafe(`
      CREATE INDEX idx_v1_repair_cra_lieux_structure ON v1_repair_cra_lieux(resolved_structure_id)
    `)

    log('Step 3/4: Done. Indexes created.')

    log('Step 4/4: Running UPDATE on activites in batches...')

    // Get total count for progress tracking
    const countResult = await prismaClient.$queryRawUnsafe<
      [{ count: bigint }]
    >(`
      SELECT COUNT(*) as count FROM v1_repair_cra_lieux
    `)
    const totalToUpdate = Number(countResult[0].count)
    log(`Step 4/4: ${totalToUpdate} rows to update.`)

    // Batch update with progress tracking
    const BATCH_SIZE = 10000
    let processedCount = 0

    while (true) {
      // Update a batch and delete processed rows from staging
      const batchResult = await prismaClient.$executeRawUnsafe(`
        WITH batch AS (
          SELECT id, permanence_id, structure_id, resolved_structure_id
          FROM v1_repair_cra_lieux
          LIMIT ${BATCH_SIZE}
        ),
        updated AS (
          UPDATE activites a
          SET 
              type_lieu = 'lieu_activite',
              structure_id = batch.resolved_structure_id,
              v1_permanence_id = batch.permanence_id,
              v1_structure_id = batch.structure_id,
              modification = NOW()
          FROM batch
          WHERE a.v1_cra_id = batch.id
          RETURNING a.id
        )
        DELETE FROM v1_repair_cra_lieux
        WHERE id IN (SELECT id FROM batch)
      `)

      if (batchResult === 0) {
        break
      }

      processedCount += batchResult
      updatedCount += batchResult
      const percent = Math.round((processedCount / totalToUpdate) * 100)
      log(`Step 4/4: Progress ${processedCount}/${totalToUpdate} (${percent}%)`)
    }

    log(`Step 4/4: Done. Updated ${updatedCount} activites.`)
  } else {
    log('Step 3/4: Skipped (dry-run mode).')
    log('Step 4/4: Skipped (dry-run mode).')
  }

  return {
    summary: formattedSummary,
    missingStructures: formattedMissingStructures,
    updatedCount,
    dryRun,
  }
}

/**
 * Create a structure from a MissingStructure using findOrCreateStructure
 */
export const createStructureFromMissingStructure = async (
  missingStructure: MissingStructure,
): Promise<{ id: string }> => {
  return findOrCreateStructure({
    siret: missingStructure.siret,
    nom: missingStructure.nom || 'Structure sans nom',
    adresse: missingStructure.adresse || '',
    codePostal: missingStructure.codePostal || '',
    codeInsee: missingStructure.codeInsee || '',
    commune: missingStructure.commune || '',
    v1PermanenceId: missingStructure.v1PermanenceId,
    v1StructureId: missingStructure.v1StructureId,
  })
}

export type CreateStructuresResult = {
  created: number
  errors: Array<{ structure: MissingStructure; error: string }>
}

/**
 * Create all structures required for the repair from the missing structures list
 */
export const createStructuresRequiredForRepair = async (
  missingStructures: MissingStructure[],
  onProgress?: (
    current: number,
    total: number,
    structure: MissingStructure,
  ) => void,
): Promise<CreateStructuresResult> => {
  let created = 0
  const errors: Array<{ structure: MissingStructure; error: string }> = []

  for (let i = 0; i < missingStructures.length; i++) {
    const structure = missingStructures[i]

    if (onProgress) {
      onProgress(i + 1, missingStructures.length, structure)
    }

    try {
      await createStructureFromMissingStructure(structure)
      created++
    } catch (error) {
      errors.push({
        structure,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  return { created, errors }
}
