import { notFound } from 'next/navigation'
import { PropsWithChildren } from 'react'
import { getHomepage } from '@/features/authentification/domain/getHomepage'
import { getSessionUser } from '@/features/authentification/implementation/session/getSessionUser'
import Header from '@/features/navigation/ui/en-tete/Header'
import AdministrationSideMenu from '@/features/navigation/ui/menus/AdministrationSideMenu'
import MinimalFooter from '@/features/navigation/ui/pied-de-page/MinimalFooter'
import TerminerUsurpationHeaderUserMenuItem from '@/features/utilisateurs/abilities/terminer-l-usurpation/ui/TerminerUsurpationHeaderUserMenuItem'

const AdministrationLayout = async ({ children }: PropsWithChildren) => {
  const user = await getSessionUser()

  if (user?.role !== 'Admin') {
    notFound()
  }
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
