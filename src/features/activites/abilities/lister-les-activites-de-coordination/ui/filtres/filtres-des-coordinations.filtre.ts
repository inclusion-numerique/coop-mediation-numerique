import { composerLesFiltres } from '@/libraries/filtres/definition/composition'
import { filtreDePeriode } from '@/libraries/filtres/definition/filtre-de-periode'
import { filtreDesTags } from '../../../../ui/filtres/activites.filtre'
import { filtreDuTypeDeCoordination } from '../../../../ui/filtres/coordinations.filtre'

export const filtresDesCoordinations = composerLesFiltres(
  filtreDePeriode,
  filtreDuTypeDeCoordination,
  filtreDesTags,
)

export type ValeursDesCoordinations = ReturnType<
  typeof filtresDesCoordinations.charger
>
