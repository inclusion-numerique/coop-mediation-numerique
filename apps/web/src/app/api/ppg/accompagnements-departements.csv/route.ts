import { getSessionTokenFromNextRequestCookies } from '@app/web/auth/getSessionTokenFromCookies'
import { getSessionUserFromSessionToken } from '@app/web/auth/getSessionUserFromSessionToken'
import {
  accompagnementsParDepartement,
  exportDesAccompagnementsCsv,
  Jour,
  lignesDExport,
  nomDuFichierDExport,
  PopulationDeMediateurs,
} from '@app/web/features/activites/abilities/exporter-les-accompagnements-par-departement'
import {
  csvResponse,
  routeBuilder,
  withSearchParams,
} from '@arckit/nextjs/route'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const ExportQueryParamsValidation = z.object({
  date: Jour.schema.optional(),
})

const withAdministrateur = async (
  _ctx: object,
  request: NextRequest,
): Promise<{ ctx: object } | NextResponse> => {
  const user = await getSessionUserFromSessionToken(
    getSessionTokenFromNextRequestCookies(request.cookies),
  )

  return user?.role === 'Admin'
    ? { ctx: {} }
    : new NextResponse('Unauthorized', { status: 401 })
}

export const GET = routeBuilder()
  .use(withAdministrateur)
  .use(withSearchParams((raw) => ExportQueryParamsValidation.parse(raw)))
  .handle(async ({ searchParams }) => {
    const jusquAu = searchParams.date ?? null

    const conseillersNumeriques = await accompagnementsParDepartement({
      population: PopulationDeMediateurs('ConseillersNumeriques'),
      jusquAu,
    })
    const autresMediateurs = await accompagnementsParDepartement({
      population: PopulationDeMediateurs('AutresMediateurs'),
      jusquAu,
    })

    return csvResponse(
      exportDesAccompagnementsCsv(
        lignesDExport({ conseillersNumeriques, autresMediateurs }),
      ),
      { filename: nomDuFichierDExport(jusquAu), withDate: false },
    )
  })
