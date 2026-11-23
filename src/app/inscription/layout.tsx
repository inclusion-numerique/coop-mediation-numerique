import Link from 'next/link'
import { redirect } from 'next/navigation'
import { PropsWithChildren } from 'react'
import {
  getHomepage,
  hasInscriptionComplete,
} from '@/features/authentification/domain/getHomepage'
import { authenticateUser } from '@/features/authentification/implementations/session/authenticateUser'
import InscriptionStepsLayout from '@/features/inscription/components/InscriptionStepsLayout'
import Header from '@/features/navigation/ui/en-tete/Header'
import MinimalFooter from '@/features/navigation/ui/pied-de-page/MinimalFooter'
import TerminerUsurpationHeaderUserMenuItem from '@/features/utilisateurs/abilities/terminer-l-usurpation/ui/TerminerUsurpationHeaderUserMenuItem'

const InscriptionLayout = async ({ children }: PropsWithChildren) => {
  const user = await authenticateUser()

  if (hasInscriptionComplete(user)) {
    redirect('/coop')
  }

  return (
    <div className="fr-layout">
      <div className="fr-layout__inner">
        <div id="skip-links" />
        <Header
          user={user}
          accueil={getHomepage(user)}
          terminerUsurpation={<TerminerUsurpationHeaderUserMenuItem />}
          variant="coop"
        />
        {user.role === 'Admin' || user.role === 'Support' ? (
          // Admins cannot access the inscription process
          <InscriptionStepsLayout>
            <div className="fr-mb-32v fr-p-12v fr-width-full fr-border-radius--8 fr-background-default--grey fr-mt-32v">
              <h2>Vous êtes connecté en tant qu’administrateur</h2>
              <p className="fr-text--xl">
                Les administrateurs n’ont pas accès au parcours d’inscription 😬
              </p>
              <Link className="fr-link" href="/administration/usurpation">
                Accéder à l’usurpation pour effectuer le parcours d’inscription
                en tant qu’utilisateur de test
                <span
                  className="fr-icon-arrow-right-line fr-icon-arrow-right-line fr-icon--sm fr-ml-1w"
                  aria-hidden
                />
              </Link>
            </div>
          </InscriptionStepsLayout>
        ) : (
          // Regular users can access the inscription process
          children
        )}
        <MinimalFooter />
      </div>
    </div>
  )
}

export default InscriptionLayout
