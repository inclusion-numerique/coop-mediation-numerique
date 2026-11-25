import { TypeDActiviteDeCoordination } from '../coordination/type-d-activite-de-coordination'
import { TagId } from '../identifiants/tag-id'
import type { Periode } from './periode'

export type { Periode }

export type CriteresDesCoordinations = {
  readonly periode: Periode | null
  readonly types: readonly TypeDActiviteDeCoordination[]
  readonly tags: readonly TagId[]
}

export const estFiltre = ({
  periode,
  types,
  tags,
}: CriteresDesCoordinations): boolean =>
  periode !== null || types.length > 0 || tags.length > 0
