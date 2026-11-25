import { PropsWithChildren } from 'react'
import { pageDAccueil } from '@/features/authentification/domain/page-d-accueil'
import { authenticateAdmin } from '@/features/authentification/middlewares/with-utilisateur-authentifie'
import { AdministrationLayout } from '@/features/navigation/ui/layouts/AdministrationLayout'
import AdministrationSideMenu from '@/features/navigation/ui/slots/AdministrationSideMenu.slot'
import Header from '@/features/navigation/ui/slots/Header.slot'
import MinimalFooter from '@/features/navigation/ui/slots/MinimalFooter.slot'
import TerminerUsurpationHeaderUserMenuItem from '@/features/utilisateurs/abilities/terminer-l-usurpation/ui/slots/TerminerUsurpationHeaderUserMenuItem.slot'

const Layout = async ({ children }: PropsWithChildren) => {
  const user = await authenticateAdmin()
  return (
    <AdministrationLayout
      entete={
        <Header
          user={user}
          accueil={pageDAccueil(user)}
          terminerUsurpation={<TerminerUsurpationHeaderUserMenuItem />}
          variant="coop"
        />
      }
      menu={<AdministrationSideMenu />}
      piedDePage={<MinimalFooter />}
    >
      {children}
    </AdministrationLayout>
  )
}

export default Layout
