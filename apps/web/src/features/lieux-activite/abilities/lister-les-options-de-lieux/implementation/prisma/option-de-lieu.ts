import type { SelectOption } from '@app/ui/components/Form/utils/options'

/**
 * Un lieu tel qu'il se choisit dans un filtre : de quoi le reconnaître, et de
 * quoi mettre en tête celui où l'on travaille le plus.
 *
 * Ce type et sa projection vivaient en double dans deux fichiers voisins, avec
 * des sélections de colonnes déjà divergentes.
 */
export type LieuActiviteOption = SelectOption<
  string,
  {
    nom: string
    adresse: string
    activites: number
    mostUsed: boolean
  }
>

export const adresseComplete = ({
  adresse,
  codePostal,
  commune,
}: {
  adresse: string
  codePostal: string
  commune: string
}): string => `${adresse}, ${codePostal} ${commune}`

export const optionDeLieu = (
  lieu: {
    id: string
    nom: string
    adresse: string
    codePostal: string
    commune: string
  },
  activites: number,
  rang: number,
): LieuActiviteOption => ({
  value: lieu.id,
  label: lieu.nom,
  extra: {
    nom: lieu.nom,
    adresse: adresseComplete(lieu),
    activites,
    mostUsed: rang === 0 && activites > 0,
  },
})
