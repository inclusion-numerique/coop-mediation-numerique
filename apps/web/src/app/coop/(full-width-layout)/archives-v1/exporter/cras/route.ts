import { getArchivesV1PageDataWithCras } from '@app/web/app/coop/(full-width-layout)/archives-v1/getArchivesV1PageData'
import { getSessionTokenFromNextRequestCookies } from '@app/web/auth/getSessionTokenFromCookies'
import { getSessionUserFromSessionToken } from '@app/web/auth/getSessionUserFromSessionToken'
import { fetchConseillerNumeriqueV1Data } from '@app/web/external-apis/conseiller-numerique/fetchConseillerNumeriqueV1Data'
import { prismaClient } from '@app/web/prismaClient'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import { GetCrasConseillerNumeriqueV1QueryParamsValidation } from '@app/web/v1/GetCrasConseillerNumeriqueV1QueryParamsValidation'
import { buildArchivesCrasV1Worksheet } from '@app/web/worksheet/archivesCrasV1/buildArchivesCrasV1Worksheet'
import type { NextRequest } from 'next/server'

export const GET = async (request: NextRequest) => {
  // parse url search params as object with zod
  const parsedInput =
    GetCrasConseillerNumeriqueV1QueryParamsValidation.safeParse(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    )

  if (!parsedInput.success) {
    return new Response(JSON.stringify(parsedInput.error), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  const sessionToken = getSessionTokenFromNextRequestCookies(request.cookies)
  const user = await getSessionUserFromSessionToken(sessionToken)

  if (!user) {
    return new Response('Unauthorized', {
      status: 401,
    })
  }

  const input = parsedInput.data

  // Check existence in V1
  if (input.conseiller) {
    const v1ConseillerNumerique = await fetchConseillerNumeriqueV1Data({
      v1ConseillerId: input.conseiller,
    })

    if (!v1ConseillerNumerique) {
      return new Response('Conseiller numerique not found', { status: 404 })
    }
  }

  // Check existence
  if (input.coordinateur) {
    const coordinateur = await prismaClient.coordinateur.findUnique({
      where: {
        conseillerNumeriqueId: input.coordinateur,
      },
      select: {
        id: true,
      },
    })

    if (!coordinateur) {
      return new Response('Coordinateur not found', { status: 404 })
    }
  }

  // Can only access own CRAs
  if (
    input.conseiller &&
    user.mediateur?.conseillerNumerique?.id !== input.conseiller &&
    user.coordinateur?.conseillerNumeriqueId !== input.conseiller
  ) {
    return new Response('Forbidden', { status: 403 })
  }

  if (
    input.coordinateur &&
    user.coordinateur?.conseillerNumeriqueId !== input.coordinateur
  ) {
    return new Response('Forbidden', { status: 403 })
  }

  const conseillerId = input.conseiller ?? input.coordinateur

  if (!conseillerId) {
    return new Response('Invalid scope (conseiller or coordinateur needed)', {
      status: 400,
    })
  }

  const data = await getArchivesV1PageDataWithCras({
    conseillerNumeriqueIds: [conseillerId],
  })

  if (data.empty) {
    return new Response('No CRAs found', { status: 404 })
  }

  const workbook = buildArchivesCrasV1Worksheet(data)

  const workbookData = await workbook.xlsx.writeBuffer()

  const filename = `coop-numerique_archives-v1_cras_${dateAsIsoDay(new Date())}.xlsx`

  return new Response(workbookData, {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
