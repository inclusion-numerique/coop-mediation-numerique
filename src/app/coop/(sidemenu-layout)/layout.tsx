import React from 'react'
import CreateCraModal from '@/features/activites/ui/saisie/CreateCraModal/CreateCraModal'
import { CreateCraModalDefinition } from '@/features/activites/ui/saisie/CreateCraModal/CreateCraModalDefinition'
import { getHomepage } from '@/features/authentification/domain/getHomepage'
import { authenticateUser } from '@/features/authentification/implementations/session/authenticateUser'
import Header from '@/features/navigation/ui/en-tete/Header'
import CoopSideMenu from '@/features/navigation/ui/menus/CoopSideMenu'
import MinimalFooter from '@/features/navigation/ui/pied-de-page/MinimalFooter'
import { statistiquesPageTitle } from '@/features/statistiques/ui/pages/titre-des-statistiques'
import TerminerUsurpationHeaderUserMenuItem from '@/features/utilisateurs/abilities/terminer-l-usurpation/ui/TerminerUsurpationHeaderUserMenuItem'

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
