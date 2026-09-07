'use client'

import { DisplayOnCartography } from '@app/web/features/lieux-activite/ui/DisplayOnCartography'
import { LieuAccueillantPublicTitle } from '@app/web/features/lieux-activite/ui/titles/LieuAccueillantPublicTitle'
import { ServiceInclusionNumeriqueTitle } from '@app/web/features/lieux-activite/ui/titles/ServiceInclusionNumeriqueTitle'
import { formatDate } from '@app/web/utils/formatDate'
import type { ReactNode } from 'react'
import { BasculeVisibiliteCartographie } from '../components/BasculeVisibiliteCartographie'
import { SectionDescription } from '../components/SectionDescription'
import { SectionInformationsGenerales } from '../components/SectionInformationsGenerales'
import { SectionInformationsPratiques } from '../components/SectionInformationsPratiques'
import { SectionModalitesAccesAuService } from '../components/SectionModalitesAccesAuService'
import { SectionServicesEtAccompagnement } from '../components/SectionServicesEtAccompagnement'
import { SectionTypesDePublicsAccueillis } from '../components/SectionTypesDePublicsAccueillis'
import type { EnregistrerUneSection } from '../enregistrer-une-section'
import type { FicheAffichee } from '../fiche-du-lieu.presenter'

/**
 * La fiche d'un lieu : ses sept sections, consultées d'un bloc et corrigées
 * l'une après l'autre.
 *
 * Ce qui ne lui appartient pas — le fil d'Ariane, la liste des médiateurs qui
 * exercent ici — lui est passé en emplacement par la route. La feature
 * `mon-reseau` reste ainsi propriétaire de son annuaire, et cette page n'a
 * aucune raison d'aller la chercher.
 */
export const FicheDuLieuPage = ({
  fiche,
  enregistrer,
  entete,
  mediateurs,
}: {
  fiche: FicheAffichee
  enregistrer: EnregistrerUneSection
  entete?: ReactNode
  mediateurs?: ReactNode
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
    <h1 className="fr-page-title fr-h2">{fiche.nom}</h1>

    <div className="fr-border fr-border-radius--8 fr-mb-6v">
      <SectionInformationsGenerales
        id={fiche.id}
        informationsGenerales={fiche.informationsGenerales}
        enregistrer={enregistrer}
      />
    </div>

    {mediateurs}

    <div className="fr-border fr-border-radius--8 fr-mt-6v">
      <DisplayOnCartography
        isSharedWithCartography={fiche.connuDeLaCartographie}
      />
      <hr className="fr-separator fr-separator-1px" />
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
