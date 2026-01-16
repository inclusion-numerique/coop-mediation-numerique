import FonctionnalitesDeMediationNumeriqueCoordinateur from '@app/web/app/coop/(full-width-layout)/mon-profil/_components/FonctionnalitesDeMediationNumeriqueCoordinateur'
import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import { SessionUser } from '@app/web/auth/sessionUser'
import Contract from '@app/web/components/conseiller-numerique/Contract'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { getContractInfo } from '@app/web/conseiller-numerique/getContractInfo'
import { findConseillerNumeriqueV1 } from '@app/web/external-apis/conseiller-numerique/searchConseillerNumeriqueV1'
import { contentId } from '@app/web/utils/skipLinks'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import React from 'react'
import ProfileDeleteCard from './_components/ProfileDeleteCard'
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

  const contratConum = !user.isConseillerNumerique
    ? null
    : await getContractInfo(user.email)

  return (
    <>
      <SkipLinksPortal />
      <div className="fr-container fr-container--800 fr-pb-16w">
        <CoopBreadcrumbs currentPage="Mon profil" />
        <main id={contentId}>
          <div className="fr-flex fr-flex-wrap fr-direction-row fr-align-items-center fr-flex-gap-4v fr-my-12v">
            <span
              className="ri-account-circle-line ri-lg fr-line-height-1 fr-text-label--blue-france fr-background-alt--blue-france fr-p-2w fr-m-0 fr-border-radius--8"
              aria-hidden
            />
            <h1 className="fr-page-title fr-m-0">Mon profil</h1>
          </div>
          <section className="fr-mb-4v">
            <ProfileEditCard
              name={user.name}
              email={user.email}
              phone={user.phone}
            />
          </section>
          {user.coordinateur ? (
            <>
              {!!contratCoordinateur && (
                <section className="fr-mb-4v">
                  <Contract isCoordinateur {...contratCoordinateur} />
                </section>
              )}
              <section className="fr-mb-4v">
                <FonctionnalitesDeMediationNumeriqueCoordinateur
                  isActive={user.mediateur?.id != null}
                />
              </section>
            </>
          ) : null}
          {!!contratConum && (
            <section className="fr-mb-4v">
              <Contract isCoordinateur={false} {...contratConum} />
            </section>
          )}
          {!user.isConseillerNumerique && (
            <section className="fr-mb-4v">
              <ProfileDeleteCard />
            </section>
          )}
        </main>
      </div>
    </>
  )
}

export default MonProfilPage
