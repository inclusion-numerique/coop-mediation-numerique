import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

/**
 * Adresse d'un rendez-vous telle que RDV Service Public la transmet : une chaîne
 * libre, ni découpée ni géocodée. Aucun rapprochement commune/code INSEE n'est
 * tenté ici — c'est le rôle de la feature qui consomme la donnée.
 */
export const AdresseRdv = defineModel(
  z.string().trim().min(1).brand('AdresseRdv'),
)

export type AdresseRdv = Model.TypeOf<typeof AdresseRdv>
