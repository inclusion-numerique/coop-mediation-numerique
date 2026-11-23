import { PropsWithChildren } from 'react'
import { getHomepage } from '@/features/authentification/domain/page-d-accueil'
import { getSessionUser } from '@/features/authentification/implementations/session/session-user'
import PublicFooter from '@/features/navigation/ui/components/pied-de-page/PublicFooter'
import Header from '@/features/navigation/ui/layouts/Header'
import { MiseEnPagePublique } from '@/features/navigation/ui/layouts/MiseEnPagePublique'
import TerminerUsurpationHeaderUserMenuItem from '@/features/utilisateurs/abilities/terminer-l-usurpation/ui/slots/TerminerUsurpationHeaderUserMenuItem.slot'

const PublicLayout = async ({ children }: PropsWithChildren) => {
  const user = await getSessionUser()
  return (
    <MiseEnPagePublique
      entete={
        <Header
          user={user}
          accueil={getHomepage(user)}
          terminerUsurpation={<TerminerUsurpationHeaderUserMenuItem />}
          variant="public"
        />
      }
      piedDePage={<PublicFooter />}
    >
      {children}
    </MiseEnPagePublique>
  )
}

export default PublicLayout
