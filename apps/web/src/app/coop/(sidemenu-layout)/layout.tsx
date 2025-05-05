import styles from '@app/web/app/coop/CoopLayout.module.css'
import CoopSideMenu from '@app/web/app/coop/CoopSideMenu'
import MinimalFooter from '@app/web/app/coop/MinimalFooter'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import Header from '@app/web/components/Header'
import CreateCraModal from '@app/web/features/activites/use-cases/cra/components/CreateCraModal/CreateCraModal'
import classNames from 'classnames'
import React from 'react'

const CoopSidemenuLayout = async ({
  children,
}: {
  children: React.ReactNode
}) => {
  const user = await authenticateUser()
  return (
    <div className="fr-layout__inner">
      <Header user={user} fullWidth variant="coop" />

      <div
        className={classNames(
          'fr-grid-row fr-width-full fr-layout__main',
          styles.container,
        )}
      >
        <div className={styles.sideNavContainer}>
          <CoopSideMenu user={user} />
        </div>
        <div className={styles.pageContainer}>{children}</div>
      </div>
      <CreateCraModal />
      <MinimalFooter />
    </div>
  )
}

export default CoopSidemenuLayout
