import { getSessionTokenFromNextRequestCookies } from '@app/web/auth/getSessionTokenFromCookies'
import { getSessionUserFromSessionToken } from '@app/web/auth/getSessionUserFromSessionToken'
import { buildAccompagnementsWorksheet } from '@app/web/features/activites/use-cases/list/export/buildAccompagnementsWorksheet'
import { getAccompagenmentsWorksheetInput } from '@app/web/features/activites/use-cases/list/export/getAccompagenmentsWorksheetInput'
import {
  ActivitesFilters,
  ActivitesFilterValidations,
} from '@app/web/features/activites/use-cases/list/validation/ActivitesFilters'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { getHasCrasV1 } from '../../mes-statistiques/_queries/getHasCrasV1'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 300

// Debug logging for production performance analysis
const debugExport = true

export type ExportDebugLogger = (message: string, data?: unknown) => void

const createExportDebugLogger = (enabled: boolean): ExportDebugLogger => {
  if (!enabled) {
    return () => {
      // Intentional no-op when debug is disabled
    }
  }
  const start = performance.now()
  let lastMark = start
  return (message: string, data?: unknown) => {
    const now = performance.now()
    const total = (now - start).toFixed(0)
    const delta = (now - lastMark).toFixed(0)
    lastMark = now
    // biome-ignore lint/suspicious/noConsole: Intentional debug logging for production performance analysis
    console.log(
      `[export activites] +${delta}ms (total: ${total}ms) ${message}`,
      data ?? '',
    )
  }
}

const toMediateurId = ({ mediateurId }: { mediateurId: string }) => mediateurId

const ExportActivitesValidation = z
  .object({
    // If you want to filter by a specific mediateur, you can add it here
    // By default this will export for current user if he is a mediateur
    mediateur: z.string().uuid().optional(),
  })
  .extend(ActivitesFilterValidations)

export const GET = async (request: NextRequest) => {
  const log = createExportDebugLogger(debugExport)

  log('Starting export request')

  const sessionToken = getSessionTokenFromNextRequestCookies(request.cookies)
  const user = await getSessionUserFromSessionToken(sessionToken)

  log('Auth complete', { userId: user?.id })

  if (!user?.mediateur && !user?.coordinateur) {
    return new Response('Unauthorized', {
      status: 401,
    })
  }

  const parsedQueryParams = ExportActivitesValidation.safeParse(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  )

  if (parsedQueryParams.error) {
    return new Response('Invalid query params', {
      status: 400,
    })
  }

  const filters = parsedQueryParams.data as ActivitesFilters

  const mediateurIds: string[] = [
    ...(user.mediateur ? [user.mediateur.id] : []),
    ...(user.coordinateur
      ? user.coordinateur.mediateursCoordonnes.map(toMediateurId)
      : []),
  ]

  const hasCraV1 = await getHasCrasV1({
    user,
    mediateurIds,
    activitesFilters: {},
  })

  log('getHasCrasV1 complete', { hasCrasV1: hasCraV1.hasCrasV1 })

  const filteredMediateurIds =
    (filters.mediateurs ?? []).length > 0
      ? mediateurIds.filter((id) => filters.mediateurs?.includes(id))
      : mediateurIds

  const activitesWorksheetInput = await getAccompagenmentsWorksheetInput({
    user,
    filters,
    mediateurIds: filteredMediateurIds,
    hasCraV1: hasCraV1.hasCrasV1,
    log,
  })

  log('getAccompagenmentsWorksheetInput complete', {
    activitesCount: activitesWorksheetInput.activites.length,
  })

  const isSelfExport =
    user.mediateur != null &&
    mediateurIds.includes(user.mediateur.id) &&
    mediateurIds.length === 1

  const workbook = buildAccompagnementsWorksheet(
    activitesWorksheetInput,
    isSelfExport,
  )

  log('buildAccompagnementsWorksheet complete')

  const data = await workbook.xlsx.writeBuffer()

  log('writeBuffer complete', { bufferSize: data.byteLength })

  const filename = `coop-numerique_accompagnements_${dateAsIsoDay(new Date())}.xlsx`

  log('Export complete', {
    activitesCount: activitesWorksheetInput.activites.length,
    filename,
  })

  return new Response(data, {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
