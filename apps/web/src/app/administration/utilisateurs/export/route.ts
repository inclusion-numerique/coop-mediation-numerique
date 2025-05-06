import { getSessionTokenFromNextRequestCookies } from '@app/web/auth/getSessionTokenFromCookies'
import { getSessionUserFromSessionToken } from '@app/web/auth/getSessionUserFromSessionToken'
import { buildUtilisateursWorksheet } from '@app/web/features/utilisateurs/use-cases/export/buildUtilisateursWorksheet'
import { getUtilisateursWorksheetInput } from '@app/web/features/utilisateurs/use-cases/export/getUtilisateursWorksheetInput'
import { enforceIsAdmin } from '@app/web/server/rpc/enforceIsAdmin'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const GET = async (request: NextRequest) => {
  const sessionToken = getSessionTokenFromNextRequestCookies(request.cookies)
  const user = await getSessionUserFromSessionToken(sessionToken)

  enforceIsAdmin(user)

  const filters = Object.fromEntries(request.nextUrl.searchParams.entries())

  const utilisateursWorksheetInput = await getUtilisateursWorksheetInput({
    user,
    filters,
  })

  const workbook = buildUtilisateursWorksheet(utilisateursWorksheetInput)

  const data = await workbook.xlsx.writeBuffer()

  const filename = `coop-numerique_utilisateurs_${dateAsIsoDay(new Date())}.xlsx`

  return new Response(data, {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
