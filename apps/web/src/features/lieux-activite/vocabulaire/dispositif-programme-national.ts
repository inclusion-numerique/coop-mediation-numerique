import { DispositifProgrammeNational } from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { DispositifProgrammeNational as DispositifProgrammeNationalCoop } from '@prisma/client'
import { pont } from './pont'

const table: Record<
  DispositifProgrammeNationalCoop,
  DispositifProgrammeNational
> = {
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
}

export const dispositifProgrammeNational = pont(table)
