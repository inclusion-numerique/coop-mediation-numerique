import { PropsWithChildren } from 'react'
import { getHomepage } from '@/features/authentification/domain/page-d-accueil'
import { getSessionUser } from '@/features/authentification/implementations/session/session-user'
import Header from '@/features/navigation/ui/en-tete/Header'
import PublicFooter from '@/features/navigation/ui/pied-de-page/PublicFooter'
import TerminerUsurpationHeaderUserMenuItem from '@/features/utilisateurs/abilities/terminer-l-usurpation/ui/TerminerUsurpationHeaderUserMenuItem'

const PublicLayout = async ({ children }: PropsWithChildren) => {
  const user = await getSessionUser()
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
    >
      <div id="skip-links" />
      <Header
        user={user}
        accueil={getHomepage(user)}
        terminerUsurpation={<TerminerUsurpationHeaderUserMenuItem />}
        variant="public"
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
      <PublicFooter />
    </div>
  )
}

export default PublicLayout
