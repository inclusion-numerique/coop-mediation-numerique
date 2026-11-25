import React from 'react'
import { ID_DE_LA_MODALE_DE_SAISIE } from '@/features/activites/ui/presenters/modale-de-saisie.presenter'
import CreateCraModal from '@/features/activites/ui/slots/CreateCraModal.slot'
import { pageDAccueil } from '@/features/authentification/domain/page-d-accueil'
import { authenticateUser } from '@/features/authentification/middlewares/with-utilisateur-authentifie'
import { CoopAvecMenuLayout } from '@/features/navigation/ui/layouts/CoopAvecMenuLayout'
import CoopSideMenu from '@/features/navigation/ui/slots/CoopSideMenu.slot'
import Header from '@/features/navigation/ui/slots/Header.slot'
import MinimalFooter from '@/features/navigation/ui/slots/MinimalFooter.slot'
import { titreDesStatistiques } from '@/features/statistiques/ui/presenters/titre-des-statistiques.presenter'
import TerminerUsurpationHeaderUserMenuItem from '@/features/utilisateurs/abilities/terminer-l-usurpation/ui/slots/TerminerUsurpationHeaderUserMenuItem.slot'

const CoopSidemenuLayout = async ({
  children,
}: {
  children: React.ReactNode
}) => {
  const user = await authenticateUser()
  return (
    <CoopAvecMenuLayout
      entete={
        <Header
          user={user}
          accueil={pageDAccueil(user)}
          terminerUsurpation={<TerminerUsurpationHeaderUserMenuItem />}
          fullWidth
          variant="coop"
        />
      }
      menu={
        <CoopSideMenu
          user={user}
          titreDesStatistiques={titreDesStatistiques(user)}
          saisieDUneActivite={ID_DE_LA_MODALE_DE_SAISIE}
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
    </CoopAvecMenuLayout>
  )
}

export default CoopSidemenuLayout
