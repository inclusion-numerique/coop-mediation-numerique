import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'
import { assainirLeTexteRiche } from '@/libraries/texte-riche'

export const Notes = defineModel(z.string().trim().min(1).brand('Notes'))

export type Notes = Model.TypeOf<typeof Notes>

const LONGUEUR_MAXIMALE_DES_NOTES = 10_000

export const NotesSaisies = z
  .string()
  .max(
    LONGUEUR_MAXIMALE_DES_NOTES,
    `Les notes ne doivent pas dépasser ${LONGUEUR_MAXIMALE_DES_NOTES} caractères`,
  )
  .nullish()

const BALISES_SANS_CONTENU = /<\/?p>|<br\s*\/?>/g

const estUnTexteRicheVide = (texte: string): boolean =>
  texte.replace(BALISES_SANS_CONTENU, '').trim() === ''

const notesAssainies = (texte: string): Notes | null => {
  const assaini = assainirLeTexteRiche(texte)
  return estUnTexteRicheVide(assaini) ? null : Notes(assaini)
}

export const notesDe = (texte: string | null | undefined): Notes | null =>
  texte == null ? null : notesAssainies(texte)
