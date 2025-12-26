'use client'

import LieuActiviteSideMenu from '@app/web/app/coop/(full-width-layout)/lieux-activite/_components/LieuActiviteSideMenu'
import CoopBreadcrumbs, {
  type CoopBreadcrumbsProps,
} from '@app/web/app/coop/CoopBreadcrumbs'
import BackButton from '@app/web/components/BackButton'
import { DisplayOnCartography } from '@app/web/components/structure/DisplayOnCartography'
import styles from '@app/web/components/structure/fields/StructureFormFields.module.css'
import { LieuAccueillantPublicTitle } from '@app/web/components/structure/titles/LieuAccueillantPublicTitle'
import { ServiceInclusionNumeriqueTitle } from '@app/web/components/structure/titles/ServiceInclusionNumeriqueTitle'
import { LieuActivitePageData } from '@app/web/features/lieux-activite/getLieuActivitePageData'
import { FraisAChargeLabel } from '@app/web/features/structures/fraisACharge'
import { Itinerance, ModaliteAcces } from '@prisma/client'
import classNames from 'classnames'
import React, { ReactNode, useState } from 'react'
import DescriptionEditCard from './description/DescriptionEditCard'
import InformationsGeneralesEditCard from './informations-generales/InformationsGeneralesEditCard'
import InformationsPratiquesEditCard from './informations-pratiques/InformationsPratiquesEditCard'
import ModalitesAccesAuServiceEditCard from './modalites-acces-au-service/ModalitesAccesAuServiceEditCard'
import ServicesEtAccompagnementEditCard from './services-et-accompagnement/ServicesEtAccompagnementEditCard'
import TypesDePublicsAccueillisEditCard from './types-de-publics-accueillis/TypesDePublicsAccueillisEditCard'
import VisiblePourCartographieNationaleFields from './VisiblePourCartographieNationaleFields'

export const LieuActivitePageContent = ({
  data: { structure },
  breadcrumbs,
  backButton,
}: {
  data: LieuActivitePageData
  breadcrumbs: CoopBreadcrumbsProps
  backButton: {
    label: string
    href: string
  }
}) => {
  const [showSideMenu, setShowSideMenu] = useState(
    structure.visiblePourCartographieNationale,
  )

  return (
    <>
      <div style={{ minWidth: '19em' }}>
        {showSideMenu && (
          <LieuActiviteSideMenu className="fr-hidden fr-unhidden-lg fr-mt-16w" />
        )}
      </div>
      <div
        className={classNames(
          'fr-container fr-container--narrow fr-ml-0 fr-mb-30v',
          styles.structureForm,
        )}
      >
        <CoopBreadcrumbs {...breadcrumbs} />
        <BackButton href={backButton.href}>{backButton.label}</BackButton>
        <h1 className="fr-page-title fr-h2">{structure.nom}</h1>
        <div className="fr-border fr-border-radius--8">
          <InformationsGeneralesEditCard {...structure} />
        </div>
        <div className="fr-border fr-border-radius--8 fr-mt-5w">
          <DisplayOnCartography
            canChangeVisibility={
              structure.structureCartographieNationaleId == null
            }
          />
          <hr className="fr-separator fr-separator-1px" />
          <VisiblePourCartographieNationaleFields
            className="fr-px-4w fr-py-3w"
            canChangeVisibility={
              structure.structureCartographieNationaleId == null
            }
            onChange={setShowSideMenu}
            {...structure}
          >
            <LieuAccueillantPublicTitle />
            <hr className="fr-separator-1px" />
            <DescriptionEditCard {...structure} />
            <hr className="fr-separator-1px fr-mx-4w" />
            <InformationsPratiquesEditCard
              {...structure}
              lieuItinerant={structure.itinerance.includes(
                Itinerance.Itinerant,
              )}
            />
            <hr className="fr-separator-1px" />
            <ServiceInclusionNumeriqueTitle />
            <hr className="fr-separator-1px" />
            <ServicesEtAccompagnementEditCard {...structure} />
            <hr className="fr-separator-1px fr-mx-4w" />
            <ModalitesAccesAuServiceEditCard
              id={structure.id}
              fraisACharge={structure.fraisACharge}
              modalitesAcces={{
                surPlace: structure.modalitesAcces.includes(
                  ModaliteAcces.SePresenter,
                ),
                parTelephone: structure.modalitesAcces.includes(
                  ModaliteAcces.Telephoner,
                ),
                parMail: structure.modalitesAcces.includes(
                  ModaliteAcces.ContacterParMail,
                ),
                numeroTelephone: structure.telephone,
                adresseMail: structure.courriels[0] ?? null,
              }}
            />
            <hr className="fr-separator-1px fr-mx-4w" />
            <TypesDePublicsAccueillisEditCard {...structure} />
          </VisiblePourCartographieNationaleFields>
        </div>
      </div>
    </>
  )
}
