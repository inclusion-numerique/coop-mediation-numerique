import React from 'react'
import { CreateCraModalDefinition } from '@/features/activites/ui/presenters/saisie/modale-de-saisie'
import CreateCraModal from '@/features/activites/ui/slots/CreateCraModal.slot'
import { getHomepage } from '@/features/authentification/domain/page-d-accueil'
import { authenticateUser } from '@/features/authentification/implementations/session/authenticate-user'
import Header from '@/features/navigation/ui/layouts/Header'
import { MiseEnPageCoopAvecMenu } from '@/features/navigation/ui/layouts/MiseEnPageCoopAvecMenu'
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
    <MiseEnPageCoopAvecMenu
      entete={
        <Header
          user={user}
          accueil={getHomepage(user)}
          terminerUsurpation={<TerminerUsurpationHeaderUserMenuItem />}
          fullWidth
          variant="coop"
        />
      }
      menu={
        <CoopSideMenu
          user={user}
          titreDesStatistiques={statistiquesPageTitle(user)}
          saisieDUneActivite={CreateCraModalDefinition.id}
        />
      }
      modales={
        <CreateCraModal
          isMediateur={user.mediateur?.id != null}
          isCoordinateur={user.coordinateur?.id != null}
        />
      }
      piedDePage={<MinimalFooter />}
    >
      {children}
    </MiseEnPageCoopAvecMenu>
  )
}

export default CoopSidemenuLayout
