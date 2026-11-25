import type { NomAffiche } from '@/libraries/nom-affiche'
import { ActeurId } from '../../../../domain'
import { lireLActeur } from '.'

export const nomDeLActeur = async (
  acteurId: string,
): Promise<NomAffiche | null> => {
  const id = ActeurId.safe(acteurId)
  const lu = id === null ? null : await lireLActeur(id)
  return lu?.acteur.nomAffiche ?? null
}
