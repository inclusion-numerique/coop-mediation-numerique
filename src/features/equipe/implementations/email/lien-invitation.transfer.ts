import {
  decodeSerializableState,
  type EncodedState,
  encodeSerializableState,
} from '@/libraries/etat-encode'
import {
  LienInvitation,
  PREFIXE_DU_LIEN_D_INVITATION,
  ReferenceInvitation,
} from '../../domain'

export const codeInvitation = ({
  email,
  coordinateurId,
}: ReferenceInvitation): EncodedState<unknown> =>
  encodeSerializableState<unknown>({ email, coordinateurId })

export const lienInvitation = (
  reference: ReferenceInvitation,
): LienInvitation =>
  LienInvitation(`${PREFIXE_DU_LIEN_D_INVITATION}${codeInvitation(reference)}`)

export const referenceDuCode = (
  code: EncodedState<unknown>,
): ReferenceInvitation | null => {
  const lue = ReferenceInvitation.schema.safeParse(
    decodeSerializableState<unknown>(code, null),
  )
  return lue.success ? lue.data : null
}
