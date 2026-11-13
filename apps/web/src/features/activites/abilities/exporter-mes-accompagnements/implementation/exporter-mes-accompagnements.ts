import type { FiltreDesConseillersNumeriques } from '../../../db/criteres-des-activites.sql'
import type { CriteresDesActivites } from '../../../domain'
import {
  type Demandeur,
  type ExportDesAccompagnements,
  estUnExportPersonnel,
  mediateursAutorises,
  perimetreDeLExport,
} from '../domain'
import {
  accompagnementsExportes,
  importsV1Presents,
} from './prisma/accompagnements-exportes.query'

export const exporterMesAccompagnements = async ({
  demandeur,
  criteres,
  conseillersNumeriques,
}: {
  readonly demandeur: Demandeur
  readonly criteres: CriteresDesActivites
  readonly conseillersNumeriques: FiltreDesConseillersNumeriques
}): Promise<ExportDesAccompagnements> => {
  const autorises = mediateursAutorises(demandeur)
  const [activites, avecImportsV1] = await Promise.all([
    accompagnementsExportes({
      perimetre: perimetreDeLExport(autorises, criteres.mediateurs),
      coordinateurId: demandeur.coordinateurId,
      criteres,
      conseillersNumeriques,
    }),
    demandeur.coordinateurId === null
      ? importsV1Presents(autorises)
      : Promise.resolve(true),
  ])
  return {
    activites,
    colonnes: {
      personnel: estUnExportPersonnel(demandeur, autorises),
      source: avecImportsV1,
    },
  }
}
