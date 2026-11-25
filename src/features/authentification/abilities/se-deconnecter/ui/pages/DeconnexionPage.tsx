import Button from '@codegouvfr/react-dsfr/Button'
import { AuthCard } from '@/features/authentification/ui/components/AuthCard'
import { contentId } from '@/libraries/liens-d-evitement'
import { SkipLinksPortal } from '@/libraries/liens-d-evitement/composants'
import SignoutButton from '../components/SignoutButton'

export const DeconnexionPage = () => (
  <>
    <SkipLinksPortal />
    <AuthCard id={contentId} className="fr-text--center">
      <div
        className="fr-background-alt--blue-france fr-border-radius--16 fr-text-title--blue-france fr-display-inline-block fr-p-6v"
        aria-hidden="true"
      >
        <span className="fr-icon-logout-box-r-line fr-icon--lg" />
      </div>
      <div className="fr-my-10v">
        <h2 className="fr-h3 fr-text-title--blue-france fr-mb-1v">
          Déconnexion
        </h2>
        <p className="fr-text--lg fr-mb-0">
          Êtes-vous sûr de vouloir vous déconnecter&nbsp;?
        </p>
      </div>
      <div className="fr-btns-group fr-btns-group--lg">
        <SignoutButton />
        <Button
          className="fr-mb-0"
          linkProps={{ href: '/' }}
          priority="secondary"
        >
          Annuler
        </Button>
      </div>
    </AuthCard>
  </>
)
