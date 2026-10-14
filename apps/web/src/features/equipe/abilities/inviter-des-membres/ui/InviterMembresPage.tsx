import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import BackButton from '@app/web/components/BackButton'
import Card from '@app/web/components/Card'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { contentId } from '@app/web/utils/skipLinks'
import InviterMembreForm from './InviterMembreForm'

const CarteDInvitation = () => (
  <Card
    noBorder
    titleAs="div"
    className="fr-border fr-border-radius--8 fr-background-default--grey fr-p-4v"
    title={
      <span className="fr-flex fr-align-items-center fr-flex-gap-6v">
        <span
          className="ri-user-add-line ri-md fr-line-height-1 fr-text-label--blue-france fr-background-alt--blue-france fr-p-2w fr-m-0 fr-border-radius--8 fr-text--regular"
          aria-hidden
        />
        <h1 className="fr-h3 fr-text-title--blue-france fr-mb-0">
          Inviter des membres
        </h1>
      </span>
    }
  >
    <span className="fr-text-mention--grey">
      Invitez des médiateurs et médiatrices numériques que vous souhaitez
      coordonner (avec un profil déjà créé ou non). Ils recevront une invitation
      par mail et devront accepter votre demande avant de rejoindre votre
      équipe.
    </span>
    <InviterMembreForm />
  </Card>
)

export const InviterMembresPage = () => (
  <div
    className="fr-flex fr-direction-column fr-background-alt--blue-ecume"
    style={{ minHeight: '100%' }}
  >
    <SkipLinksPortal />
    <div className="fr-container fr-container--narrow">
      <CoopBreadcrumbs
        parents={[
          {
            label: 'Mon équipe',
            linkProps: { href: '/coop/mon-equipe/' },
          },
        ]}
        currentPage="Inviter des membres"
      />
      <BackButton />
      <main id={contentId} className="fr-mb-16w">
        <CarteDInvitation />
      </main>
    </div>
  </div>
)
