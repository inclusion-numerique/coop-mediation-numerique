import { PropsWithChildren } from 'react'
import PublicFooter from '@/app/(public)/PublicFooter'
import { getSessionUser } from '@/auth/getSessionUser'
import Header from '@/components/Header'

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
