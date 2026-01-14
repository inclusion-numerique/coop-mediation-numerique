import { getSessionTokenFromNextRequestCookies } from '@app/web/auth/getSessionTokenFromCookies'
import { getSessionUserFromSessionToken } from '@app/web/auth/getSessionUserFromSessionToken'
import { isCoordinateur } from '@app/web/auth/userTypeGuards'
import type { EquipeSearchParams } from '@app/web/equipe/EquipeListePage/searchMediateursCoordonneBy'
import { buildEquipeWorksheet } from '@app/web/equipe/export/buildEquipeWorksheet'
import { getEquipeExportData } from '@app/web/equipe/export/getEquipeExportData'
import { prismaClient } from '@app/web/prismaClient'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import type { NextRequest } from 'next/server'

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ coordinateurId: string }> },
) => {
  const { coordinateurId } = await params

  const sessionToken = getSessionTokenFromNextRequestCookies(request.cookies)
  const user = await getSessionUserFromSessionToken(sessionToken)

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const coordinateur = await prismaClient.coordinateur.findUnique({
    where: { id: coordinateurId },
    select: { id: true },
  })

  if (!coordinateur) {
    return new Response('Coordinateur not found', { status: 404 })
  }

  const isAdmin = user.role === 'Admin'
  const isOwner =
    isCoordinateur(user) && user.coordinateur.id === coordinateurId
  const isMemberOfTeam = await prismaClient.mediateurCoordonne.findFirst({
    where: {
      coordinateurId,
      mediateur: { userId: user.id },
      suppression: null,
    },
  })

  if (!isAdmin && !isOwner && !isMemberOfTeam) {
    return new Response('Forbidden', { status: 403 })
  }

  const url = new URL(request.url)
  const searchParams: EquipeSearchParams = {
    recherche: url.searchParams.get('recherche') ?? undefined,
    statut: url.searchParams.get('statut') ?? undefined,
    role:
      (url.searchParams.get('role') as EquipeSearchParams['role']) ?? undefined,
    tri:
      (url.searchParams.get('tri') as EquipeSearchParams['tri']) ?? undefined,
    ordre:
      (url.searchParams.get('ordre') as EquipeSearchParams['ordre']) ??
      undefined,
  }

  const membres = await getEquipeExportData({ coordinateurId, searchParams })

  const workbook = buildEquipeWorksheet({
    membres,
    filters: searchParams,
    user,
  })

  const data = await workbook.xlsx.writeBuffer()
  const filename = `coop-numerique_export-equipe_${dateAsIsoDay(new Date())}.xlsx`

  return new Response(data, {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
