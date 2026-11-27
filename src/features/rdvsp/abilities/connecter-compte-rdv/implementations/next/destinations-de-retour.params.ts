import { z } from 'zod'
import {
  decodeSerializableState,
  type EncodedState,
} from '@/libraries/etat-encode'
import type { DestinationsDeRetour } from '../../domain/retour-connexion'

const etatEncode = z.custom<EncodedState<unknown>>(
  (valeur) => typeof valeur === 'string',
)

const destinations = z.object({
  redirectToSuccess: z.string().optional(),
  redirectToError: z.string().optional(),
})

const aucuneDestination: DestinationsDeRetour = {}

export const destinationsDeRetour = (state: string): DestinationsDeRetour => {
  const etat = etatEncode.safeParse(state)

  if (!etat.success) return aucuneDestination

  const lues = destinations.safeParse(
    decodeSerializableState<unknown>(etat.data, null),
  )

  return lues.success ? lues.data : aucuneDestination
}
