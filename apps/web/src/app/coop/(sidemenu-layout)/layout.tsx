import CoopSideMenu from '@app/web/app/coop/CoopSideMenu'
import MinimalFooter from '@app/web/app/coop/MinimalFooter'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import Header from '@app/web/components/Header'
import CreateCraModal from '@app/web/features/activites/use-cases/cra/components/CreateCraModal/CreateCraModal'
import React from 'react'

const CoopSidemenuLayout = async ({
  children,
}: {
  children: React.ReactNode
}) => {
  const user = await authenticateUser()
  return (
    <>
      <Header user={user} fullWidth variant="coop" />
      <div className="fr-flex fr-direction-column fr-direction-md-row">
        <div className="sideMenu">
          <CoopSideMenu user={user} />
        </div>
        <div className="fr-p-8v fr-pb-24v fr-width-full fr-flex-grow-1 fr-overflow-scroll">
          {children}
        </div>
      </div>
      <CreateCraModal />
      <MinimalFooter />
    </>
  )
}

export default CoopSidemenuLayout
