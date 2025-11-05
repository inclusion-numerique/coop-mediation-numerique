import { getSessionTokenFromNextRequestCookies } from '@app/web/auth/getSessionTokenFromCookies'
import { getSessionUserFromSessionToken } from '@app/web/auth/getSessionUserFromSessionToken'
import { isCoordinateur } from '@app/web/auth/userTypeGuards'
import { TYPE_ACTIVITE_OPTIONS } from '@app/web/features/activites/use-cases/cra/coordination/labels'
import { buildActivitesCoordinationWorksheet } from '@app/web/features/activites/use-cases/list/export/buildActivitesCoordinationWorksheet'
import { getActivitesCoordinationWorksheetInput } from '@app/web/features/activites/use-cases/list/export/getActivitesCoordinationWorksheetInput'
import { validateCoordinationsFilters } from '@app/web/features/activites/use-cases/list/validation/CoordinationsFilters'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const GET = async (request: NextRequest) => {
  const sessionToken = getSessionTokenFromNextRequestCookies(request.cookies)
  const user = await getSessionUserFromSessionToken(sessionToken)

  if (!user || !isCoordinateur(user)) {
    return new Response('Unauthorized', {
      status: 401,
    })
  }

  const searchParams = validateCoordinationsFilters(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  )

  const filters = [
    {
      label: 'Période',
      value:
        searchParams.du != null && searchParams.au != null
          ? `${dateAsIsoDay(searchParams.du)} - ${dateAsIsoDay(searchParams.au)}`
          : undefined,
    },
    {
      label: 'Type d’activité',
      value: searchParams.types
        .map(
          (type) =>
            TYPE_ACTIVITE_OPTIONS.find(({ value }) => type === value)?.label,
        )
        .join(', '),
    },
  ]

  const coordinationsWorksheetInput =
    await getActivitesCoordinationWorksheetInput({
      user,
      searchParams,
    })

  const workbook = buildActivitesCoordinationWorksheet(
    coordinationsWorksheetInput,
    filters,
  )

  const data = await workbook.xlsx.writeBuffer()

  const filename = `coop-numerique_coordinations_${dateAsIsoDay(new Date())}.xlsx`

  return new Response(data, {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
