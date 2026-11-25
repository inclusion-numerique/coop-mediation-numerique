import { z } from 'zod'
import { SaisieDuTag } from '../../../domain'

const VisibiliteValidation = z.discriminatedUnion('_tag', [
  z.object({ _tag: z.literal('Personnel') }),
  z.object({ _tag: z.literal('Equipe'), coordinateurId: z.guid() }),
  z.object({ _tag: z.literal('Departemental') }),
])

export const CreerUnTagValidation = SaisieDuTag.extend({
  visibilite: VisibiliteValidation,
})

export type Visibilite = z.output<typeof VisibiliteValidation>

export type ValeursDeCreationDeTag = z.input<typeof CreerUnTagValidation>
