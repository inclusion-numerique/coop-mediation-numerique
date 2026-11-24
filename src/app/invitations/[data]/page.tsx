import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { accepterUneInvitationAction } from '@/app/_actions/equipe/accepter-une-invitation.action'
import { refuserUneInvitationAction } from '@/app/_actions/equipe/refuser-une-invitation.action'
import { metadataTitle } from '@/configuration/projet/metadata-title'
import { getSessionUser } from '@/features/authentification/implementations/session/session-user.query'
import { consulterUneInvitation } from '@/features/equipe/abilities/consulter-une-invitation/implementations/prisma/consulter-une-invitation.query'
import { default as InvitationEnAttentePage } from '@/features/equipe/abilities/consulter-une-invitation/ui/pages/InvitationEnAttentePage'
import { default as InvitationPlusValide } from '@/features/equipe/abilities/consulter-une-invitation/ui/slots/InvitationPlusValide.slot'
import { ACCEPTER_UNE_INVITATION_ACTION_KEY } from '@/features/equipe/action/accepter-une-invitation.key'
import { REFUSER_UNE_INVITATION_ACTION_KEY } from '@/features/equipe/action/refuser-une-invitation.key'
import { Courriel, lienInvitation } from '@/features/equipe/domain'
import { default as ReponseAInvitation } from '@/features/equipe/ui/slots/ReponseAInvitation.slot'
import type { EncodedState } from '@/libraries/etat-encode/encode-serializable-state'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

export const metadata: Metadata = {
  title: metadataTitle('Invitation à rejoindre une équipe'),
}

const InvitationPage = async (props: {
  params: Promise<{ data: EncodedState<unknown> }>
}) => {
  const { data } = await props.params
  const user = await getSessionUser()

  const vue = await consulterUneInvitation({
    code: data,
    session: user == null ? null : Courriel.safe(user.email),
  })

  if (vue.type === 'Illisible') redirect('/')
  if (vue.type === 'MauvaisDestinataire') redirect('/coop/invitation')
  if (vue.type === 'DejaTraitee') return <InvitationPlusValide />

  return (
    <ClientBinder
      bind={ACCEPTER_UNE_INVITATION_ACTION_KEY}
      to={accepterUneInvitationAction}
    >
      <ClientBinder
        bind={REFUSER_UNE_INVITATION_ACTION_KEY}
        to={refuserUneInvitationAction}
      >
        <InvitationEnAttentePage
          coordinateur={vue.coordinateur}
          tailleEquipe={vue.tailleEquipe}
          reponse={
            <ReponseAInvitation
              email={vue.reference.email}
              coordinateurId={vue.reference.coordinateurId}
              lien={lienInvitation(vue.reference)}
              connecte={vue.connecte}
            />
          }
        />
      </ClientBinder>
    </ClientBinder>
  )
}

export default InvitationPage
