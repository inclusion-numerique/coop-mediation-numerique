import { DispositifProgrammeNational } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { pont } from './pont'

const table = {
  AidantsConnect: DispositifProgrammeNational.AidantsConnect,
  BibliothequesNumeriqueDeReference:
    DispositifProgrammeNational.BibliothequesNumeriqueDeReference,
  CertificationPix: DispositifProgrammeNational.CertificationPIX,
  ConseillersNumeriques: DispositifProgrammeNational.ConseillersNumeriques,
  EmmausConnect: DispositifProgrammeNational.EmmausConnect,
  FranceServices: DispositifProgrammeNational.FranceServices,
  GrandeEcoleDuNumerique: DispositifProgrammeNational.GrandeEcoleDuNumerique,
  LaCroixRouge: DispositifProgrammeNational.LaCroixRouge,
  PointAccesNumeriqueCaf: DispositifProgrammeNational.PointNumeriqueCAF,
  PromeneursDuNet: DispositifProgrammeNational.PromeneursDuNet,
  RelaisNumeriqueEmmausConnect:
    DispositifProgrammeNational.RelaisNumeriqueEmmausConnect,
} satisfies Record<string, DispositifProgrammeNational>

export type DispositifProgrammeNationalCoop = keyof typeof table

export const dispositifProgrammeNational = pont(
  DispositifProgrammeNational,
  table,
)
