import { defineModel, type Model } from '@app/web/libraries/model'
import { telephoneCanonique } from '@app/web/libraries/telephone'
import { z } from 'zod'

export const Telephone = defineModel(
  z
    .string()
    .transform((saisi, ctx) => {
      const canonique = telephoneCanonique(saisi)
      if (canonique == null) {
        ctx.addIssue({ code: 'custom', message: 'Invalid' })
        return z.NEVER
      }
      return canonique
    })
    .brand('Telephone'),
)

export type Telephone = Model.TypeOf<typeof Telephone>

export const telephoneEnregistrable = (
  saisi: string | null | undefined,
): Telephone | null =>
  saisi === null || saisi === undefined || saisi.trim() === ''
    ? null
    : Telephone.safe(saisi)
