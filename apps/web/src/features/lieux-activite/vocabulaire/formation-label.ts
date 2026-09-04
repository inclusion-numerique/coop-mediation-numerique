import { FormationLabel } from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { FormationLabel as FormationLabelCoop } from '@prisma/client'
import { pont } from './pont'

const table: Record<FormationLabelCoop, FormationLabel> = {
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

export const formationLabel = pont(table)
