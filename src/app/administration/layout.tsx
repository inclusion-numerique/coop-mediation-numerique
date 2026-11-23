import { PropsWithChildren } from 'react'
import { getHomepage } from '@/features/authentification/domain/page-d-accueil'
import { authenticateAdmin } from '@/features/authentification/implementations/session/authenticate-user'
import Header from '@/features/navigation/ui/layouts/Header'
import AdministrationSideMenu from '@/features/navigation/ui/slots/AdministrationSideMenu.slot'
import MinimalFooter from '@/features/navigation/ui/slots/MinimalFooter.slot'
import TerminerUsurpationHeaderUserMenuItem from '@/features/utilisateurs/abilities/terminer-l-usurpation/ui/slots/TerminerUsurpationHeaderUserMenuItem.slot'

const AdministrationLayout = async ({ children }: PropsWithChildren) => {
  const user = await authenticateAdmin()
  return (
    <>
      <div id="skip-links" />
      <Header
        user={user}
        accueil={getHomepage(user)}
        terminerUsurpation={<TerminerUsurpationHeaderUserMenuItem />}
        variant="coop"
      />
      <div className="fr-flex fr-direction-column fr-direction-md-row">
        <div className="sideMenu">
          <AdministrationSideMenu />
        </div>
        <div className="fr-p-8v fr-pb-24v fr-width-full fr-flex-grow-1 fr-overflow-scroll">
          {children}
        </div>
      </div>
      <MinimalFooter />
    </>
  )
}

export default AdministrationLayout
