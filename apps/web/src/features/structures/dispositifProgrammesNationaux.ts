import { DispositifProgrammeNational } from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { DispositifProgrammeNational as PrismaDispositifProgrammeNational } from '@prisma/client'

export const dispositifProgrammeNationalLabels: Record<
  PrismaDispositifProgrammeNational,
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

export const dispositifProgrammeNationalKeys: Record<
  DispositifProgrammeNational,
  PrismaDispositifProgrammeNational
> = Object.fromEntries(
  Object.entries(dispositifProgrammeNationalLabels).map(([key, value]) => [
    value,
    key,
  ]),
) as Record<DispositifProgrammeNational, PrismaDispositifProgrammeNational>
