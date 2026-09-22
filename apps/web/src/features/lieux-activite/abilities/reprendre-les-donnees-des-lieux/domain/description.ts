import { DETAIL_LONGUEUR_MAXIMALE } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { nonVide } from './lieu-a-reprendre'

export const descriptionAvecLaNote = (
  description: string | null,
  note: string,
): string | null => {
  const existante = nonVide(description)

  if (existante == null)
    return note.length <= DETAIL_LONGUEUR_MAXIMALE ? note : null

  if (existante.includes(note)) return existante

  const augmentee = `${existante}\n\n${note}`

  return augmentee.length <= DETAIL_LONGUEUR_MAXIMALE ? augmentee : null
}
