import {
  csvResponse,
  routeBuilder,
  withSearchParams,
} from '@arckit/nextjs/route'
import {
  lignesDExport,
  ParametresDeLExport,
  PopulationDeMediateurs,
} from '@/features/activites/abilities/exporter-les-accompagnements-par-departement/domain/index'
import {
  exportDesAccompagnementsCsv,
  nomDuFichierDExport,
} from '@/features/activites/abilities/exporter-les-accompagnements-par-departement/implementations/csv/export-des-accompagnements.classeur'
import { accompagnementsParDepartement } from '@/features/activites/abilities/exporter-les-accompagnements-par-departement/implementations/prisma/accompagnements-par-departement.query'
import { withAdminRoute } from '@/features/authentification/middlewares/with-admin-route'

export const GET = routeBuilder()
  .use(withAdminRoute)
  .use(withSearchParams((raw) => ParametresDeLExport.parse(raw)))
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
