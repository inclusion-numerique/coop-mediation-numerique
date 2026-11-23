import React from 'react'
import { CreateCraModalDefinition } from '@/features/activites/ui/presenters/saisie/modale-de-saisie'
import CreateCraModal from '@/features/activites/ui/slots/CreateCraModal.slot'
import { getHomepage } from '@/features/authentification/domain/page-d-accueil'
import { authenticateUser } from '@/features/authentification/implementations/session/authenticate-user'
import Header from '@/features/navigation/ui/layouts/Header'
import CoopSideMenu from '@/features/navigation/ui/slots/CoopSideMenu.slot'
import MinimalFooter from '@/features/navigation/ui/slots/MinimalFooter.slot'
import { statistiquesPageTitle } from '@/features/statistiques/ui/presenters/titre-des-statistiques'
import TerminerUsurpationHeaderUserMenuItem from '@/features/utilisateurs/abilities/terminer-l-usurpation/ui/slots/TerminerUsurpationHeaderUserMenuItem.slot'

const CoopSidemenuLayout = async ({
  children,
}: {
  children: React.ReactNode
}) => {
  const user = await authenticateUser()
  return (
    <>
      <Header
        user={user}
        accueil={getHomepage(user)}
        terminerUsurpation={<TerminerUsurpationHeaderUserMenuItem />}
        fullWidth
        variant="coop"
      />
      <div className="fr-flex fr-direction-column fr-direction-md-row">
        <div className="sideMenu">
          <CoopSideMenu
            user={user}
            titreDesStatistiques={statistiquesPageTitle(user)}
            saisieDUneActivite={CreateCraModalDefinition.id}
          />
        </div>
        <div className="fr-px-20v fr-pb-24v fr-width-full fr-flex-grow-1 fr-overflow-scroll">
          {children}
        </div>
      </div>
      <CreateCraModal
        isMediateur={user.mediateur?.id != null}
        isCoordinateur={user.coordinateur?.id != null}
      />
      <MinimalFooter />
    </>
  )
}

export default CoopSidemenuLayout
