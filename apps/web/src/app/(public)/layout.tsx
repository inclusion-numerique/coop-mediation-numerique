import PublicFooter from '@app/web/app/(public)/PublicFooter'
import { getServerDsfrTheme } from '@app/web/app/getServerDsfrTheme'
import { getSessionUser } from '@app/web/auth/getSessionUser'
import Header from '@app/web/components/Header'
import { PropsWithChildren } from 'react'

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
      <PublicFooter initialTheme={await getServerDsfrTheme()} />
    </div>
  )
}

export default PublicLayout
