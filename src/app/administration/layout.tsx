import { PropsWithChildren } from 'react'
import { getHomepage } from '@/features/authentification/domain/page-d-accueil'
import { authenticateAdmin } from '@/features/authentification/implementations/session/authenticate-user'
import Header from '@/features/navigation/ui/layouts/Header'
import { MiseEnPageAdministration } from '@/features/navigation/ui/layouts/MiseEnPageAdministration'
import AdministrationSideMenu from '@/features/navigation/ui/slots/AdministrationSideMenu.slot'
import MinimalFooter from '@/features/navigation/ui/slots/MinimalFooter.slot'
import TerminerUsurpationHeaderUserMenuItem from '@/features/utilisateurs/abilities/terminer-l-usurpation/ui/slots/TerminerUsurpationHeaderUserMenuItem.slot'

const AdministrationLayout = async ({ children }: PropsWithChildren) => {
  const user = await authenticateAdmin()
  return (
    <MiseEnPageAdministration
      entete={
        <Header
          user={user}
          accueil={getHomepage(user)}
          terminerUsurpation={<TerminerUsurpationHeaderUserMenuItem />}
          variant="coop"
        />
      }
      menu={<AdministrationSideMenu />}
      piedDePage={<MinimalFooter />}
    >
      {children}
    </MiseEnPageAdministration>
  )
}

export default AdministrationLayout
