import { writeFile } from 'node:fs/promises'
import type {
  NormaliserBeneficiaireChange,
  NormaliserBeneficiaireError,
} from '@app/web/features/beneficiaire/abilities/normaliser-beneficiaires/domain'
import { normaliserBeneficiaires } from '@app/web/features/beneficiaire/abilities/normaliser-beneficiaires/implementation'
import { escapeCsvField } from '@app/web/jobs/audit-csv'
import { getAuditOutputPath } from '@app/web/jobs/audit-output'
import { output } from '@app/web/jobs/output'
import type { NormaliserBeneficiairesJob } from './normaliserBeneficiairesJob'

const csvHeader = [
  'id',
  'telephone_avant',
  'telephone_apres',
  'email_avant',
  'email_apres',
  'commune_avant',
  'commune_apres',
  'adresse_avant',
  'adresse_apres',
  'champs_modifies',
].join(';')

const changeToCsv = (change: NormaliserBeneficiaireChange): string =>
  [
    change.id,
    escapeCsvField(change.telephoneAvant ?? ''),
    escapeCsvField(change.telephoneApres ?? ''),
    escapeCsvField(change.emailAvant ?? ''),
    escapeCsvField(change.emailApres ?? ''),
    escapeCsvField(change.communeAvant ?? ''),
    escapeCsvField(change.communeApres ?? ''),
    escapeCsvField(change.adresseAvant ?? ''),
    escapeCsvField(change.adresseApres ?? ''),
    escapeCsvField(change.champsModifies.join(',')),
  ].join(';')

// CSV des fiches sautées : le champ fautif et sa valeur, pour triage manuel.
const errorCsvHeader = ['id', 'champ', 'valeur'].join(';')

const errorToCsv = (error: NormaliserBeneficiaireError): string =>
  [error.id, error.champ, escapeCsvField(error.valeur ?? '')].join(';')

// Déclencheur mince : l'opération vit dans l'ability de la feature ; ici on
// résout le dry-run (défaut) et on exporte le détail des changements en CSV.
export const executeNormaliserBeneficiaires = async (
  job: NormaliserBeneficiairesJob,
) => {
  const dryRun = job.payload?.dryRun ?? true

  output.log(
    `normaliser-beneficiaires: starting${dryRun ? ' (DRY RUN)' : ''}...`,
  )

  const result = await normaliserBeneficiaires({ dryRun })

  const suffix = dryRun ? 'dry-run' : 'applied'
  // Horodaté : chaque exécution garde ses propres exports (pas d'écrasement).
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')

  const changesLines = [csvHeader, ...result.changes.map(changeToCsv)]
  const changesPath = getAuditOutputPath(
    `normaliser-beneficiaires-${suffix}-${stamp}.csv`,
  )
  await writeFile(changesPath, changesLines.join('\n'), 'utf-8')

  const errorsLines = [errorCsvHeader, ...result.errors.map(errorToCsv)]
  const errorsPath = getAuditOutputPath(
    `normaliser-beneficiaires-errors-${stamp}.csv`,
  )
  await writeFile(errorsPath, errorsLines.join('\n'), 'utf-8')

  output.log(
    `normaliser-beneficiaires${dryRun ? ' (DRY RUN)' : ''}: ${
      dryRun ? 'à mettre à jour' : 'mises à jour'
    } ${result.updated}, sautées ${result.skipped} invalides`,
  )
  output.log(`Export changements: ${changesPath}`)
  output.log(`Export erreurs: ${errorsPath}`)

  return {
    dryRun,
    updated: result.updated,
    skipped: result.skipped,
    errors: result.errors,
    export: changesPath,
    errorsExport: errorsPath,
  }
}
