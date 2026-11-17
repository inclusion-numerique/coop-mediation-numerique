import type { NextRequest } from 'next/server'
import { getSessionTokenFromNextRequestCookies } from '@/auth/getSessionTokenFromCookies'
import { getSessionUserFromSessionToken } from '@/auth/getSessionUserFromSessionToken'
import { isMediateur } from '@/auth/userTypeGuards'
import {
  ExportBeneficiairesFilterValidations,
  exporterBeneficiaires,
} from '@/features/beneficiaire/abilities/exporter-beneficiaires'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { dateAsIsoDay } from '@/utils/dateAsIsoDay'

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

  const workbook = await exporterBeneficiaires({
    mediateurId: MediateurId(user.mediateur.id),
    filters: parsedQueryParams.data,
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
