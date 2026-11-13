import {
  type Periode,
  periodeLue,
  valeursLues,
} from '@app/web/libraries/parametres-d-url'
import { TagId } from './tag-id'
import { TypeDActiviteDeCoordination } from './type-d-activite-de-coordination'

export type { Periode }

export type CriteresDesCoordinations = {
  readonly periode: Periode | null
  readonly types: readonly TypeDActiviteDeCoordination[]
  readonly tags: readonly TagId[]
}

export type ParametresDesCoordinations = {
  readonly du?: string
  readonly au?: string
  readonly types?: string
  readonly tags?: string
}

export const criteresDesCoordinations = ({
  du,
  au,
  types,
  tags,
}: ParametresDesCoordinations): CriteresDesCoordinations => ({
  periode: periodeLue(du, au),
  types: valeursLues(TypeDActiviteDeCoordination.schema, types),
  tags: valeursLues(TagId.schema, tags),
})

export const estFiltre = ({
  periode,
  types,
  tags,
}: CriteresDesCoordinations): boolean =>
  periode !== null || types.length > 0 || tags.length > 0
