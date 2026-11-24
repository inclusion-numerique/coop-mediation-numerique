import { z } from 'zod'
import {
  decodeSerializableState,
  type EncodedState,
  encodeSerializableState,
} from '@/libraries/etat-encode/encode-serializable-state'
import { defineModel, type Model } from '@/libraries/model'
import { ReferenceInvitation } from './reference-invitation'

const PREFIXE = '/invitations/'

export const LienInvitation = defineModel(
  z.string().startsWith(PREFIXE).brand('LienInvitation'),
)

export type LienInvitation = Model.TypeOf<typeof LienInvitation>

export const codeInvitation = ({
  email,
  coordinateurId,
}: ReferenceInvitation): EncodedState<unknown> =>
  encodeSerializableState<unknown>({ email, coordinateurId })

export const lienInvitation = (
  reference: ReferenceInvitation,
): LienInvitation => LienInvitation(`${PREFIXE}${codeInvitation(reference)}`)

export const referenceDuCode = (
  code: EncodedState<unknown>,
): ReferenceInvitation | null => {
  const lue = ReferenceInvitation.schema.safeParse(
    decodeSerializableState<unknown>(code, null),
  )
  return lue.success ? lue.data : null
}
