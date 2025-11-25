import { getSessionTokenFromNextRequestCookies } from '@app/web/auth/getSessionTokenFromCookies'
import { getSessionUserFromSessionToken } from '@app/web/auth/getSessionUserFromSessionToken'
import { isMediateur } from '@app/web/auth/userTypeGuards'
import { searchBeneficiaires } from '@app/web/beneficiaire/searchBeneficiaires'
import { buildBeneficiairesWorksheet } from '@app/web/features/beneficiaires/use-cases/list/export/buildBeneficiairesWorksheet'
import { ExportBeneficiairesFilterValidations } from '@app/web/features/beneficiaires/use-cases/list/export/exportBeneficiairesFilter'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import type { NextRequest } from 'next/server'

export const GET = async (request: NextRequest) => {
  const sessionToken = getSessionTokenFromNextRequestCookies(request.cookies)
  const user = await getSessionUserFromSessionToken(sessionToken)

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  if (!isMediateur(user)) {
    return new Response('Forbidden', { status: 403 })
  }

  const parsedQueryParams = ExportBeneficiairesFilterValidations.safeParse(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  )

  if (parsedQueryParams.error) {
    return new Response('Invalid query params', { status: 400 })
  }

  const filters = parsedQueryParams.data

  const beneficiairesWorksheetInput = await searchBeneficiaires({
    mediateurId: user.mediateur.id,
    searchParams: { ...filters, page: '1', pageSize: 10000 },
  })

  const workbook = buildBeneficiairesWorksheet({
    ...beneficiairesWorksheetInput,
    filters,
    user,
  })

  const data = await workbook.xlsx.writeBuffer()
  const filename = `coop-numerique_export-beneficiaires_${dateAsIsoDay(new Date())}.xlsx`

  return new Response(data, {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
