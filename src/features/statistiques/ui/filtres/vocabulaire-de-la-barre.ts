export type MotDuVocabulaire = {
  readonly value: string
  readonly label: string
}

export type VocabulaireDeLaBarre = {
  readonly typesDActivite: readonly MotDuVocabulaire[]
  readonly statutsDeRendezVous: readonly MotDuVocabulaire[]
  readonly thematiquesDeMediation: readonly MotDuVocabulaire[]
  readonly thematiquesAdministratives: readonly MotDuVocabulaire[]
  readonly toutesLesThematiques: readonly MotDuVocabulaire[]
}

export const libelleDans =
  (mots: readonly MotDuVocabulaire[]) =>
  (valeur: string): string =>
    mots.find((mot) => mot.value === valeur)?.label ?? valeur
