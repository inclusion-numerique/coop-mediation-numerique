import type {
  CoordinateurDeLEquipe,
  Email,
  Invitation,
  ReferenceInvitation,
} from '../../../domain'

export type VueInvitation =
  | { readonly type: 'Illisible' }
  | { readonly type: 'MauvaisDestinataire' }
  | { readonly type: 'DejaTraitee' }
  | {
      readonly type: 'EnAttente'
      readonly reference: ReferenceInvitation
      readonly coordinateur: CoordinateurDeLEquipe
      readonly tailleEquipe: number
      readonly connecte: boolean
    }

export const vueInvitation = ({
  invitation,
  session,
  coordinateur,
  tailleEquipe,
}: {
  invitation: Invitation | null
  session: Email | null
  coordinateur: CoordinateurDeLEquipe | null
  tailleEquipe: number
}): VueInvitation => {
  if (invitation === null || coordinateur === null)
    return { type: 'DejaTraitee' }
  if (session !== null && session !== invitation.reference.email)
    return { type: 'MauvaisDestinataire' }
  if (invitation.statut !== 'EnAttente') return { type: 'DejaTraitee' }

  return {
    type: 'EnAttente',
    reference: invitation.reference,
    coordinateur,
    tailleEquipe,
    connecte: session !== null,
  }
}
