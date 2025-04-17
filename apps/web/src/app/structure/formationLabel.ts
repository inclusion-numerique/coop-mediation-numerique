import { labelsToOptions } from '@app/ui/components/Form/utils/options'
import { FormationLabel } from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { FormationLabel as PrismaFormationLabel } from '@prisma/client'

export const formationLabelLabels: Record<
  PrismaFormationLabel,
  FormationLabel
> = {
  FormeAMonEspaceSante: FormationLabel.FormeAMonEspaceSante,
  FormeADuplex: FormationLabel.FormeADuplex,
  ArniaMednum: FormationLabel.ArniaMednum,
  CollectifRessourcesEtActeursReemploi:
    FormationLabel.CollectifRessourcesEtActeursReemploi,
  FabriquesDeTerritoire: FormationLabel.FabriquesDeTerritoire,
  LesEclaireurs: FormationLabel.LesEclaireurs,
  MesPapiers: FormationLabel.MesPapiers,
  Ordi3: FormationLabel.Ordi3,
  SudLabs: FormationLabel.SudLabs,
}

export const formationLabelKeys: Record<FormationLabel, PrismaFormationLabel> =
  Object.fromEntries(
    Object.entries(formationLabelLabels).map(([key, value]) => [value, key]),
  ) as Record<FormationLabel, PrismaFormationLabel>

export type FormationLabelLabel = keyof typeof formationLabelLabels

export const formationLabelValues = Object.keys(formationLabelLabels) as [
  FormationLabelLabel,
  ...FormationLabelLabel[],
]

export const formationLabelOptions = labelsToOptions(formationLabelLabels)
