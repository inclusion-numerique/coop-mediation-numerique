import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import { stringify } from 'csv-stringify/sync'
import type { AccompagnementsDuDepartement } from '../prisma/accompagnements-par-departement.query'

const enTete = [
  'Département',
  'Code',
  'Accompagnements conum',
  'Accompagnements médiateur',
]

export const exportDesAccompagnementsCsv = ({
  conseillersNumeriques,
  mediateurs,
}: {
  readonly conseillersNumeriques: readonly AccompagnementsDuDepartement[]
  readonly mediateurs: readonly AccompagnementsDuDepartement[]
}): string =>
  stringify([
    enTete,
    ...conseillersNumeriques.map(({ departement, accompagnements }) => [
      departement.code,
      departement.nom,
      accompagnements,
      mediateurs.find(
        (mediateur) => mediateur.departement.code === departement.code,
      )?.accompagnements ?? 0,
    ]),
  ])

export const nomDuFichierDExport = (jusquAu: Date | undefined): string =>
  jusquAu ? `accompagnements_${dateAsIsoDay(jusquAu)}` : 'accompagnements'
