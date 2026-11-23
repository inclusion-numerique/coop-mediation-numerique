import type { NextRequest } from 'next/server'
import { isMediateur } from '@/features/authentification/domain/profils-d-utilisateur'
import { getSessionTokenFromNextRequestCookies } from '@/features/authentification/implementations/session/getSessionTokenFromCookies'
import { getSessionUserFromSessionToken } from '@/features/authentification/implementations/session/getSessionUserFromSessionToken'
import {
  ExportBeneficiairesFilterValidations,
  exporterBeneficiaires,
} from '@/features/beneficiaire/abilities/exporter-beneficiaires'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { auteurDeLExport } from '@/features/utilisateurs/ui/auteur-de-l-export'
import { dateAsIsoDay } from '@/libraries/date/dateAsIsoDay'

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
    auteur: auteurDeLExport(user),
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
