import { z } from 'zod'

const blankToUndefined = (value: unknown): unknown =>
  value == null || (typeof value === 'string' && value.trim() === '')
    ? undefined
    : value

/**
 * Champ de formulaire optionnel : une valeur vide (null, undefined, chaîne
 * blanche) est traitée comme absente avant validation par le schéma fourni.
 */
export const optional = <S extends z.ZodTypeAny>(schema: S) =>
  z.preprocess(blankToUndefined, schema.optional())
