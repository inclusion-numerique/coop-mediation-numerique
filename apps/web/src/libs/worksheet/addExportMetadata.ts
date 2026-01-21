import type { SessionUser } from '@app/web/auth/sessionUser'
import { getUserRoleLabel } from '@app/web/utils/getUserRoleLabel'
import type { Worksheet } from 'exceljs'
import { addTitleRow } from './addTitleRow'

export type WorksheetUser = Pick<
  SessionUser,
  | 'firstName'
  | 'lastName'
  | 'role'
  | 'id'
  | 'coordinateur'
  | 'emplois'
  | 'isConseillerNumerique'
> & {
  mediateur: { id: string } | null
}

export const addExportMetadata =
  (worksheet: Worksheet) =>
  ({
    date,
    user,
    total,
  }: {
    user: WorksheetUser
    date: Date
    total?: number
  }) => {
    addTitleRow(worksheet)('Informations export')

    return worksheet.addRows(
      [
        ['Nom', user.lastName ?? '-'],
        ['Prénom', user.firstName ?? '-'],
        ['Rôle', getUserRoleLabel(user)],
        total != null ? ['Total', total] : undefined,
        ["Date d'export", date.toLocaleDateString('fr-FR')],
        [
          "Heure d'export",
          date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        ],
        [],
      ].filter(Boolean),
    )
  }
