import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const Notes = defineModel(z.string().trim().min(1).brand('Notes'))

export type Notes = Model.TypeOf<typeof Notes>

const TEXTE_RICHE_VIDE = /^\s*(<p>\s*(<br\s*\/?>)?\s*<\/p>\s*)*$/

export const notesDe = (texte: string | null | undefined): Notes | null =>
  texte == null || TEXTE_RICHE_VIDE.test(texte) ? null : Notes(texte)
