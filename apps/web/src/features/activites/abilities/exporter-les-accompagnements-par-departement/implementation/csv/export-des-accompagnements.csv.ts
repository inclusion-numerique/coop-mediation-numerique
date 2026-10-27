import { stringify } from 'csv-stringify/sync'
import type { Jour, LigneDExport } from '../../domain'

const enTete = [
  'Département',
  'Code',
  'Accompagnements conum',
  'Accompagnements médiateur',
]

export const exportDesAccompagnementsCsv = (
  lignes: readonly LigneDExport[],
): string =>
  stringify([
    enTete,
    ...lignes.map(
      ({ departement, conseillersNumeriques, autresMediateurs }) => [
        departement.code,
        departement.nom,
        conseillersNumeriques,
        autresMediateurs,
      ],
    ),
  ])

export const nomDuFichierDExport = (jusquAu: Jour | null): string =>
  jusquAu === null ? 'accompagnements' : `accompagnements_${jusquAu}`
