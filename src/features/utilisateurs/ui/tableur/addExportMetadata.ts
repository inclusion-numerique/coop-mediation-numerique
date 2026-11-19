import type { Worksheet } from 'exceljs'
import { getUserRoleLabel } from '@/features/utilisateurs/ui/tableur/getUserRoleLabel'
import { addTitleRow } from '@/libraries/tableur/addTitleRow'

export type WorksheetUser = {
  readonly id: string
  readonly firstName: string | null
  readonly lastName: string | null
  readonly role: string
  readonly isConseillerNumerique: boolean
  readonly mediateur: { readonly id: string } | null
  readonly coordinateur: { readonly id: string } | null
}

export const addExportMetadata =
  (worksheet: Worksheet) =>
  ({
    date,
    user,
    total,
    fuseau = 'Europe/Paris',
  }: {
    user: WorksheetUser
    date: Date
    total?: number
    fuseau?: string
  }) => {
    addTitleRow(worksheet)('Informations export')

    return worksheet.addRows(
      [
        ['Nom', user.lastName ?? '-'],
        ['Prénom', user.firstName ?? '-'],
        ['Rôle', getUserRoleLabel(user)],
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
