import {
  listeEnParametre,
  listeSansLaValeur,
} from '@/libraries/parametres-d-url'

export type EtiquetteDeFiltre = {
  readonly parametre: string
  readonly valeur: string
  readonly libelle: string
}

type Parametres = Readonly<Record<string, string | null>>

export const communesEnParametres = (
  communes: readonly string[],
): Parametres => ({ communes: listeEnParametre(communes), page: null })

export const roleEnParametres = (role: string): Parametres => ({
  role: role === '' ? null : role,
  page: null,
})

export const sansLEtiquette = (
  requete: { get(cle: string): string | null },
  { parametre, valeur }: Pick<EtiquetteDeFiltre, 'parametre' | 'valeur'>,
): Parametres => ({
  [parametre]: listeSansLaValeur(requete.get(parametre), valeur),
  page: null,
})
