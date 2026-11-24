import type { NextRequest } from 'next/server'
import { isMediateur } from '@/features/authentification/domain/profils-d-utilisateur'
import { getSessionUserFromSessionToken } from '@/features/authentification/implementations/prisma/utilisateur-de-la-session.query'
import { getSessionTokenFromNextRequestCookies } from '@/features/authentification/implementations/session/session-token-from-cookies'
import { ExportBeneficiairesFilterValidations } from '@/features/beneficiaire/abilities/exporter-beneficiaires/action/filtres-de-l-export.validation'
import { exporterBeneficiairesAvec } from '@/features/beneficiaire/abilities/exporter-beneficiaires/implementations/exporter-beneficiaires.binding'
import { listerBeneficiaires } from '@/features/beneficiaire/abilities/lister-beneficiaires/implementations/prisma/lister-beneficiaires.query'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { auteurDeLExport } from '@/features/utilisateurs/ui/presenters/auteur-de-l-export.presenter'
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

  const workbook = await exporterBeneficiairesAvec(listerBeneficiaires)({
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
