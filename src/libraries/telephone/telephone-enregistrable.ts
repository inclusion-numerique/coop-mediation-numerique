import { telephoneCanonique } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

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
