import { notFound } from 'next/navigation'
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { getMesStatistiquesPageData } from '@/composition/statistiques/mes-statistiques'
import { getSessionUserFromId } from '@/features/authentification/implementation/session/getSessionUserFromSessionToken'
import { resoudreUnLienDePartage } from '@/features/mediateurs/abilities/resoudre-un-lien-de-partage'
import { utilisateurDuPartage } from '@/features/statistiques/implementation/utilisateur-du-partage'
import {
  type ActivitesFilters,
  ActivitesFilterValidations,
} from '@/features/statistiques/ui/filtres/parametres-de-la-barre'
import { buildStatistiquesWorksheet } from '@/features/statistiques/ui/tableur/classeur-des-statistiques'
import { entreeDuClasseur } from '@/features/statistiques/ui/tableur/entree-du-classeur'
import { auteurDeLExport } from '@/features/utilisateurs'
import { dateAsIsoDay } from '@/libraries/date/dateAsIsoDay'

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

  const user = utilisateurDuPartage(
    partage.data.proprietaire,
    await getSessionUserFromId(partage.data.utilisateurId),
  )

  const statistiquesWorksheetInput = entreeDuClasseur({
    statistiques: await getMesStatistiquesPageData({
      user,
      activitesFilters: filters,
    }),
    filters,
    auteur: auteurDeLExport(user),
    fuseau: user.timezone,
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
