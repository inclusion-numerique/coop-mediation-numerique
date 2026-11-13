import { utilisateurDuPartage } from '@app/web/composition/statistiques/partage'
import { getStatistiquesWorksheetInput } from '@app/web/composition/statistiques/tableur'
import { resoudreUnLienDePartage } from '@app/web/features/mediateurs/abilities/resoudre-un-lien-de-partage'
import {
  type ActivitesFilters,
  ActivitesFilterValidations,
} from '@app/web/features/statistiques/ui/filtres/parametres-de-la-barre'
import { buildStatistiquesWorksheet } from '@app/web/features/statistiques/ui/tableur/classeur-des-statistiques'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
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

  const filters: ActivitesFilters = parsedQueryParams.data

  const statistiquesWorksheetInput = await getStatistiquesWorksheetInput({
    user: await utilisateurDuPartage(partage.data),
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
