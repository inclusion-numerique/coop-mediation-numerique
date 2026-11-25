'use client'

import Alert from '@codegouvfr/react-dsfr/Alert'
import type { Route } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { DisplayOnCartography } from '@/features/lieux-activite/ui/components/DisplayOnCartography'
import { LieuAccueillantPublicTitle } from '@/features/lieux-activite/ui/components/LieuAccueillantPublicTitle'
import { ServiceInclusionNumeriqueTitle } from '@/features/lieux-activite/ui/components/ServiceInclusionNumeriqueTitle'
import { formatDate } from '@/libraries/date'
import type { EnregistrerUneSection } from '../hooks/use-enregistrement-de-section'
import type { FicheAffichee } from '../presenters/fiche-du-lieu.presenter'
import { BandeauRepriseExterne } from './BandeauRepriseExterne'
import { BasculeVisibiliteCartographie } from './BasculeVisibiliteCartographie'
import { SectionDescription } from './sections/SectionDescription'
import { SectionInformationsGenerales } from './sections/SectionInformationsGenerales'
import { SectionInformationsPratiques } from './sections/SectionInformationsPratiques'
import { SectionModalitesAccesAuService } from './sections/SectionModalitesAccesAuService'
import { SectionServicesEtAccompagnement } from './sections/SectionServicesEtAccompagnement'
import { SectionTypesDePublicsAccueillis } from './sections/SectionTypesDePublicsAccueillis'

export const FicheDuLieuPage = ({
  fiche,
  enregistrer,
  entete,
  mediateurs,
  creerUnLieuHref,
}: {
  fiche: FicheAffichee
  enregistrer: EnregistrerUneSection
  entete?: ReactNode
  mediateurs?: ReactNode
  creerUnLieuHref?: Route | undefined
}) => (
  <div
    className="fr-pr-0 fr-ml-0 fr-mb-30v fr-width-full"
    style={{ maxWidth: 792 }}
  >
    {entete}
    <p className="fr-text--xs fr-mb-3v">
      Mis à jour le {formatDate(fiche.misAJourLe, 'dd.MM.yyyy')}{' '}
      {fiche.misAJourPar ? `par ${fiche.misAJourPar}` : ''}
    </p>
    {fiche.repriseExterne && fiche.repriseExterne.differences.length > 0 && (
      <BandeauRepriseExterne lieuId={fiche.id} reprise={fiche.repriseExterne} />
    )}

    <h1 className="fr-page-title fr-h2">{fiche.nom}</h1>

    {fiche.partage != null && (
      <Alert
        className="fr-mb-6v"
        severity="info"
        small
        title="D’autres personnes travaillent sur ce lieu"
        description={
          <>
            {fiche.partage.message} Une modification de sa fiche vaut pour tous.{' '}
            {creerUnLieuHref != null && (
              <Link href={creerUnLieuHref} className="fr-link">
                Ce n’est plus le même lieu ? Créez un nouveau lieu
              </Link>
            )}
          </>
        }
      />
    )}

    <div className="fr-border fr-border-radius--8 fr-mb-6v">
      <SectionInformationsGenerales
        id={fiche.id}
        informationsGenerales={fiche.informationsGenerales}
        enregistrer={enregistrer}
        partage={fiche.partage}
        creerUnLieuHref={creerUnLieuHref}
      />
    </div>

    {mediateurs}

    <div className="fr-border fr-border-radius--8 fr-mt-6v">
      <DisplayOnCartography
        isSharedWithCartography={fiche.connuDeLaCartographie}
      />
      <hr className="fr-separator fr-separator-1px" />
      {fiche.informationsGenerales.banId == null && (
        <div className="fr-px-4w fr-pt-3w">
          <Alert
            severity="warning"
            small
            description="L’adresse de ce lieu n’est pas reconnue par la Base Adresse Nationale : modifiez-la dans « Informations générales » pour pouvoir le rendre visible sur la cartographie."
          />
        </div>
      )}
      <BasculeVisibiliteCartographie
        id={fiche.id}
        publie={fiche.publieSurLaCartographie}
        enregistrer={enregistrer}
      >
        <LieuAccueillantPublicTitle />
        <hr className="fr-separator-1px" />
        <SectionDescription
          id={fiche.id}
          description={fiche.description}
          enregistrer={enregistrer}
        />
        <hr className="fr-separator-1px fr-mx-4w" />
        <SectionInformationsPratiques
          id={fiche.id}
          informationsPratiques={fiche.informationsPratiques}
          enregistrer={enregistrer}
        />
        <hr className="fr-separator-1px" />
        <ServiceInclusionNumeriqueTitle />
        <hr className="fr-separator-1px" />
        <SectionServicesEtAccompagnement
          id={fiche.id}
          servicesEtAccompagnement={fiche.servicesEtAccompagnement}
          enregistrer={enregistrer}
        />
        <hr className="fr-separator-1px fr-mx-4w" />
        <SectionModalitesAccesAuService
          id={fiche.id}
          modalitesAccesAuService={fiche.modalitesAccesAuService}
          enregistrer={enregistrer}
        />
        <hr className="fr-separator-1px fr-mx-4w" />
        <SectionTypesDePublicsAccueillis
          id={fiche.id}
          typesDePublicsAccueillis={fiche.typesDePublicsAccueillis}
          enregistrer={enregistrer}
        />
      </BasculeVisibiliteCartographie>
    </div>
  </div>
)
