'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import { type ReactNode, useState } from 'react'
import LieuActiviteSideMenu from '@/features/lieux-activite/abilities/creer-lieu-activite/ui/components/LieuActiviteSideMenu'
import { IconInSquare } from '@/libraries/ui/components'
import CreerLieuActiviteForm from '../../../../ui/forms/creation/CreerLieuActiviteForm'
import type { CreerLieuActiviteFormData } from '../../../../ui/forms/creer-lieu-activite.form-data'

export const CreerLieuActivitePageContent = ({
  contentTop,
  retourHref,
  retourLabel = 'Retour aux lieux d’activité',
  nom,
  onCreer,
  lienDePriseDeRendezVous,
}: {
  contentTop?: ReactNode
  retourHref: string
  retourLabel?: string
  nom?: string
  onCreer: (data: CreerLieuActiviteFormData) => Promise<void>
  lienDePriseDeRendezVous: string
}) => {
  const [showSideMenu, setShowSideMenu] = useState(false)

  return (
    <div className="fr-container fr-layout--side-menu" style={{ flex: 1 }}>
      <div className="fr-hidden fr-unhidden-lg fr-mt-30v fr-pt-23v fr-layout__side-menu">
        {showSideMenu && <LieuActiviteSideMenu />}
      </div>
      <div className="fr-container fr-container--narrow fr-ml-0 fr-mb-30v fr-layout__side-menu-content">
        {contentTop}
        <Button
          priority="tertiary no outline"
          size="small"
          linkProps={{ href: retourHref }}
          className="fr-mt-2v fr-mb-10v"
          iconId="fr-icon-arrow-left-line"
        >
          {retourLabel}
        </Button>
        <span className="fr-flex fr-direction-row fr-align-items-center fr-flex-gap-6v fr-mb-5w">
          <IconInSquare iconId="ri-home-office-line" />
          <h1 className="fr-page-title fr-m-0">Lieu d’activité</h1>
        </span>
        <CreerLieuActiviteForm
          nom={nom}
          annulerHref={retourHref}
          onCreer={onCreer}
          onVisiblePourCartographieNationaleChange={setShowSideMenu}
          lienDePriseDeRendezVous={lienDePriseDeRendezVous}
        />
      </div>
    </div>
  )
}
