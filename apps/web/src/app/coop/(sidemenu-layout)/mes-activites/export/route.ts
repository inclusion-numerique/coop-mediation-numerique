import { getSessionTokenFromNextRequestCookies } from '@app/web/auth/getSessionTokenFromCookies'
import { getSessionUserFromSessionToken } from '@app/web/auth/getSessionUserFromSessionToken'
import type { MediateurUser } from '@app/web/auth/userTypeGuards'
import { buildAccompagnementsWorksheet } from '@app/web/features/activites/use-cases/list/export/buildAccompagnementsWorksheet'
import { getAccompagenmentsWorksheetInput } from '@app/web/features/activites/use-cases/list/export/getAccompagenmentsWorksheetInput'
import {
  ActivitesFilters,
  ActivitesFilterValidations,
} from '@app/web/features/activites/use-cases/list/validation/ActivitesFilters'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import type { NextRequest } from 'next/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const toMediateurId = ({ mediateurId }: { mediateurId: string }) => mediateurId

const ExportActivitesValidation = z
  .object({
    // If you want to filter by a specific mediateur, you can add it here
    // By default this will export for current user if he is a mediateur
    mediateur: z.string().uuid().optional(),
  })
  .extend(ActivitesFilterValidations)

export const GET = async (request: NextRequest) => {
  const sessionToken = getSessionTokenFromNextRequestCookies(request.cookies)
  const user = await getSessionUserFromSessionToken(sessionToken)

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

  const activitesWorksheetInput = await getAccompagenmentsWorksheetInput({
    user,
    filters,
    mediateurIds:
      (filters.mediateurs ?? []).length > 0
        ? mediateurIds.filter((id) => filters.mediateurs?.includes(id))
        : mediateurIds,
  })

  const isSelfExport =
    user.mediateur != null &&
    mediateurIds.includes(user.mediateur.id) &&
    mediateurIds.length === 1

  const workbook = buildAccompagnementsWorksheet(
    activitesWorksheetInput,
    isSelfExport,
  )

  const data = await workbook.xlsx.writeBuffer()

  const filename = `coop-numerique_accompagnements_${dateAsIsoDay(new Date())}.xlsx`

  return new Response(data, {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
