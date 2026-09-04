import AdministrationSideMenu from '@app/web/app/administration/AdministrationSideMenu'
import MinimalFooter from '@app/web/app/coop/MinimalFooter'
import { getSessionUser } from '@app/web/auth/getSessionUser'
import Header from '@app/web/components/Header'
import { notFound } from 'next/navigation'
import { PropsWithChildren } from 'react'

const AdministrationLayout = async ({ children }: PropsWithChildren) => {
  const user = await getSessionUser()

  if (user?.role !== 'Admin') {
    notFound()
  }
  return (
    <>
      <div id="skip-links" />
      <Header user={user} variant="coop" />
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
