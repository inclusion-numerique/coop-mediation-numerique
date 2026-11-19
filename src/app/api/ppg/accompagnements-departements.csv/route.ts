import {
  csvResponse,
  routeBuilder,
  withSearchParams,
} from '@arckit/nextjs/route'
import { z } from 'zod'
import {
  accompagnementsParDepartement,
  exportDesAccompagnementsCsv,
  Jour,
  lignesDExport,
  nomDuFichierDExport,
  PopulationDeMediateurs,
} from '@/features/activites/abilities/exporter-les-accompagnements-par-departement'
import { withAdminRoute } from '@/features/authentification'
import { conseillerNumeriqueSql } from '@/features/employeuse/server'

const ExportQueryParamsValidation = z.object({
  date: Jour.schema.optional(),
})

export const GET = routeBuilder()
  .use(withAdminRoute)
  .use(withSearchParams((raw) => ExportQueryParamsValidation.parse(raw)))
  .handle(async ({ searchParams }) => {
    const jusquAu = searchParams.date ?? null

    const conseillersNumeriques = await accompagnementsParDepartement({
      population: PopulationDeMediateurs('ConseillersNumeriques'),
      jusquAu,
      filtreDesConseillersNumeriques: conseillerNumeriqueSql,
    })
    const autresMediateurs = await accompagnementsParDepartement({
      population: PopulationDeMediateurs('AutresMediateurs'),
      jusquAu,
      filtreDesConseillersNumeriques: conseillerNumeriqueSql,
    })

    return csvResponse(
      exportDesAccompagnementsCsv(
        lignesDExport({ conseillersNumeriques, autresMediateurs }),
      ),
      { filename: nomDuFichierDExport(jusquAu), withDate: false },
    )
  })
