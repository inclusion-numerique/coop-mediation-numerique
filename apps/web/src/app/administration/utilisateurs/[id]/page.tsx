import { relancerUneInvitationAction } from '@app/web/app/_actions/equipe/relancer-une-invitation.action'
import { retirerUnMembreAction } from '@app/web/app/_actions/equipe/retirer-un-membre.action'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { RELANCER_UNE_INVITATION_ACTION_KEY } from '@app/web/features/equipe/abilities/relancer-une-invitation/action/relancer-une-invitation.key'
import { RETIRER_UN_MEMBRE_ACTION_KEY } from '@app/web/features/equipe/abilities/retirer-un-membre/action/retirer-un-membre.key'
import { statutCompte } from '@app/web/features/utilisateurs/use-cases/list/statut-compte'
import { ClientBinder } from '@app/web/libs/injection/client-binder'
import { notFound } from 'next/navigation'
import AdministrationUserPage from './AdministrationUserPage'
import { getAdministrationUserPageData } from './getAdministrationUserPageData'

export const metadata = {
  title: metadataTitle('Utilisateurs - Détails'),
}
export const dynamic = 'force-dynamic'
export const revalidate = 0

const Page = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params

  const { id } = params

  const data = await getAdministrationUserPageData({ id })
  if (!data) {
    notFound()
  }

  return (
    <ClientBinder
      bind={RELANCER_UNE_INVITATION_ACTION_KEY}
      to={relancerUneInvitationAction}
    >
      <ClientBinder
        bind={RETIRER_UN_MEMBRE_ACTION_KEY}
        to={retirerUnMembreAction}
      >
        <AdministrationUserPage
          data={{
            ...data,
            user: {
              ...data.user,
              statutCompte: statutCompte(new Date())(data.user),
            },
          }}
        />
      </ClientBinder>
    </ClientBinder>
  )
}

export default Page
