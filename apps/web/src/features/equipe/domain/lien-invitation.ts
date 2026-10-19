import { defineModel, type Model } from '@app/web/libraries/model'
import {
  decodeSerializableState,
  type EncodedState,
  encodeSerializableState,
} from '@app/web/utils/encodeSerializableState'
import { z } from 'zod'
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
