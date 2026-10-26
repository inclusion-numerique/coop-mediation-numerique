export type EtiquetteDeFiltre = {
  readonly parametre: string
  readonly valeur: string
  readonly libelle: string
}

export const sansLaValeur = (valeurs: string | null, valeur: string): string =>
  (valeurs ?? '')
    .split(',')
    .filter((restante) => restante !== '' && restante !== valeur)
    .join(',')
