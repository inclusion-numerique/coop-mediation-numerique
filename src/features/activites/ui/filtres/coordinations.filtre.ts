import { filtreDeChoix } from '@/libraries/filtres/definition/filtre-de-choix'
import {
  type CriteresDesCoordinations,
  type TagId,
  TypeDActiviteDeCoordination,
} from '../../domain'

export const filtreDuTypeDeCoordination = filtreDeChoix({
  cle: 'types',
  choix: {
    Evenement: 'Évènement',
    Partenariat: 'Partenariat',
    Animation: 'Animation',
  },
})

type ValeursDesFiltres = {
  readonly du: Date | null
  readonly au: Date | null
  readonly types: readonly ('Evenement' | 'Partenariat' | 'Animation')[]
  readonly tags: readonly TagId[]
}

export const criteresDesFiltresDeCoordination = (
  valeurs: ValeursDesFiltres,
): CriteresDesCoordinations => ({
  periode:
    valeurs.du === null || valeurs.au === null
      ? null
      : { du: valeurs.du, au: valeurs.au },
  types: valeurs.types.map((type) => TypeDActiviteDeCoordination(type)),
  tags: valeurs.tags,
})
