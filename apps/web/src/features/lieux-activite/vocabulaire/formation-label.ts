import { FormationLabel } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { pont } from './pont'

const table = {
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
} satisfies Record<string, FormationLabel>

export type FormationLabelCoop = keyof typeof table

export const formationLabel = pont(FormationLabel, table)
