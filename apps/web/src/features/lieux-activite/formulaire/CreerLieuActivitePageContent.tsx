'use client'

import IconInSquare from '@app/web/components/IconInSquare'
import LieuActiviteSideMenu from '@app/web/features/lieux-activite/ui/LieuActiviteSideMenu'
import Button from '@codegouvfr/react-dsfr/Button'
import { type ReactNode, useState } from 'react'
import CreerLieuActiviteForm from './CreerLieuActiviteForm'
import type { CreerLieuActiviteFormData } from './creerLieuActiviteFormData'

/**
 * Page de création d'un lieu d'activité, partagée par l'inscription et la
 * gestion des lieux : même mise en page, même formulaire. Ce qui change d'un
 * parcours à l'autre — le retour, le fil d'Ariane, l'enregistrement — est
 * injecté par la route.
 */
export const CreerLieuActivitePageContent = ({
  contentTop,
  retourHref,
  retourLabel = 'Retour aux lieux d’activité',
  nom,
  onCreer,
}: {
  contentTop?: ReactNode
  retourHref: string
  retourLabel?: string
  nom?: string
  onCreer: (data: CreerLieuActiviteFormData) => Promise<void>
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
        />
      </div>
    </div>
  )
}
