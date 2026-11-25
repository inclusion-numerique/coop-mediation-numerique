import { PropsWithChildren } from 'react'
import { pageDAccueil } from '@/features/authentification/domain/page-d-accueil'
import { getSessionUser } from '@/features/authentification/middlewares/with-utilisateur-de-la-session'
import { PubliqueLayout } from '@/features/navigation/ui/layouts/PubliqueLayout'
import Header from '@/features/navigation/ui/slots/Header.slot'
import PublicFooter from '@/features/navigation/ui/slots/PublicFooter.slot'
import TerminerUsurpationHeaderUserMenuItem from '@/features/utilisateurs/abilities/terminer-l-usurpation/ui/slots/TerminerUsurpationHeaderUserMenuItem.slot'

const PublicLayout = async ({ children }: PropsWithChildren) => {
  const user = await getSessionUser()
  return (
    <PubliqueLayout
      entete={
        <Header
          user={user}
          accueil={pageDAccueil(user)}
          terminerUsurpation={<TerminerUsurpationHeaderUserMenuItem />}
          variant="public"
        />
      }
      piedDePage={<PublicFooter />}
    >
      {children}
    </PubliqueLayout>
  )
}

export default PublicLayout
