'use client'

import LieuActiviteSideMenu from '@app/web/app/coop/(full-width-layout)/lieux-activite/_components/LieuActiviteSideMenu'
import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import BackButton from '@app/web/components/BackButton'
import { DisplayOnCartography } from '@app/web/components/structure/DisplayOnCartography'
import styles from '@app/web/components/structure/fields/StructureFormFields.module.css'
import { LieuAccueillantPublicTitle } from '@app/web/components/structure/titles/LieuAccueillantPublicTitle'
import { ServiceInclusionNumeriqueTitle } from '@app/web/components/structure/titles/ServiceInclusionNumeriqueTitle'
import { LieuActivitePageData } from '@app/web/features/lieux-activite/getLieuActivitePageData'
import { getDepartementCodeForLieu } from '@app/web/features/mon-reseau/getDepartementCodeForLieu'
import { getMonReseauBreadcrumbParents } from '@app/web/features/mon-reseau/getMonReseauBreadcrumbParents'
import RemoveMediateurFromLieuModal from '@app/web/features/mon-reseau/use-cases/acteurs/components/RemoveMediateurFromLieuModal/RemoveMediateurFromLieuModal'
import { getActeurDisplayName } from '@app/web/features/mon-reseau/use-cases/acteurs/getActeurDisplayName'
import LieuMediateursEnActivite from '@app/web/features/mon-reseau/use-cases/lieux/components/LieuMediateursEnActivite'
import { formatDate } from '@app/web/utils/formatDate'
import { Itinerance, ModaliteAcces } from '@prisma/client'
import classNames from 'classnames'
import React, { useState } from 'react'
import DescriptionEditCard from './description/DescriptionEditCard'
import InformationsGeneralesEditCard from './informations-generales/InformationsGeneralesEditCard'
import InformationsPratiquesEditCard from './informations-pratiques/InformationsPratiquesEditCard'
import ModalitesAccesAuServiceEditCard from './modalites-acces-au-service/ModalitesAccesAuServiceEditCard'
import ServicesEtAccompagnementEditCard from './services-et-accompagnement/ServicesEtAccompagnementEditCard'
import TypesDePublicsAccueillisEditCard from './types-de-publics-accueillis/TypesDePublicsAccueillisEditCard'
import VisiblePourCartographieNationaleFields from './VisiblePourCartographieNationaleFields'

export const LieuActivitePageContent = ({
  data: { structure },
  canRemoveMediateurFromLieu,
}: {
  data: LieuActivitePageData
  canRemoveMediateurFromLieu: boolean
}) => {
  const departementCode = getDepartementCodeForLieu(structure)

  const [showSideMenu, setShowSideMenu] = useState(
    structure.visiblePourCartographieNationale,
  )

  const formattedModificationDate = formatDate(
    new Date(structure.modification),
    'dd.MM.yyyy',
  )

  const derniereModificationPar = structure.derniereModificationPar
    ? getActeurDisplayName(structure.derniereModificationPar)
    : null

  return (
    <>
      <div className="fr-hidden fr-unhidden-lg" style={{ minWidth: '302px' }}>
        {showSideMenu && <LieuActiviteSideMenu className="fr-mt-16w" />}
      </div>
      <div
        className={classNames(
          'fr-pr-0 fr-ml-0 fr-mb-30v',
          styles.structureForm,
        )}
        style={{ maxWidth: 792 }}
      >
        <CoopBreadcrumbs
          parents={[
            ...getMonReseauBreadcrumbParents({ code: departementCode }),
            {
              label: "Annuaire des lieux d'activités",
              linkProps: {
                href: `/coop/mon-reseau/${departementCode}/lieux`,
              },
            },
          ]}
          currentPage={structure.nom}
        />
        <BackButton className="fr-mt-8v" />
        <p className="fr-text--xs fr-mb-3v">
          Mis à jour le {formattedModificationDate}{' '}
          {derniereModificationPar ? `par ${derniereModificationPar}` : ''}
        </p>
        <h1 className="fr-page-title fr-h2">{structure.nom}</h1>
        <div className="fr-border fr-border-radius--8 fr-mb-6v">
          <InformationsGeneralesEditCard
            {...structure}
            lieuItinerant={structure.itinerance.includes(Itinerance.Itinerant)}
          />
        </div>
        <LieuMediateursEnActivite
          mediateurs={structure.mediateursEnActivite}
          departementCode={departementCode}
          canRemoveMediateurFromLieuId={
            canRemoveMediateurFromLieu ? structure.id : null
          }
          structureNom={structure.nom}
        />
        {canRemoveMediateurFromLieu && <RemoveMediateurFromLieuModal />}
        <div className="fr-border fr-border-radius--8 fr-mt-6v">
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
            <InformationsPratiquesEditCard {...structure} />
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
      <div
        className="fr-hidden fr-unhidden-lg"
        style={{ minWidth: '302px' }}
      ></div>
    </>
  )
}
