import PublicFooter from '@app/web/app/(public)/PublicFooter'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import Header from '@app/web/components/Header'
import InscriptionStepsLayout from '@app/web/features/inscription/components/InscriptionStepsLayout'
import { MaintenanceModeBanner } from '@app/web/features/maintenance-mode/components/MaintenanceModeBanner'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import React, { PropsWithChildren } from 'react'

const Layout = async ({ children }: PropsWithChildren) => {
  const user = await authenticateUser()

  // Admin users are not allowed to access this page
  if (user.role === 'Admin' || user.role === 'Support') {
    // Admins and support cannot access the coop features
    return (
      <div className="fr-layout">
        <div id="skip-links" />
        <Header user={user} fullWidth variant="coop" />
        <InscriptionStepsLayout>
          <div className="fr-mb-32v fr-p-12v fr-width-full fr-border-radius--8 fr-background-default--grey fr-mt-32v">
            <h2>
              Vous êtes connecté en tant{' '}
              {user.role === 'Admin'
                ? 'qu’administrateur'
                : 'que membre de l’équipe de support'}
            </h2>
            <p className="fr-text--xl">
              Vous n’avez pas accès au fonctionnalités de la coop 😬
            </p>
            <Link className="fr-link" href="/administration/usurpation">
              Accéder à l’usurpation pour accéder aux fonctionnalités de la coop
              en tant qu’utilisateur de test
              <span
                className="fr-icon-arrow-right-line fr-icon-arrow-right-line fr-icon--sm fr-ml-1w"
                aria-hidden
              />
            </Link>
          </div>
        </InscriptionStepsLayout>
        <PublicFooter />
      </div>
    )
  }

  if (!user.inscriptionValidee) {
    redirect('/inscription')
  }

  return (
    <div className="fr-layout">
      <div id="skip-links" />
      <MaintenanceModeBanner />
      {children}
    </div>
  )
}

export default Layout
