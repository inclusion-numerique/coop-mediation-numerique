import { FormationLabel } from '@gouvfr-anct/lieux-de-mediation-numerique'

export const FormationLabelPropose = {
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
} as const satisfies Record<string, FormationLabel>

export type FormationLabelPropose =
  (typeof FormationLabelPropose)[keyof typeof FormationLabelPropose]

const proposes = new Set<string>(Object.values(FormationLabelPropose))

export const formationsLabelsProposees = (
  labels: readonly FormationLabel[],
): readonly FormationLabelPropose[] =>
  labels.filter((label): label is FormationLabelPropose => proposes.has(label))

export const reconnues = <Valeur extends string>(
  enumeration: Record<string, Valeur>,
  libelles: readonly string[],
): Valeur[] => {
  const connues = new Set<string>(Object.values(enumeration))

  return libelles.filter((libelle): libelle is Valeur => connues.has(libelle))
}
