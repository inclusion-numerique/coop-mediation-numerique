import type { Worksheet } from 'exceljs'
import { addTitleRow } from './add-title-row'

export type AuteurDExport = {
  readonly nom: string | null
  readonly prenom: string | null
  readonly role: string
}

export const addExportMetadata =
  (worksheet: Worksheet) =>
  ({
    date,
    auteur,
    total,
    fuseau = 'Europe/Paris',
  }: {
    auteur: AuteurDExport
    date: Date
    total?: number
    fuseau?: string
  }) => {
    addTitleRow(worksheet)('Informations export')

    return worksheet.addRows(
      [
        ['Nom', auteur.nom ?? '-'],
        ['Prénom', auteur.prenom ?? '-'],
        ['Rôle', auteur.role],
        total != null ? ['Total', total] : undefined,
        [
          "Date d'export",
          date.toLocaleDateString('fr-FR', { timeZone: fuseau }),
        ],
        [
          "Heure d'export",
          date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: fuseau,
          }),
        ],
        [],
      ].filter(Boolean),
    )
  }
