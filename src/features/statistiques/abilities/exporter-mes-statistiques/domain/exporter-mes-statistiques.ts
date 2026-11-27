import { failure, type Result, success } from '@/libraries/result'
import type { MediateurId } from '../../../domain/mediateur-id'
import {
  type DemandeurDeLExport,
  exportInterdit,
} from './demandeur-de-l-export'
import {
  type EchecDeExporterMesStatistiques,
  ExportDUnAutreMediateur,
  ExportNonAutorise,
} from './errors'
import type { ExporterMesStatistiquesPorts } from './ports'

export const exporterMesStatistiques =
  <Perimetre, Export>({
    preparerLExport,
  }: ExporterMesStatistiquesPorts<Perimetre, Export>) =>
  async ({
    demandeur,
    perimetre,
    mediateursExportes,
  }: {
    readonly demandeur: DemandeurDeLExport | null
    readonly perimetre: Perimetre | null
    readonly mediateursExportes: readonly MediateurId[]
  }): Promise<Result<Export, EchecDeExporterMesStatistiques>> => {
    if (demandeur === null || perimetre === null)
      return failure(ExportNonAutorise())

    if (exportInterdit(demandeur, mediateursExportes))
      return failure(ExportDUnAutreMediateur())

    return success(await preparerLExport(perimetre))
  }
