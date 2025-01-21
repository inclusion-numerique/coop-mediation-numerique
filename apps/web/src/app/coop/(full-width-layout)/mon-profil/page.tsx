import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import React from 'react'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { contentId, defaultSkipLinks } from '@app/web/utils/skipLinks'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import { getUserRoleLabel } from '@app/web/utils/getUserRoleLabel'
import FonctionnalitesDeMediationNumeriqueCoordinateur from '@app/web/app/coop/(full-width-layout)/mon-profil/_components/FonctionnalitesDeMediationNumeriqueCoordinateur'
import Contract from '@app/web/components/conseiller-numerique/Contract'
import { getContractInfo } from '@app/web/conseiller-numerique/getContractInfo'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import { hasFeatureFlag } from '@app/web/security/hasFeatureFlag'
import RdvServicePublicAccountStatusCard from '@app/web/app/coop/(full-width-layout)/mon-profil/RdvServicePublicAccountStatusCard'
import ProfileEditCard from './_components/ProfileEditCard'

export const metadata: Metadata = {
  title: metadataTitle('Mon profil'),
}

const MonProfilPage = async () => {
  const user = await authenticateUser()

  if (!user) {
    return redirect('/')
  }

  const contratCoordinateur = user.coordinateur
    ? await getContractInfo(user.email)
    : null

  const hasRdvFeature = hasFeatureFlag(user, 'RdvServicePublic')

  return (
    <>
      <SkipLinksPortal links={defaultSkipLinks} />
      <div className="fr-container fr-container--800 fr-pb-16w">
        <CoopBreadcrumbs currentPage="Mon profil" />
        <main id={contentId}>
          <div className="fr-flex fr-flex-wrap fr-direction-row fr-align-items-center fr-flex-gap-4v fr-my-12v">
            <span
              className="ri-account-circle-fill ri-lg fr-line-height-1 fr-text-label--blue-france fr-background-alt--blue-france fr-p-2w fr-m-0 fr-border-radius--8"
              aria-hidden
            />
            <h1 className="fr-page-title fr-m-0">Mon profil</h1>
          </div>
          <section className="fr-mb-2w">
            <ProfileEditCard
              name={user.name}
              email={user.email}
              phone={user.phone}
              userRole={getUserRoleLabel(user)}
            />
          </section>
          {user.coordinateur ? (
            <>
              {!!contratCoordinateur && (
                <section className="fr-mb-2w">
                  <Contract isCoordinateur {...contratCoordinateur} />
                </section>
              )}
              <section>
                <FonctionnalitesDeMediationNumeriqueCoordinateur
                  isActive={user.mediateur?.id != null}
                />
              </section>
            </>
          ) : null}
        </main>
        {hasRdvFeature && (
          <RdvServicePublicAccountStatusCard
            user={user}
            oAuthFlowRedirectTo="/coop/mon-profil"
          />
        )}
      </div>
    </>
  )
}

export default MonProfilPage
