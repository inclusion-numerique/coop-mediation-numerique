import { PropsWithChildren } from 'react'
import { getSessionUser } from '@/features/authentification/implementation/session/getSessionUser'
import Header from '@/features/navigation/ui/en-tete/Header'
import PublicFooter from '@/features/navigation/ui/pied-de-page/PublicFooter'

const PublicLayout = async ({ children }: PropsWithChildren) => {
  const user = await getSessionUser()
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
    >
      <div id="skip-links" />
      <Header user={user} variant="public" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
      <PublicFooter />
    </div>
  )
}

export default PublicLayout
