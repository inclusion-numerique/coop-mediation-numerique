'use client'

import LieuActiviteSideMenu from '@app/web/app/coop/(full-width-layout)/lieux-activite/_components/LieuActiviteSideMenu'
import IconInSquare from '@app/web/components/IconInSquare'
import Button from '@codegouvfr/react-dsfr/Button'
import React, { ReactNode, useState } from 'react'
import CreateLieuActiviteForm from './CreerLieuActiviteForm'

export const CreerLieuActivitePageContent = ({
  contentTop,
}: {
  contentTop?: ReactNode
}) => {
  const [showSideMenu, setShowSideMenu] = useState(false)

  return (
    <>
      <div style={{ minWidth: '19em' }}>
        {showSideMenu && (
          <LieuActiviteSideMenu className="fr-hidden fr-unhidden-lg fr-mt-16w" />
        )}
      </div>
      <div className="fr-container fr-container--narrow fr-ml-0 fr-mb-30v">
        {contentTop}
        <Button
          priority="tertiary no outline"
          size="small"
          linkProps={{
            href: '/coop/lieux-activite',
          }}
          className="fr-mt-2v fr-mb-10v"
          iconId="fr-icon-arrow-left-line"
        >
          Retour aux lieux d’activité
        </Button>
        <span className="fr-flex fr-direction-row fr-align-items-center fr-flex-gap-6v fr-mb-5w">
          <IconInSquare iconId="ri-home-office-line" />
          <h1 className="fr-page-title fr-m-0">Lieu d’activité</h1>
        </span>
        <CreateLieuActiviteForm
          onVisiblePourCartographieNationaleChange={setShowSideMenu}
        />
      </div>
    </>
  )
}
