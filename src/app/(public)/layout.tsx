import { PropsWithChildren } from 'react'
import { pageDAccueil } from '@/features/authentification/domain/page-d-accueil'
import { getSessionUser } from '@/features/authentification/implementations/session/session-user.query'
import PublicFooter from '@/features/navigation/ui/components/PublicFooter'
import { PubliqueLayout } from '@/features/navigation/ui/layouts/PubliqueLayout'
import Header from '@/features/navigation/ui/slots/Header.slot'
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
