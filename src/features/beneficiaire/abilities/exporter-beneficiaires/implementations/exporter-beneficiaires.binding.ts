import type { ListerLesBeneficiairesAExporter } from '../domain/exporter-beneficiaires'
import { exporterBeneficiaires } from '../domain/exporter-beneficiaires'
import { classeurDesBeneficiaires } from './excel/classeur-des-beneficiaires.classeur'

export const exporterBeneficiairesAvec = (
  listerBeneficiaires: ListerLesBeneficiairesAExporter,
) =>
  exporterBeneficiaires({
    listerBeneficiaires,
    construireLeClasseur: classeurDesBeneficiaires,
  })
