import {
  DETAIL_LONGUEUR_MAXIMALE,
  nettoyerPresentation,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import { nonVide } from './lieu-a-reprendre'

export const descriptionAvecLaNote = (
  description: string | null,
  noteBrute: string,
): string | null => {
  const existante = nonVide(description)
  const note = nettoyerPresentation(noteBrute)

  if (existante == null)
    return note.length <= DETAIL_LONGUEUR_MAXIMALE ? note : null

  if (existante.includes(note)) return existante

  const augmentee = `${existante}\n\n${note}`

  return augmentee.length <= DETAIL_LONGUEUR_MAXIMALE ? augmentee : null
}
