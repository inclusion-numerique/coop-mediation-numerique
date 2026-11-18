import Link from 'next/link'
import { redirect } from 'next/navigation'
import { PropsWithChildren } from 'react'
import { hasInscriptionComplete } from '@/features/authentification/domain/getHomepage'
import { authenticateUser } from '@/features/authentification/implementation/session/authenticateUser'
import InscriptionStepsLayout from '@/features/inscription/components/InscriptionStepsLayout'
import { consulterLaMaintenance } from '@/features/maintenance-mode/abilities/consulter-la-maintenance'
import { BanniereDeMaintenance } from '@/features/maintenance-mode/abilities/consulter-la-maintenance/ui'
import { messageAffiche } from '@/features/maintenance-mode/domain'
import { lireLaRuptureEnAttente } from '@/features/mediateurs/abilities/choisir-la-visibilite-apres-rupture'
import { ChoixDeVisibiliteApresRupture } from '@/features/mediateurs/abilities/choisir-la-visibilite-apres-rupture/ui'
import { MediateurId } from '@/features/mediateurs/domain'
import Header from '@/features/navigation/ui/en-tete/Header'
import PublicFooter from '@/features/navigation/ui/pied-de-page/PublicFooter'

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

  if (!hasInscriptionComplete(user)) {
    redirect('/inscription')
  }

  const ruptureEnAttente =
    user.mediateur == null
      ? null
      : await lireLaRuptureEnAttente({
          mediateurId: MediateurId(user.mediateur.id),
        })

  if (ruptureEnAttente != null) {
    return (
      <div className="fr-layout">
        <div id="skip-links" />
        <Header user={user} fullWidth variant="coop" />
        <InscriptionStepsLayout>
          <ChoixDeVisibiliteApresRupture />
        </InscriptionStepsLayout>
        <PublicFooter />
      </div>
    )
  }

  const maintenance = await consulterLaMaintenance()

  return (
    <div className="fr-layout">
      <div id="skip-links" />
      {maintenance._tag === 'Active' && (
        <BanniereDeMaintenance message={messageAffiche(maintenance)} />
      )}
      {children}
    </div>
  )
}

export default Layout
