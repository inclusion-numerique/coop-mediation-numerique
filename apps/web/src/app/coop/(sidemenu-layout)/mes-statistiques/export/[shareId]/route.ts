import { getSessionUserFromId } from '@app/web/auth/getSessionUserFromSessionToken'
import {
  ActivitesFilters,
  ActivitesFilterValidations,
} from '@app/web/features/activites/use-cases/list/validation/ActivitesFilters'
import { resoudreUnLienDePartage } from '@app/web/features/mediateurs/abilities/resoudre-un-lien-de-partage'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import { buildStatistiquesWorksheet } from '@app/web/worksheet/statistiques/buildStatistiquesWorksheet'
import { getStatistiquesWorksheetInput } from '@app/web/worksheet/statistiques/getStatistiquesWorksheetInput'
import { notFound } from 'next/navigation'
import { NextRequest } from 'next/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const ExportActivitesValidation = z.object(ActivitesFilterValidations)

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> },
) => {
  const shareId = (await params).shareId
  const partage = await resoudreUnLienDePartage(shareId)
  if (!partage.success) return notFound()

  const parsedQueryParams = ExportActivitesValidation.safeParse(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  )

  if (parsedQueryParams.error) {
    return new Response('Invalid query params', { status: 400 })
  }

  const filters = parsedQueryParams.data as ActivitesFilters

  const { proprietaire, utilisateurId } = partage.data
  const user = await getSessionUserFromId(utilisateurId)

  const statistiquesWorksheetInput = await getStatistiquesWorksheetInput({
    user: {
      ...user,
      emplois: [],
      rdvAccount: null,
      mediateur: proprietaire._tag === 'Mediateur' ? user.mediateur : null,
      coordinateur:
        proprietaire._tag === 'Coordinateur' ? user.coordinateur : null,
    },
    filters,
  })

  const workbook = buildStatistiquesWorksheet(statistiquesWorksheetInput)

  const data = await workbook.xlsx.writeBuffer()
  const filename = `coop-numerique_statistiques_${dateAsIsoDay(
    new Date(),
  )}.xlsx`

  return new Response(data, {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
