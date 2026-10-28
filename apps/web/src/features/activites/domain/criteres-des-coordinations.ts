import { z } from 'zod'
import { TagId } from './tag-id'
import { TypeDActiviteDeCoordination } from './type-d-activite-de-coordination'

export type Periode = {
  readonly du: Date
  readonly au: Date
}

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

const JourIso = z.iso.date().transform((jour) => new Date(jour))

const lire = <S extends z.ZodType>(
  schema: S,
  valeur: unknown,
): z.output<S> | null => {
  const lue = schema.safeParse(valeur)
  return lue.success ? lue.data : null
}

const liste = <S extends z.ZodType>(
  schema: S,
  valeurs: string | undefined,
): z.output<S>[] =>
  (valeurs ?? '').split(',').flatMap((valeur) => {
    const lue = lire(schema, valeur.trim())
    return lue === null ? [] : [lue]
  })

const periodeDe = (du: string | undefined, au: string | undefined) => {
  const debut = lire(JourIso, du)
  const fin = lire(JourIso, au)
  return debut === null || fin === null || debut > fin
    ? null
    : { du: debut, au: fin }
}

export const criteresDesCoordinations = ({
  du,
  au,
  types,
  tags,
}: ParametresDesCoordinations): CriteresDesCoordinations => ({
  periode: periodeDe(du, au),
  types: liste(TypeDActiviteDeCoordination.schema, types),
  tags: liste(TagId.schema, tags),
})

export const estFiltre = ({
  periode,
  types,
  tags,
}: CriteresDesCoordinations): boolean =>
  periode !== null || types.length > 0 || tags.length > 0
