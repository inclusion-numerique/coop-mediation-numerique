import type { NomAffiche } from '@app/web/libraries/nom-affiche'
import { ActeurId } from '../../../domain'
import { lireLActeur } from './prisma'

export const nomDeLActeur = async (
  acteurId: string,
): Promise<NomAffiche | null> => {
  const id = ActeurId.safe(acteurId)
  const lu = id === null ? null : await lireLActeur(id)
  return lu?.acteur.nomAffiche ?? null
}
