import { z } from 'zod'
import {
  ActiviteId,
  type CriteresDExposition,
  type CurseurDActivite,
  Horodatage,
} from '../../domain'

const horodatageDepuis = (depuis: string | undefined): Horodatage | null =>
  depuis === undefined ? null : Horodatage(new Date(depuis))

export const criteresDExposition = ({
  creation,
  modification,
}: {
  readonly creation: { readonly depuis?: string }
  readonly modification: { readonly depuis?: string }
}): CriteresDExposition => ({
  creeesDepuis: horodatageDepuis(creation.depuis),
  modifieesDepuis: horodatageDepuis(modification.depuis),
})

const CurseurValidation = z.object({
  modification_id: z.object({
    modification: z.coerce.string().pipe(z.iso.datetime()),
    id: z.guid(),
  }),
})

export const curseurDActivite = ([
  modification,
  id,
]: readonly string[]): CurseurDActivite => {
  const { modification_id } = CurseurValidation.parse({
    modification_id: { modification, id },
  })

  return {
    modification: Horodatage(new Date(modification_id.modification)),
    id: ActiviteId(modification_id.id),
  }
}
