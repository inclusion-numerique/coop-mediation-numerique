import { composerLesFiltres } from '@/libraries/filtres/definition/composition'
import { filtreDeChoix } from '@/libraries/filtres/definition/filtre-de-choix'
import { filtreDePeriode } from '@/libraries/filtres/definition/filtre-de-periode'
import {
  type CriteresDesCoordinations,
  type TagId,
  TypeDActiviteDeCoordination,
} from '../../domain'
import { filtreDesTags, periodeOrdonnee } from './activites.filtre'

export const filtreDuTypeDeCoordination = filtreDeChoix({
  titre: 'Type de coordination',
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
  periode: periodeOrdonnee(valeurs),
  types: valeurs.types.map((type) => TypeDActiviteDeCoordination(type)),
  tags: valeurs.tags,
})

export const filtresDesCoordinations = composerLesFiltres(
  filtreDePeriode,
  filtreDuTypeDeCoordination,
  filtreDesTags,
)

export type ValeursDesCoordinations = ReturnType<
  typeof filtresDesCoordinations.charger
>
