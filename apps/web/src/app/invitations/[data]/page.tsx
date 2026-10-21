import { accepterUneInvitationAction } from '@app/web/app/_actions/equipe/accepter-une-invitation.action'
import { refuserUneInvitationAction } from '@app/web/app/_actions/equipe/refuser-une-invitation.action'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { getSessionUser } from '@app/web/auth/getSessionUser'
import { ACCEPTER_UNE_INVITATION_ACTION_KEY } from '@app/web/features/equipe/abilities/accepter-une-invitation/action/accepter-une-invitation.key'
import { consulterUneInvitation } from '@app/web/features/equipe/abilities/consulter-une-invitation'
import {
  InvitationEnAttente,
  InvitationPlusValide,
} from '@app/web/features/equipe/abilities/consulter-une-invitation/ui'
import { REFUSER_UNE_INVITATION_ACTION_KEY } from '@app/web/features/equipe/abilities/refuser-une-invitation/action/refuser-une-invitation.key'
import { Email, lienInvitation } from '@app/web/features/equipe/domain'
import { ReponseAInvitation } from '@app/web/features/equipe/ui'
import { ClientBinder } from '@app/web/libs/injection/client-binder'
import type { EncodedState } from '@app/web/utils/encodeSerializableState'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

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
    session: user == null ? null : Email.safe(user.email),
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
        <InvitationEnAttente
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
