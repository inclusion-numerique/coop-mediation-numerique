import MinimalFooter from '@app/web/app/coop/MinimalFooter'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import Header from '@app/web/components/Header'
import InscriptionStepsLayout from '@app/web/features/inscription/components/InscriptionStepsLayout'
import { hasInscriptionComplete } from '@app/web/security/getHomepage'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import React, { PropsWithChildren } from 'react'

const InscriptionLayout = async ({ children }: PropsWithChildren) => {
  const user = await authenticateUser()

  if (hasInscriptionComplete(user)) {
    redirect('/coop')
  }

  return (
    <div className="fr-layout">
      <div className="fr-layout__inner">
        <div id="skip-links" />
        <Header user={user} variant="coop" />
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
